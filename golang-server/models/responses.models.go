package models

type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type SuccessResponseWithData struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
}

type ErrResponse struct {
	Success      bool        `json:"success"`
	Message      string      `json:"message"`
	ErrorDetails interface{} `json:"error_details"`
}

type LoginResponse struct {
	Success bool        `json:"success"`
	Token   string      `json:"token"`
	Data    interface{} `json:"data"`
}

type UserResponse struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Avatar    string `json:"avatar"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
	Password  string `json:"-"`
}

type QueueMessage struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}
