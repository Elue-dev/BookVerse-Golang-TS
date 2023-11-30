package helpers

import (
	"encoding/json"
	"net/http"

	"github.com/elue-dev/BookVerse-Golang-TS/models"
)

func SendSuccessResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.SuccessResponse{
		Success: true,
		Message: message,
	})
}

func SendSuccessResponseWithData(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.SuccessResponseWithData{
		Success: true,
		Data:    data,
	})
}

func SendLoginSuccessResponse(w http.ResponseWriter, statusCode int, data interface{}, token string) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.LoginResponse{
		Success: true,
		Token:   token,
		Data:    data,
	})
}

func SendErrorResponse(w http.ResponseWriter, statusCode int, errorMsg string, error interface{}) {
	w.Header().Set("Content-Type", "application/json")

	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.ErrResponse{
		Success:      false,
		Message:      errorMsg,
		ErrorDetails: error,
	})
}
