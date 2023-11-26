package helpers

func ValidateSignUpFields(username, email, password string) bool {
	if username == "" || email == "" || password == "" {
		return false
	} else {
		return true
	}

}