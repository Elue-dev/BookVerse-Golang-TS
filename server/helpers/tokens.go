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

func getTokenFromHeaders(r *http.Request) string {
	headers := r.Header.Get("Authorization")
	tokenStr := strings.Split(headers, " ")
	return tokenStr[1]
}

func GetUserFromToken(r *http.Request) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	tokenString := getTokenFromHeaders(r)

    // Parse JWT token
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })

    if err != nil {
        return models.User{}, err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        userID, ok := claims["user"].(string)
        if !ok {
			fmt.Println(userID)
            return models.User{}, errors.New("invalid token format")
        }

        var user models.User
        currUser, err := controllers.GetUser(userID)

		if err != nil {
			return user, err
		}

        return currUser, nil
    }

    return models.User{}, errors.New("invalid token")
}



