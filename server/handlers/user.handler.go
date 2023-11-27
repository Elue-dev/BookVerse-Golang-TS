package handlers

import (
	"net/http"

	"github.com/elue-dev/BookVerse-Golang-TS/controllers"
	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
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
