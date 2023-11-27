package controllers

import (
	"errors"

	"github.com/elue-dev/bookVerse/connections"
	"github.com/elue-dev/bookVerse/models"
)

func GetUser (userId string) (models.User, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var user models.User

	sqlQuery := "SELECT * FROM users WHERE id = $1"

	rows := db.QueryRow(sqlQuery, userId)

	err := rows.Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Avatar, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return user, errors.New(err.Error())
	}

	return user, nil
}