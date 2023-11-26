package controllers

import (
	"errors"
	"fmt"

	"github.com/elue-dev/bookVerse/connections"
	"github.com/elue-dev/bookVerse/models"
)

func RegisterUser(u models.User) (models.User, error) {
	fmt.Println("USER", u)
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := `INSERT INTO users 
				 (username, email, password, avatar)
	 			 VALUES ($1, $2, $3, $4)
	 			 RETURNING *`

	var user models.User

	err := db.QueryRow(sqlQuery, u.Username, u.Email, u.Password, u.Avatar).Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Avatar, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		fmt.Printf("Failed to execute insert query: %v", err)
		return user, errors.New(err.Error())
	}

	return user, nil
}