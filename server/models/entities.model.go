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
type Book struct {
	ID string `json:"id"` 
	Title string `json:"title"` 
	Description string `json:"description"` 
	Price int `json:"price"` 
	Image string `json:"image"` 
	UserId string `json:"userId"`
	Slug string `json:"slug"`
	Category string `json:"category"`
	CreatedAt string `json:"created_at"` 
	UpdatedAt string `json:"updated_at"` 
}

type LoginPayload struct {
	EmailOrUsername string `json:"emailOrUsername"` 
	Password string `json:"password"` 
}