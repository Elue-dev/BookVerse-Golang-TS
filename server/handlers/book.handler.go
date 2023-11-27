package handlers

import (
	"net/http"

	"github.com/elue-dev/bookVerse/controllers"
	"github.com/elue-dev/bookVerse/helpers"
)

func GetAllBooks(w http.ResponseWriter, r *http.Request) {
	result, err := controllers.GetBooks()
	
	if err != nil {
		helpers.SendErrorResponse(w, 500, "Something went wrong while fetching books", err)
	}

	helpers.SendSuccessResponseWithData(w, 200, result)
}