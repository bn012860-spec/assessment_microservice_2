package types

import (
	"reflect"
	"testing"
)

func TestBuildAndSerializeTree(t *testing.T) {
	tests := []struct {
		name     string
		input    []interface{}
		expected []interface{}
	}{
		{
			"Empty tree",
			[]interface{}{},
			[]interface{}{},
		},
		{
			"Single node",
			[]interface{}{1},
			[]interface{}{1},
		},
		{
			"Full tree",
			[]interface{}{1, 2, 3},
			[]interface{}{1, 2, 3},
		},
		{
			"Tree with nils",
			[]interface{}{1, nil, 2, 3},
			[]interface{}{1, nil, 2, 3},
		},
		{
			"LeetCode example",
			[]interface{}{3, 9, 20, nil, nil, 15, 7},
			[]interface{}{3, 9, 20, nil, nil, 15, 7},
		},
		{
			"Complex tree",
			[]interface{}{1, 2, 3, 4, nil, nil, 5, nil, 6, 7},
			[]interface{}{1, 2, 3, 4, nil, nil, 5, nil, 6, 7},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			root, err := BuildTree(tt.input)
			if err != nil {
				t.Fatalf("BuildTree() error = %v", err)
			}
			got := SerializeTree(root)
			if !reflect.DeepEqual(got, tt.expected) {
				if len(got) == 0 && len(tt.expected) == 0 {
					return
				}
				t.Errorf("SerializeTree() = %v, want %v", got, tt.expected)
			}
		})
	}
}
