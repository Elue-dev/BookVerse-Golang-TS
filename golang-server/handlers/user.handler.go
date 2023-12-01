package handlers

import (
	"context"
	"net/http"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/elue-dev/BookVerse-Golang-TS/controllers"
	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/elue-dev/BookVerse-Golang-TS/utils"
	"github.com/gorilla/mux"
)

func GetSingleUser(w http.ResponseWriter, r *http.Request) {
	userId := mux.Vars(r)["id"]

	currUser, err := controllers.GetUser(userId)

	if err != nil {
		helpers.SendErrorResponse(w, 404, "User not found", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, 200, currUser)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	var user models.User

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide at least one user information to update", err.Error())
		return
	}

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	username := r.FormValue("username")
	providedPassword := r.FormValue("password")
	oldPassword := r.FormValue("old_password")

	if providedPassword != "" && oldPassword == "" {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Please provide your old password to change to a new one", "old_password not found in request body")
		return
	}

	if passwordIsValid := helpers.ComparePasswordWithHash(currUser.Password, oldPassword); !passwordIsValid {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Old Password is incorrect", "old password incorrect")
		return
	}

	user.ID = currUser.ID
	user.Username = utils.UpdateFieldBasedOfValuePresence(username, currUser.Username).(string)

	if providedPassword == "" {
		user.Password = currUser.Password
	} else {
		hashedPassword, err := helpers.HashPassword(providedPassword)
		if err != nil {
			helpers.SendErrorResponse(w, http.StatusBadRequest, "Something went wrong in hashing password", err.Error())
			return
		}

		user.Password = hashedPassword
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		user.Avatar = currUser.Avatar
	} else {
		if file != nil {
			cld, err := cloudinary.New()
			if err != nil {
				helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to initialize Cloudinary", err.Error())
				return
			}

			var ctx = context.Background()
			uploadResult, err := cld.Upload.Upload(
				ctx,
				file,
				uploader.UploadParams{PublicID: "book image"})

			if err != nil {
				helpers.SendErrorResponse(w, http.StatusInternalServerError, "Failed to upload avatar", err.Error())
				return
			}

			user.Avatar = uploadResult.SecureURL
		}
	}

	defer func() {
		if file != nil {
			file.Close()
		}
	}()

	newUser, err := controllers.ModifyUser(user)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not update user", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusOK, newUser)
}
