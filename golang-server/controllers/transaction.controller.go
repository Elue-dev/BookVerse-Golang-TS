package controllers

import (
	"errors"

	"github.com/elue-dev/BookVerse-Golang-TS/connections"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
	"github.com/lib/pq"
)

func AddTransaction(t models.Transaction) (models.Transaction, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var transaction models.Transaction

	sqlQuery := "INSERT INTO transactions (userid, bookid, transactionid) VALUES ($1, $2, $3) RETURNING *"

	err := db.QueryRow(
		sqlQuery,
		t.UserId,
		t.BookId,
		t.TransactionId,
	).Scan(
		&transaction.ID,
		&transaction.UserId,
		&transaction.BookId,
		&transaction.TransactionId,
		&transaction.CreatedAt,
	)

	if err != nil {
		return transaction, errors.New(err.Error())
	}

	return transaction, nil
}

func GetTransactionsByUser(userId string) ([]models.TransactionWithUserAndBookFields, error) {
	db := connections.CeateConnection()
	defer db.Close()

	var transactions []models.TransactionWithUserAndBookFields

	sqlQuery :=
		`
				SELECT t.*, 
				b.title, b.price, b.image, b.slug, b.category
				FROM transactions t
				JOIN books b
				ON t.bookid = b.id 
				WHERE t.userid = $1
			`

	rows, err := db.Query(sqlQuery, userId)
	if err != nil {
		return transactions, err
	}

	defer rows.Close()

	for rows.Next() {
		var transaction models.TransactionWithUserAndBookFields
		var createdAt pq.NullTime

		err = rows.Scan(
			&transaction.ID,
			&transaction.UserId,
			&transaction.BookId,
			&transaction.TransactionId,
			&createdAt,
			&transaction.BookTitle,
			&transaction.BookPrice,
			&transaction.BookImg,
			&transaction.BookSlug,
			&transaction.BookCategory,
		)

		if err != nil {
			return transactions, err
		}

		if createdAt.Valid {
			transaction.CreatedAt = createdAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}

		transactions = append(transactions, transaction)
	}

	return transactions, nil
}
