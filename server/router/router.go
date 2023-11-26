package router

import (
	"github.com/elue-dev/bookVerse/handlers"
	"github.com/gorilla/mux"
)

func Router() *mux.Router {
	router := mux.NewRouter()

	router.HandleFunc("/api/healthz", handlers.CheckServerHealth).Methods("GET", "OPTIONS")

	router.HandleFunc("/api/auth/signup", handlers.SignUp).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/auth/login", handlers.Login).Methods("POST", "OPTIONS")

	return router
}