package helpers

func ValidateSignUpFields(email, password, avatar string) bool {
	if email == "" || password == "" || avatar == "" {
		return false
	} else {
		return true
	}

}