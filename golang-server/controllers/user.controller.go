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

func ModifyUser(u models.User) (models.UserResponse, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var user models.UserResponse

	sqlQuery := `UPDATE users 
		SET username = $2,
		password = $3,
		avatar = $4 
		WHERE id = $1
	    RETURNING id, username, email, avatar, createdat, updatedat
	   `

	rows := db.QueryRow(
		sqlQuery,
		u.ID,
		u.Username,
		u.Password,
		u.Avatar,
	)

	err := rows.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Avatar,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return user, errors.New(err.Error())
	}

	return user, nil
}
