package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/elue-dev/BookVerse-Golang-TS/router"
	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	PORT := os.Getenv("PORT")
	if PORT == "" {
		log.Fatal("port could not be found in env")
	}

	r := router.Router()

	allowedOrigins := handlers.AllowedOrigins([]string{"http://localhost:5173", "https://bookverse.vercel.app"})

	allowedMethods := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"Content-Type", "Authorization"})

	fmt.Println("Go server running on port " + PORT)
	log.Fatal(http.ListenAndServe(":"+PORT, handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders)(r)))

}
