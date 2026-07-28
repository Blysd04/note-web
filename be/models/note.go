package models

import "time"

type Note struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Priority  string    `json:"priority"`
	CreatedAt time.Time `json:"createdAt"`
}

func PriorityWeight(p string) int {
	switch p {
	case "HIGH":
		return 3
	case "MEDIUM":
		return 2
	case "LOW":
		return 1
	default:
		return 0
	}
}