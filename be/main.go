package main

import (
	"fmt"
	"log"
	"net/http"

	"note-app-backend/db"
	"note-app-backend/handlers"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {
	db.InitDB()
	defer db.DB.Close()

	mux := http.NewServeMux()

	// Endpoints
	mux.HandleFunc("/api/health", handlers.EnableCORS(handlers.MetricsMiddleware(handlers.HealthHandler, "/api/health")))
	mux.HandleFunc("/api/notes", handlers.EnableCORS(handlers.MetricsMiddleware(handlers.NotesHandler, "/api/notes")))
	mux.HandleFunc("/api/notes/", handlers.EnableCORS(handlers.MetricsMiddleware(handlers.NoteDetailHandler, "/api/notes/:id")))

	// Prometheus
	mux.Handle("/metrics", promhttp.Handler())

	fmt.Println("Server Golang đang chạy tại cổng :5000...")
	log.Fatal(http.ListenAndServe(":5000", mux))
}