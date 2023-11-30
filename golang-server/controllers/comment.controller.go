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
