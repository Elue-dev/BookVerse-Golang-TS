package models

type User struct {
	ID string `json:"id"` 
	Username string `json:"username"` 
	Email string `json:"email"` 
	Password string `json:"password"` 
	Avatar string `json:"avatar"` 
	CreatedAt string `json:"created_at"` 
	UpdatedAt string `json:"updated_at"` 
}

type LoginPayload struct {
	Email string `json:"email"` 
	Username string `json:"username"` 
	Password string `json:"password"` 
}