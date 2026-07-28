package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"note-app-backend/db"
	"note-app-backend/models"
)

func NotesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		sortOption := r.URL.Query().Get("sort")
		query := "SELECT id, title, content, priority, created_at FROM notes"

		switch sortOption {
		case "priority_desc":
			query += " ORDER BY CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END ASC, created_at DESC"
		case "priority_asc":
			query += " ORDER BY CASE priority WHEN 'HIGH' THEN 3 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 1 END ASC, created_at DESC"
		default:
			query += " ORDER BY created_at DESC"
		}

		rows, err := db.DB.Query(query)
		if err != nil {
			http.Error(w, "Lỗi truy vấn cơ sở dữ liệu", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		list := []models.Note{}
		for rows.Next() {
			var n models.Note
			if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.Priority, &n.CreatedAt); err != nil {
				continue
			}
			list = append(list, n)
		}

		json.NewEncoder(w).Encode(list)

	case http.MethodPost:
		var newNote models.Note
		if err := json.NewDecoder(r.Body).Decode(&newNote); err != nil {
			http.Error(w, "Dữ liệu không hợp lệ", http.StatusBadRequest)
			return
		}
		if newNote.Priority == "" {
			newNote.Priority = "MEDIUM"
		}

		insertQuery := "INSERT INTO notes (title, content, priority) VALUES ($1, $2, $3) RETURNING id, created_at"
		err := db.DB.QueryRow(insertQuery, newNote.Title, newNote.Content, newNote.Priority).Scan(&newNote.ID, &newNote.CreatedAt)
		if err != nil {
			http.Error(w, "Lỗi lưu vào DB", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newNote)
	}
}

func NoteDetailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := strings.TrimPrefix(r.URL.Path, "/api/notes/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID không hợp lệ", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		var updatedData models.Note
		if err := json.NewDecoder(r.Body).Decode(&updatedData); err != nil {
			http.Error(w, "Dữ liệu không hợp lệ", http.StatusBadRequest)
			return
		}

		updateSQL := "UPDATE notes SET title=$1, content=$2, priority=$3 WHERE id=$4"
		_, err := db.DB.Exec(updateSQL, updatedData.Title, updatedData.Content, updatedData.Priority, id)
		if err != nil {
			http.Error(w, "Lỗi cập nhật DB", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"message": "Cập nhật thành công"})

	case http.MethodDelete:
		deleteSQL := "DELETE FROM notes WHERE id=$1"
		_, err := db.DB.Exec(deleteSQL, id)
		if err != nil {
			http.Error(w, "Lỗi xóa record", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"message": "Đã xóa ghi chú"})
	}
}