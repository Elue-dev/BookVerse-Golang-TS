package controllers

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
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

func GetCommentsForBook(bookId string) ([]models.CommentWithUserFields, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var comments []models.CommentWithUserFields

	sqlQuery :=
		`
		 SELECT c.*, u.username, u.avatar AS userImg FROM comments c
		 JOIN users u 
		 ON c.userid = u.id 
		 WHERE c.bookid = $1 
		 ORDER BY createdat desc
		`

	rows, err := db.Query(sqlQuery, bookId)
	if err != nil {
		return comments, err
	}

	defer rows.Close()

	for rows.Next() {
		var comment models.CommentWithUserFields
		err = rows.Scan(
			&comment.ID,
			&comment.Message,
			&comment.UserId,
			&comment.BookId,
			&comment.CreatedAt,
			&comment.UpdatedAt,
			&comment.Username,
			&comment.UserImg,
		)

		if err != nil {
			return comments, err
		}

		comments = append(comments, comment)
	}

	return comments, nil
}

func GetComment(commentId string) (models.Comment, error) {
	var comment models.Comment

	if commentId == "" {
		return comment, errors.New("comment id cannot be empty")
	}

	_, err := uuid.Parse(commentId)
	if err != nil {
		return comment, fmt.Errorf("comment id of %v does not match the expected format", commentId)
	}

	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := "SELECT * FROM comments WHERE id = $1"

	rows := db.QueryRow(sqlQuery, commentId)

	err = rows.Scan(
		&comment.ID,
		&comment.Message,
		&comment.UserId,
		&comment.BookId,
		&comment.CreatedAt,
		&comment.UpdatedAt,
	)

	switch err {
	case sql.ErrNoRows:
		return comment, fmt.Errorf("comment with id of %v could not be found", commentId)
	case nil:
		return comment, nil
	default:
		fmt.Println("No rows were returned.")
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "22P02" {
				return comment, fmt.Errorf("book with slug of %v could not be found", commentId)
			}
		}
	}

	return comment, nil
}

func ModifyComment(commentId, message string) (int64, error) {

	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := "UPDATE comments SET message = $2 WHERE id = $1"

	res, err := db.Exec(sqlQuery, commentId, message)

	if err != nil {
		return 0, errors.New(err.Error())
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return 0, errors.New(err.Error())
	}

	return rowsAffected, nil
}

func RemoveComment(commentId string) (int64, error) {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := "DELETE FROM comments WHERE id = $1"

	res, err := db.Exec(sqlQuery, commentId)

	if err != nil {
		return 0, errors.New(err.Error())
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return 0, errors.New(err.Error())
	}

	return rowsAffected, nil
}
