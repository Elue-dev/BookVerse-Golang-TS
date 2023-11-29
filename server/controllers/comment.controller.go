package controllers

import (
	"errors"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
)

func AddComment(c models.Comment) (models.Comment, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var comment models.Comment

	sqlQuery := `
		INSERT INTO comments 
		(message, bookid, userid) 
		VALUES ($1, $2, $3) RETURNING *
	 `

	err := db.QueryRow(sqlQuery,
		c.Message,
		c.BookId,
		c.UserId,
	).
		Scan(&comment.ID,
			&comment.Message,
			&comment.UserId,
			&comment.BookId,
			&comment.CreatedAt,
			&comment.UpdatedAt,
		)

	if err != nil {
		return comment, errors.New(err.Error())
	}

	return comment, nil
}
