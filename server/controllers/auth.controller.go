package controllers

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
)

func RegisterUser(u models.User) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery :=
		`
		INSERT INTO users 
		(username, email, password, avatar)
	    VALUES ($1, $2, $3, $4)
	 	RETURNING *
		 `

	var user models.User

	err := db.QueryRow(sqlQuery,
		u.Username,
		u.Email,
		u.Password,
		u.Avatar).Scan(&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Avatar,
		&user.CreatedAt,
		&user.UpdatedAt)

	if err != nil {
		fmt.Printf("Failed to execute insert query: %v", err)
		return user, errors.New(err.Error())
	}

	return user, nil
}

func LoginUser(p models.LoginPayload) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := `
		SELECT * FROM users
		 WHERE lower(email) = $1 
		OR lower(username) = $2
		 `

	var user models.User

	rows := db.QueryRow(sqlQuery,
		strings.ToLower(p.EmailOrUsername),
		strings.ToLower(p.EmailOrUsername))

	err := rows.Scan(&user.ID,
		&user.Username,
		&user.Email,
		&user.Password,
		&user.Avatar,
		&user.CreatedAt,
		&user.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return user, errors.New("invalid credentials provided")
		}
		fmt.Printf("Failed to scan row: %v", err)
		return user, errors.New(err.Error())
	}

	return user, nil
}
