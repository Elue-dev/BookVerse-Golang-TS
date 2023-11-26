package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/elue-dev/bookVerse/router"
	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
	  log.Fatal("Error loading .env file")
	}

	r := router.Router()

	allowedOrigins := handlers.AllowedOrigins([]string{"*"})

	fmt.Println("Go server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(allowedOrigins)(r)))
}