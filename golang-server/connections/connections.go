package connections

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

func CeateConnection() *sql.DB {
	dbConn, err := sql.Open("postgres", os.Getenv("DB_URL"))
	if err != nil {
		panic(err)
	}

	err = dbConn.Ping()
	if err != nil {
		panic(err)
	}

	fmt.Println("Postgres DB connection Successful")

	return dbConn
}