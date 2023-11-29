package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/elue-dev/BookVerse-Golang-TS/controllers"
	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
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
		helpers.SendErrorResponse(w, http.StatusNotFound, "Book with the provided id not found", fmt.Sprintf("Could not find book with id %v", comment.BookId))
		return
	}

	if isValidated := helpers.ValidateCommentFields(comment.Message, comment.BookId); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "message,and book id are both required", "mising fields were detacted: message, book_id")
		return
	}

	_, err = controllers.AddComment(comment)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not add comment", err.Error())
		return
	}

	helpers.SendSuccessResponse(w, http.StatusCreated, "Comment added successfully")
}
