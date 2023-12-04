package models

import "time"

type User struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Avatar    string `json:"avatar"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
type Book struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Price       int    `json:"price"`
	Image       string `json:"image"`
	UserId      string `json:"userId"`
	Slug        string `json:"slug"`
	Category    string `json:"category"`
	CreatedAt   string `json:"created_at"`
	UpdatedAt   string `json:"updated_at"`
}

type BookWithUsername struct {
	Book
	Username string `json:"username"`
}

type BookWithUsernameAndAvatar struct {
	Book
	Username   string `json:"username"`
	UserAvatar string `json:"user_avatar"`
}

type LoginPayload struct {
	EmailOrUsername string `json:"emailOrUsername"`
	Password        string `json:"password"`
}

type Comment struct {
	ID        string `json:"id"`
	Message   string `json:"message"`
	UserId    string `json:"user_id"`
	BookId    string `json:"book_id"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
type CommentWithUserFields struct {
	Comment
	Username string `json:"username"`
	UserImg  string `json:"user_img"`
}

type Transaction struct {
	ID            string `json:"id"`
	UserId        string `json:"user_id"`
	BookId        string `json:"book_id"`
	TransactionId string `json:"transaction_id"`
	CreatedAt     string `json:"created_at"`
}

type TransactionWithUserAndBookFields struct {
	Transaction
	BookTitle    string `json:"book_title"`
	BookPrice    int    `json:"book_price"`
	BookImg      string `json:"book_img"`
	BookSlug     string `json:"book_slug"`
	BookCategory string `json:"book_category"`
}

type Token struct {
	ID        string    `json:"id"`
	UserId    string    `json:"user_id"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt string    `json:"created_at"`
	Token     string    `json:"token"`
}

type ResetPayload struct {
	NewPassword     string `json:"new_password"`
	ConfirmPassword string `json:"confirm_password"`
}
