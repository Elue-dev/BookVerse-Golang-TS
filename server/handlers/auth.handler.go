package handlers

import (
	"context"
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
		helpers.SendErrorResponse(w, 400, "Please provide username, email and password", err.Error())
        return
    }

	user.Username = r.FormValue("username")
    user.Email = r.FormValue("email")
    user.Password = r.FormValue("password")


	if isValidated := helpers.ValidateSignUpFields(user.Username, user.Email, user.Password); !isValidated {
		helpers.SendErrorResponse(w, 400, "Please provide username, email and password", nil)
        return
	}

	hashedPassword, err := helpers.HashPassword(user.Password)
	 if err != nil {
		helpers.SendErrorResponse(w, 400, "Something went wrong in hashing password",  err.Error())
		 return
	 }

	 user.Password = hashedPassword
	 
	 file, _, err := r.FormFile("avatar")
	 if err != nil {
		helpers.SendErrorResponse(w, 400, "Failed to get avatar from form",  err.Error())
		return
	}
	defer file.Close()

	cld, err := cloudinary.New()
	if err != nil {
		helpers.SendErrorResponse(w, 400, "Failed to initialize Cloudinary",  err.Error())
		return
	}

	var ctx = context.Background()
	
	uploadResult, err := cld.Upload.Upload(
		ctx,
		file,
		uploader.UploadParams{PublicID: "avatar"})

	if err != nil {
		helpers.SendErrorResponse(w, 400, "Failed to upload avatar",  err.Error())
		return
	}
 
	user.Avatar = uploadResult.SecureURL

	result, err := controllers.RegisterUser(user)

	if err != nil {
		helpers.SendErrorResponse(w, 400, "Could not create account. Please try again.",  err.Error())
		return
	}
 

	helpers.SendSuccessResponseWithData(w, 201, result)
}