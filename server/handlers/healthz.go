package handlers

import (
	"net/http"

	"github.com/elue-dev/bookVerse/helpers"
)

func CheckServerHealth(w http.ResponseWriter, r *http.Request) {
	helpers.SendSuccessResponse(w, 200, "Server is healthy")
}