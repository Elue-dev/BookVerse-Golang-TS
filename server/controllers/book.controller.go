package controllers

import (
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/elue-dev/bookVerse/connections"
	"github.com/elue-dev/bookVerse/models"
	"github.com/elue-dev/bookVerse/utils"
	"github.com/lib/pq"
)

func CreateBook(b models.Book) (models.Book, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var book models.Book

	sqlQuery := `INSERT INTO books
				 (title, description, price, image, userid, slug, category) 
	 			 VALUES ($1, $2, $3, $4, $5, $6, $7)
	  			 RETURNING *`

	slug := utils.Slugify(b.Title)

	err := db.QueryRow(sqlQuery, b.Title, b.Description, b.Price, b.Image, b.UserId, slug, b.Category).Scan(&book.ID, &book.Title, &book.Description, &book.Price, &book.Image, &book.UserId, &book.Slug, &book.Category, &book.CreatedAt, &book.UpdatedAt)

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

func GetBooks() ([]models.Book, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var books []models.Book

	sqlQuery := "SELECT * FROM books"
	rows, err := db.Query(sqlQuery)

	if err != nil {
		fmt.Println("Could not execute SQL query", err)
		return books, err
	}

	defer rows.Close()

	for rows.Next() {
		var book models.Book
		err = rows.Scan(&book.ID, &book.Title, &book.Description, &book.Price, &book.Image, &book.UserId, &book.Slug, &book.Category, &book.CreatedAt, &book.UpdatedAt)
		if err != nil {
			log.Fatalf("Could not scan rows %v", err)
		}
		books = append(books, book)
	}

	return books, nil
}

func GetBook(bookId string) (models.Book, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var book models.Book

	sqlQuery := "SELECT * FROM books WHERE id = $1"

	rows := db.QueryRow(sqlQuery, bookId)

	err := rows.Scan(&book.ID, &book.Title, &book.Description, &book.Price, &book.Image, &book.UserId, &book.Slug, &book.Category, &book.CreatedAt, &book.UpdatedAt)

	switch err {
	case sql.ErrNoRows:
		fmt.Println("No rows were returned.")
		return book, fmt.Errorf("book with id of %v could not be found", bookId)
	case nil:
		return book, nil
	default:
		fmt.Println("No rows were returned.")
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "22P02" {
				return book, fmt.Errorf("book with id of %v could not be found", bookId)
			}
		}
	}

	return book, nil
}
