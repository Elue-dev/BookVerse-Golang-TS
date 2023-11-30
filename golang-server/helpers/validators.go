package helpers

func ValidateSignUpFields(username, email, password string) bool {
	if username == "" || email == "" || password == "" {
		return false
	} else {
		return true
	}
}

func ValidateLoginFields(emailOrUsername, password string) bool {
	if emailOrUsername == "" || password == "" {
		return false
	} else {
		return true
	}
}

func ValidateBookFields(title, description, userid, category string, price *int) bool {
	if title == "" || description == "" || userid == "" || category == "" || price == nil {
		return false
	} else {
		return true
	}
}

func ValidateBookFieldsForUpdate(title, description, category string, price interface{}, image interface{}) bool {
	if title == "" && description == "" && category == "" && price == "" && image == nil {
		return false
	} else {
		return true
	}
}

func ValidateCommentFields(message, bookId string) bool {
	if message == "" || bookId == "" {
		return false
	} else {
		return true
	}
}

func ValidateTransactionFields(bookId, transactionId string) bool {
	if bookId == "" || transactionId == "" {
		return false
	} else {
		return true
	}
}
