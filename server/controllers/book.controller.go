package controllers

import (
	"fmt"
	"log"

	"github.com/elue-dev/bookVerse/connections"
	"github.com/elue-dev/bookVerse/models"
)

// func CreateBook() (models.Book, error) {

// }

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
		err = rows.Scan(&book.ID, &book.Title, &book.Description, &book.Price, &book.Image, &book.UserId,  &book.Slug, &book.Category, &book.CreatedAt, &book.UpdatedAt)
		if err != nil {
			log.Fatalf("Could not scan rows %v", err)
		}
		books = append(books, book)
	}

	return books, nil
}