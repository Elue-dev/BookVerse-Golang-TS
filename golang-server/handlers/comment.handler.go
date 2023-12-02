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

func GetSingleComment(w http.ResponseWriter, r *http.Request) {
	commentId := mux.Vars(r)["id"]

	result, err := controllers.GetComment(commentId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not get comment", err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusOK, result)
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

func UpdateComment(w http.ResponseWriter, r *http.Request) {
	commentId := mux.Vars(r)["id"]

	var comment models.Comment

	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Comment message is required", err.Error())
		return
	}

	currComment, err := controllers.GetComment(commentId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Comment could not be found", fmt.Sprintf("comment with id of %v does not exist", commentId))
		return
	}

	if currComment.Message == comment.Message {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "New comment is same as old comment", "new comment and old comment should be different")
		return
	}

	_, err = controllers.GetBook("", comment.BookId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Book with the provided book id not found", err.Error())
		return
	}

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	if currComment.UserId != currUser.ID {
		helpers.SendErrorResponse(w, http.StatusForbidden, "You can only edit comments you added", "comment user_id and request user id do not match")
		return
	}

	_, err = controllers.ModifyComment(commentId, comment.Message)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not edit comment", err.Error())
		return
	}

	helpers.SendSuccessResponse(w, http.StatusOK, "Comment updated successfully")
}

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	commentId := mux.Vars(r)["commentId"]
	bookId := mux.Vars(r)["bookId"]

	_, err := controllers.GetComment(commentId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Comment could not be found", fmt.Sprintf("comment with id of %v does not exist", commentId))
		return
	}

	currComment, err := controllers.GetComment(commentId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Comment could not be found", fmt.Sprintf("comment with id of %v does not exist", commentId))
		return
	}

	_, err = controllers.GetBook("", bookId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusNotFound, "Book with the provided book id not found", err.Error())
		return
	}

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	if currComment.UserId != currUser.ID {
		helpers.SendErrorResponse(w, http.StatusForbidden, "You can only delete comments you added", "comment user_id and request user id do not match")
		return
	}

	_, err = controllers.RemoveComment(commentId)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not delete comment", err.Error())
		return
	}

	helpers.SendSuccessResponse(w, http.StatusOK, "Comment deleted successfully")
}
