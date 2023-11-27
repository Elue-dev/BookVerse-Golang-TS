package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/elue-dev/bookVerse/controllers"
	"github.com/elue-dev/bookVerse/helpers"
	"github.com/elue-dev/bookVerse/models"
)

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

	file, _, err := r.FormFile("avatar")
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Please provide an avatar", err.Error())
		return
	}
	defer file.Close()

	cld, err := cloudinary.New()
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to initialize Cloudinary", err.Error())
		return
	}

	var ctx = context.Background()

	uploadResult, err := cld.Upload.Upload(
		ctx,
		file,
		uploader.UploadParams{PublicID: "avatar"})

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to upload avatar", err.Error())
		return
	}

	user.Avatar = uploadResult.SecureURL

	result, err := controllers.RegisterUser(user)

	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not create account. Please try again.", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusCreated, result)
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
