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

func ValidateBookFields(title, description, userid, category string, price *int ) bool {
	if title == "" || description == "" || userid == "" || category == "" || price == nil {
		return false
	} else {
		return true
	}
}