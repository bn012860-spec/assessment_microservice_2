package types

import (
	"testing"
)

func TestParseType(t *testing.T) {
	tests := []struct {
		input    string
		expected string
		wantErr  bool
	}{
		{"number", "number", false},
		{"string", "string", false},
		{"boolean", "boolean", false},
		{"array<number>", "array<number>", false},
		{"matrix<number>", "matrix<number>", false},
		{"tree<number>", "tree<number>", false},
		{"linkedlist<number>", "linkedlist<number>", false},
		{"graph<number>", "graph<number>", false},
		{"array<array<number>>", "array<array<number>>", false},
		{"array<matrix<string>>", "array<matrix<string>>", false},
		{"invalid", "", true},
		{"array<>", "", true},
		{"number<int>", "", true},
		{"", "", true},
	}

	for _, tt := range tests {
		got, err := ParseType(tt.input)
		if (err != nil) != tt.wantErr {
			t.Errorf("ParseType(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
			continue
		}
		if !tt.wantErr {
			if got.String() != tt.expected {
				t.Errorf("ParseType(%q) = %q, want %q", tt.input, got.String(), tt.expected)
			}
		}
	}
}
