package models

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
	UserImg     string `json:"user_img"`
}

type BookWithUsername struct {
	Book
	Username string `json:"username"`
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
