package helpers

import (
	"encoding/json"
	"net/http"

	"github.com/elue-dev/bookVerse/models"
)

func SendSuccessResponse (w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(models.SuccessResponse{
		Success: true,
		Message: message,
	})
}