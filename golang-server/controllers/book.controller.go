package controllers

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/elue-dev/BookVerse-Golang-TS/utils"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

func CreateBook(b models.Book) (models.Book, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var book models.Book

	sqlQuery := `
		INSERT INTO books 
		(title, description, price, image, userid, slug, category) 
		VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
	 `

	slug := utils.Slugify(b.Title)

	err := db.QueryRow(sqlQuery,
		b.Title,
		b.Description,
		b.Price,
		b.Image,
		b.UserId,
		slug,
		b.Category,
	).
		Scan(&book.ID,
			&book.Title,
			&book.Description,
			&book.Price,
			&book.Image,
			&book.UserId,
			&book.Slug,
			&book.Category,
			&book.CreatedAt,
			&book.UpdatedAt,
		)

	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			if pgErr.Code == "23505" {
				return book, errors.New("a book with this title already exists")
			}
		} else {
			return book, errors.New(err.Error())
		}
	}

	return book, nil
}

func GetBooks() ([]models.BookWithUsername, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var books []models.BookWithUsername

	sqlQuery := "SELECT b.*, u.username FROM books b JOIN users u ON b.userid = u.id ORDER BY createdat desc"
	rows, err := db.Query(sqlQuery)

	if err != nil {
		fmt.Println("Could not execute SQL query", err)
		return books, err
	}

	defer rows.Close()

	for rows.Next() {
		var book models.BookWithUsername
		var createdAt pq.NullTime
		var updatedAt pq.NullTime
		err = rows.Scan(
			&book.ID,
			&book.Title,
			&book.Description,
			&book.Price,
			&book.Image,
			&book.UserId,
			&book.Slug,
			&book.Category,
			&createdAt,
			&updatedAt,
			&book.Username,
		)
		if err != nil {
			return books, err
		}

		if createdAt.Valid {
			book.CreatedAt = createdAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		if updatedAt.Valid {
			book.UpdatedAt = updatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		books = append(books, book)
	}

	return books, nil
}

func GetBook(bookSlug, bookId string) (models.BookWithUsernameAndAvatar, error) {
	var book models.BookWithUsernameAndAvatar

	if bookId == "" {
		return book, errors.New("book id cannot be empty")
	}

	_, err := uuid.Parse(bookId)
	if err != nil {
		return book, fmt.Errorf("book id of %v does not match the expected format", bookId)
	}

	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := "SELECT b.*, u.username, u.avatar FROM books b JOIN users u ON b.userid = u.id WHERE b.slug = $1 OR b.id = $2"

	rows := db.QueryRow(sqlQuery, bookSlug, bookId)

	var createdAt pq.NullTime
	var updatedAt pq.NullTime

	err = rows.Scan(
		&book.ID,
		&book.Title,
		&book.Description,
		&book.Price,
		&book.Image,
		&book.UserId,
		&book.Slug,
		&book.Category,
		&createdAt,
		&updatedAt,
		&book.Username,
		&book.UserAvatar,
	)

	switch err {
	case sql.ErrNoRows:
		return book, fmt.Errorf("book with slug of %v or id of %v could not be found", bookSlug, bookId)
	case nil:
		return book, nil
	default:
		fmt.Println("No rows were returned.")
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "22P02" {
				return book, fmt.Errorf("book with slug of %v could not be found", bookSlug)
			}
		}
	}

	if createdAt.Valid {
		book.CreatedAt = createdAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	if updatedAt.Valid {
		book.UpdatedAt = updatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
	}

	return book, nil
}

func ModifyBook(todoId string, b models.Book) (int64, error) {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := `
		UPDATE books 
		SET title = $2, description = $3, price = $4, image = $5, category = $6
	 	WHERE id = $1
	`

	res, err := db.Exec(sqlQuery,
		todoId,
		b.Title,
		b.Description,
		b.Price,
		b.Image,
		b.Category,
	)

	if err != nil {
		return 0, errors.New(err.Error())
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return 0, errors.New(err.Error())
	}

	return rowsAffected, nil
}

func DeleteBook(todoId string) (int64, error) {
	db := connections.CeateConnection()
	defer db.Close()

	sqlQuery := "DELETE FROM books WHERE id = $1"

	res, err := db.Exec(sqlQuery, todoId)
	if err != nil {
		return 0, errors.New(err.Error())
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return 0, errors.New(err.Error())
	}

	return rowsAffected, nil
}

func GetUserBooks(userId string) ([]models.Book, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var books []models.Book

	sqlQuery := "SELECT * FROM books WHERE userid = $1 ORDER BY createdat desc"

	rows, err := db.Query(sqlQuery, userId)
	if err != nil {
		return books, err
	}

	defer rows.Close()

	for rows.Next() {
		var book models.Book
		var createdAt pq.NullTime
		var updatedAt pq.NullTime
		err = rows.Scan(
			&book.ID,
			&book.Title,
			&book.Description,
			&book.Price,
			&book.Image,
			&book.UserId,
			&book.Slug,
			&book.Category,
			&createdAt,
			&updatedAt,
		)
		if err != nil {
			return books, err
		}

		if createdAt.Valid {
			book.CreatedAt = createdAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		if updatedAt.Valid {
			book.UpdatedAt = updatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		books = append(books, book)
	}

	return books, nil
}
