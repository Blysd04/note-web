package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	connStr := os.Getenv("DATABASE_URL")

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Không thể mở kết nối DB: %v", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatalf("Không thể ping tới PostgreSQL: %v", err)
	}

	fmt.Println("Kết nối thành công tới PostgreSQL Database!")

	createTableSQL := `
	CREATE TABLE IF NOT EXISTS notes (
		id SERIAL PRIMARY KEY,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		priority VARCHAR(10) DEFAULT 'MEDIUM',
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = DB.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Lỗi tạo bảng notes: %v", err)
	}
}