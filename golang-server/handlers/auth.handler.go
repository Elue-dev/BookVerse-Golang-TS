package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reflect"
	"sync"
	"time"

	"github.com/elue-dev/BookVerse-Golang-TS/controllers"
	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	rabbitmq "github.com/elue-dev/BookVerse-Golang-TS/rabbitMQ"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

var wg sync.WaitGroup

func SignUp(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide username, email and password", err.Error())
		return
	}

	user.Username = r.FormValue("username")
	user.Email = r.FormValue("email")
	user.Password = r.FormValue("password")

	if isValidated := helpers.ValidateSignUpFields(user.Username, user.Email, user.Password); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide username, email and password", nil)
		return
	}

	hashedPassword, err := helpers.HashPassword(user.Password)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Something went wrong in hashing password", err.Error())
		return
	}

	user.Password = hashedPassword

	cloudURL, statusCode, err := helpers.UploadMediaToCloud(w, r, "avatar")
	if err != nil {
		helpers.SendErrorResponse(w, statusCode, "media upload error", err.Error())
		return
	}

	user.Avatar = cloudURL

	result, err := controllers.RegisterUser(user)

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not create account. Please try again.", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusCreated, result)

	wg.Add(1)

	go func() {
		defer wg.Done()
		callback := func(queueMsg models.QueueMessage) {
			fmt.Printf("Received from queue: %+v\n", queueMsg)
		}
		rabbitmq.ConsumeFromRabbitMQ("welcome_user_queue", callback)
	}()
}

func Login(w http.ResponseWriter, r *http.Request) {
	var payload models.LoginPayload

	json.NewDecoder(r.Body).Decode(&payload)

	if isValidated := helpers.ValidateLoginFields(payload.EmailOrUsername, payload.Password); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide username or email and password", nil)
		return
	}

	currUser, err := controllers.LoginUser(payload)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Invalid credentials provided", err.Error())
		return
	}

	if currUser.ID != "" && helpers.ComparePasswordWithHash(currUser.Password, payload.Password) {
		token, err := helpers.GenerateToken(currUser.ID)
		if err != nil {
			helpers.SendErrorResponse(w, http.StatusInternalServerError, "Error creating token", err.Error())
			return
		}

		helpers.SendLoginSuccessResponse(w, http.StatusOK, currUser, token)
	} else {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Invalid credentials provided", nil)
		return
	}
}

func CheckAuthStatus(w http.ResponseWriter, r *http.Request) {
	_, err := helpers.GetTokenFromHeaders(r)

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "you are not authoried", err.Error())

	}

	helpers.SendErrorResponse(w, http.StatusOK, "token is still valid", "token is valid")
}

func ForgotPassword(w http.ResponseWriter, r *http.Request) {
	type Payload struct {
		Email string `json:"email"`
	}

	var payload Payload
	queueName := "forgot_password_queue"
	randomUUID := uuid.New().String()

	json.NewDecoder(r.Body).Decode(&payload)

	if payload.Email == "" {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide the email associated with your account", "email not provided in request body")
		return
	}

	currUser, err := controllers.GetUser(randomUUID, payload.Email)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "could not find user", err.Error())
		return
	}

	if reflect.DeepEqual(currUser, models.User{}) {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "User with the provided email has not been registered", "could not find user")
		return
	}

	token, err := helpers.GenerateRandomToken(32)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Error creating token", err.Error())
		return
	}

	hashedToken, err := helpers.HashPassword(token)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Error creating token", err.Error())
		return
	}

	expiresAt := time.Now().Add(10 * time.Minute)

	err = controllers.AddToken(hashedToken, currUser.ID, expiresAt)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Error creating token", err.Error())
		return
	}

	responseChannel := make(chan models.QueueMessage)

	wg.Add(1)

	go func() {
		defer wg.Done()

		queueMessageHandlerCallback := func(queueMsg models.QueueMessage) {
			responseChannel <- queueMsg
		}

		rabbitmq.ConsumeFromRabbitMQ(queueName, queueMessageHandlerCallback)

	}()

	err = rabbitmq.SendToRabbitMQ(payload.Email, currUser.Username, currUser.ID, token, queueName)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "could not send message to queue", err.Error())
		return
	}

	queueMsg := <-responseChannel
	fmt.Println("queueMsg", queueMsg)

	if !queueMsg.Success {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "something went wrong", fmt.Sprintf("could not send email to %v", payload.Email))
		return
	}

	helpers.SendSuccessResponse(w, http.StatusOK, fmt.Sprintf("An email has been sent to %v with instructions to reset password", payload.Email))
}

func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var payload models.ResetPayload
	token := mux.Vars(r)["token"]
	userId := mux.Vars(r)["userId"]
	queueName := "resett_password_queue"

	json.NewDecoder(r.Body).Decode(&payload)

	if payload.NewPassword == "" || payload.ConfirmPassword == "" {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Both passsword credentials are required", "please provide both new_password and confirm_password")
		return
	}

	if payload.NewPassword != payload.ConfirmPassword {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "New passsword credentials do not match", "new_password and confirm_password do not match")
		return
	}

	result, err := controllers.GetToken(userId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Something went wrong", err.Error())
		return
	}

	if tokenIsCorrect := helpers.ComparePasswordWithHash(result.Token, token); !tokenIsCorrect {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Invalid or expired token", "token provided is either not valid or has expired")
		return
	}

	newPasswordHash, err := helpers.HashPassword(payload.NewPassword)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Error hashing new password", err.Error())
		return
	}

	err = controllers.ResetPassword(newPasswordHash, result.UserId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Error resetting password", err.Error())
		return
	}

	currUser, _ := controllers.GetUser(result.UserId, "")

	_ = controllers.RemoveToken(result.ID)

	_ = rabbitmq.SendToRabbitMQ(currUser.Email, currUser.Username, result.ID, "", queueName)

	helpers.SendSuccessResponse(w, http.StatusOK, "Password has been successfully reset")
}
