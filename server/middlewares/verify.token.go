package middlewares

import (
	"context"
	"net/http"

	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
)

type contextKey string

const userKey contextKey = "user"

func VerifyAuthStatus(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := helpers.GetUserFromToken(r)

		if err != nil {
			helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
			return
		}

		// Add user to request context
		ctx := context.WithValue(r.Context(), userKey, user)

		// Call the next handler with the updated context
		next(w, r.WithContext(ctx))
	}
}
