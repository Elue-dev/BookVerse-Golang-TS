package handlers

import (
	"net/http"

	"github.com/elue-dev/bookVerse/controllers"
	"github.com/elue-dev/bookVerse/helpers"
	"github.com/elue-dev/bookVerse/models"
)

func GetAllBooks(w http.ResponseWriter, r *http.Request) {
	result, err := controllers.GetBooks()
	
	if err != nil {
		helpers.SendErrorResponse(w, 500, "Something went wrong while fetching books", err)
	}

	helpers.SendSuccessResponseWithData(w, 200, result)
}

func AddBook(w http.ResponseWriter, r *http.Request) {
	var book models.Book

	err := r.ParseMultipartForm(10 << 20)
    if err != nil {
		helpers.SendErrorResponse(w, 400, "Please provide all required fields for this book (title, description, price, image, userid, )", err.Error())
        return
    }

	// isValidated = helpers.ValidateBookFields()
}