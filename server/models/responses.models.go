package models

type SuccessResponse struct {
	Success bool `json:"success"`
	Message string `json:"message"`
}