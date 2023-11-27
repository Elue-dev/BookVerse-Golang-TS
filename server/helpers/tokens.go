package helpers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/elue-dev/bookVerse/connections"
	"github.com/elue-dev/bookVerse/controllers"
	"github.com/elue-dev/bookVerse/models"
)

func GenerateToken(userID string) (string, error) {
	secretKey := []byte(os.Getenv("JWT_SECRET"))
	expirationTime := time.Now().Add(24 * time.Hour).Unix() // 1 day

	claims := jwt.MapClaims{
		"user": userID,
		"exp":  expirationTime,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func getTokenFromHeaders(r *http.Request) (string, error) {
	headers := r.Header.Get("Authorization")
	if headers == "" {
		return "", errors.New("no Authorization headers found")
	}

	tokenStr := strings.Split(headers, " ")
	if len(tokenStr) != 2 {
		return "", errors.New("headers should follow the pattern: Authorization: Bearer token")
	}
	if tokenStr[1] == "" {
		return "", errors.New("token not found in request headers")
	}

	return tokenStr[1], nil
}

func GetUserFromToken(r *http.Request) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	tokenString, err := getTokenFromHeaders(r)
	if err != nil {
		return models.User{}, errors.New("you are not authorized. headers should follow the pattern: Authorization: Bearer token")
	}
	// Parse JWT token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return models.User{}, errors.New("token malformed")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userId, ok := claims["user"].(string)
		if !ok {
			fmt.Println(userId)
			return models.User{}, errors.New("invalid token format")
		}

		currUser, err := controllers.GetUser(userId)
		if err != nil {
			return models.User{}, err
		}

		return currUser, nil
	} else {
		return models.User{}, errors.New("invalid token provided")
	}
}
