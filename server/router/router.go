package router

import (
	"github.com/elue-dev/BookVerse-Golang-TS/handlers"
	"github.com/elue-dev/BookVerse-Golang-TS/middlewares"
	"github.com/gorilla/mux"
)

func Router() *mux.Router {
	router := mux.NewRouter()

	// HEALTH CHECK ROUTE
	router.HandleFunc("/api/healthz", handlers.CheckServerHealth).Methods("GET", "OPTIONS")

	// AUTH ROUTES
	router.HandleFunc("/api/auth/signup", handlers.SignUp).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/login", handlers.Login).Methods("POST", "OPTIONS")

	// BOOK ROUTES
	router.HandleFunc("/api/books", handlers.GetAllBooks).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/books", middlewares.VerifyAuthStatus(handlers.AddBook)).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/books/{slug}/{id}", handlers.GetSingleBook).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/books/{id}", middlewares.VerifyAuthStatus(handlers.UpdateBook)).Methods("PUT", "OPTIONS")
	router.HandleFunc("/api/books/{id}", middlewares.VerifyAuthStatus(handlers.DeleteBook)).Methods("DELETE", "OPTIONS")
	router.HandleFunc("/api/books/user/{id}", middlewares.VerifyAuthStatus(handlers.GetBooksByUser)).Methods("GET", "OPTIONS")

	// USER ROUTES
	router.HandleFunc("/api/users/{id}", handlers.GetSingleUser).Methods("GET", "OPTIONS")

	// COMMENT ROUTES
	router.HandleFunc("/api/comments", handlers.CreateComment).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/comments/book/{bookId}", middlewares.VerifyAuthStatus(handlers.GetBookComments)).Methods("GET", "OPTIONS")

	return router
}
