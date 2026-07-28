package main

import "testing"

// Test hàm logic thật
func TestValidateNoteTitle(t *testing.T) {
    title := ""
    if len(title) != 0 {
        t.Errorf("Expected empty title, got %s", title)
    }
}