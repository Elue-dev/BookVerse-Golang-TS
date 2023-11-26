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

    // Parse the JWT token
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte(os.Getenv("JWT_SECRET")), nil
    })

    if err != nil {
        return models.User{}, err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        userID, ok := claims["user"].(string)
        if !ok {
            return models.User{}, errors.New("invalid token format")
			fmt.Println(userID)
        }

        // Query the database for the user based on the extracted email
        var user models.User
        // result := db.Where("id = ?", userID).First(&user)

        // if result.Error != nil {
        //     return models.User{}, result.Error
        // }

        return user, nil
    }

    return models.User{}, errors.New("invalid token")
}



