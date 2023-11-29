package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/elue-dev/BookVerse-Golang-TS/controllers"
	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/gorilla/mux"
)

func CreateComment(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment

	json.NewDecoder(r.Body).Decode(&comment)

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	comment.UserId = currUser.ID

	_, err = controllers.GetBook("", comment.BookId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Book with the provided id not found", err.Error())
		return
	}

	if isValidated := helpers.ValidateCommentFields(comment.Message, comment.BookId); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "message and book id are both required", "mising fields were detacted: message, book_id")
		return
	}

	_, err = controllers.AddComment(comment)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not add comment", err.Error())
		return
	}

	helpers.SendSuccessResponse(w, http.StatusCreated, "Comment added successfully")
}

func GetBookComments(w http.ResponseWriter, r *http.Request) {
	bookId := mux.Vars(r)["bookId"]

	currBook, err := controllers.GetBook("", bookId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Book with the provided book id not found", err.Error())
		return
	}

	books, err := controllers.GetCommentsForBook(bookId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, fmt.Sprintf("Could not get comments for this book: %v", currBook.Title), err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusOK, books)
}
