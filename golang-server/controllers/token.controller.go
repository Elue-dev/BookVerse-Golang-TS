package controllers

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/lib/pq"
)

func AddToken(token, userId string, expiresAt time.Time) error {
	db := connections.CeateConnection()
	defer db.Close()

	var t models.Token

	sqlQuery := "INSERT INTO tokens (token, userid, expiresat) VALUES ($1, $2, $3) RETURNING *"

	err := db.QueryRow(sqlQuery, token, userId, expiresAt).Scan(
		&t.ID,
		&t.Token,
		&t.UserId,
		&t.ExpiresAt,
		&t.CreatedAt,
	)

	if err != nil {
		fmt.Printf("Failed to execute insert query: %v", err)
		return errors.New(err.Error())
	}

	return nil
}

func GetToken(userId string) (models.Token, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var token models.Token

	sqlQuery := "SELECT * FROM tokens WHERE userid = $1 ORDER BY createdat DESC LIMIT 1"

	rows := db.QueryRow(sqlQuery, userId)

	err := rows.Scan(
		&token.ID,
		&token.UserId,
		&token.ExpiresAt,
		&token.CreatedAt,
		&token.Token,
	)

	switch err {
	case sql.ErrNoRows:
		return token, fmt.Errorf("token with the userId of %v could not be found", userId)
	case nil:
		return token, nil
	default:
		fmt.Println("No rows were returned.")
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "22P02" {
				return token, fmt.Errorf("token with userId of %v could not be found", userId)
			}
		}
	}

	return token, nil
}

func RemoveToken(tokenId string) error {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := "DELETE FROM tokens WHERE id = $1"

	res, err := db.Exec(sqlQuery, tokenId)
	if err != nil {
		return errors.New(err.Error())
	}

	_, err = res.RowsAffected()
	if err != nil {
		return errors.New(err.Error())
	}

	return nil
}
