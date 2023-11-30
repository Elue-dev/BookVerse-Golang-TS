package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/elue-dev/BookVerse-Golang-TS/controllers"
	"github.com/elue-dev/BookVerse-Golang-TS/helpers"
	"github.com/elue-dev/BookVerse-Golang-TS/models"
)

func CreateTransaction(w http.ResponseWriter, r *http.Request) {
	var transaction models.Transaction

	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	transaction.UserId = currUser.ID

	json.NewDecoder(r.Body).Decode(&transaction)

	if isValidated := helpers.ValidateTransactionFields(transaction.BookId, transaction.TransactionId); !isValidated {
		helpers.SendErrorResponse(w, http.StatusBadRequest, "Missing fields detected", "book id and transaction id are both required")
		return
	}

	_, err = controllers.AddTransaction(transaction)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusInternalServerError, "Could not create transaction", err.Error())
		return
	}

	helpers.SendSuccessResponse(w, http.StatusOK, "Transaction created successfully")
}

func GetUserTransactions(w http.ResponseWriter, r *http.Request) {
	currUser, err := helpers.GetUserFromToken(r)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, "You are not authorized", err.Error())
		return
	}

	transactions, err := controllers.GetTransactionsByUser(currUser.ID)
	if err != nil {
		helpers.SendErrorResponse(w, http.StatusUnauthorized, fmt.Sprintf("could not get transactions for %v", currUser.Username), err.Error())
		return
	}

	helpers.SendSuccessResponseWithData(w, http.StatusOK, transactions)
}
