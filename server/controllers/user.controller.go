package controllers

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
)

func GetUser(userId string) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var user models.User

	sqlQuery := "SELECT * FROM users WHERE id = $1"

	rows := db.QueryRow(sqlQuery, userId)

	err := rows.Scan(&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Avatar,
		&user.CreatedAt,
		&user.UpdatedAt)

	switch err {
	case sql.ErrNoRows:
		fmt.Println("No rows were returned.")
		return user, errors.New("user with id of " + userId + " could not be found")
	case nil:
		return user, nil
	default:
		fmt.Println("No rows were returned.")
	}

	return user, nil
}

// func GetUsers() (models.User, error) {
// 	db := connections.CeateConnection()
// 	defer db.Close()

// 	var user models.User

// 	sqlQuery := "SELECT * FROM users WHERE id = $1"
// }
