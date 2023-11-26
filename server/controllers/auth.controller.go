package controllers

import (
	"errors"
	"fmt"

	"github.com/elue-dev/bookVerse/connections"
	"github.com/elue-dev/bookVerse/models"
)

func RegisterUser(u models.User) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := `INSERT INTO users (username, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING *`
	var user models.User

	err := db.QueryRow(sqlQuery, u.Username, u.Email, u.Password, u.Avatar).Scan(&u.ID, &u.Username, &u.Email, &u.Password, &u.Avatar, &u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		fmt.Printf("Failed to execute insert query: %v", err)
		return user, errors.New("failed to execute insert query")
	}

	return user, nil
}