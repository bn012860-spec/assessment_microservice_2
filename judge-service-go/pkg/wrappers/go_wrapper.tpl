package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
)

// ListNode defines a node in a linked list.
type ListNode struct {
	Val  int
	Next *ListNode
}

// MarshalJSON for ListNode to convert it back to an array for JSON output.
func (l *ListNode) MarshalJSON() ([]byte, error) {
	if l == nil {
		return []byte("null"), nil
	}
	var vals []int
	curr := l
	for curr != nil {
		vals = append(vals, curr.Val)
		curr = curr.Next
	}
	return json.Marshal(vals)
}

// listFromJSON converts a JSON array of integers to a ListNode linked list.
func listFromJSON(data json.RawMessage) *ListNode {
	var vals []int
	if err := json.Unmarshal(data, &vals); err != nil {
		return nil
	}
	if len(vals) == 0 {
		return nil
	}
	dummy := &ListNode{}
	curr := dummy
	for _, v := range vals {
		curr.Next = &ListNode{Val: v}
		curr = curr.Next
	}
	return dummy.Next
}

// TreeNode defines a node in a binary tree.
type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

// MarshalJSON for TreeNode to convert it back to a level-order array for JSON output.
func (t *TreeNode) MarshalJSON() ([]byte, error) {
	if t == nil {
		return []byte("null"), nil
	}
	var res []*int
	queue := []*TreeNode{t}
	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]
		if node != nil {
			v := node.Val
			res = append(res, &v)
			queue = append(queue, node.Left)
			queue = append(queue, node.Right)
		} else {
			res = append(res, nil)
		}
	}
	// Trim trailing nils
	for len(res) > 0 && res[len(res)-1] == nil {
		res = res[:len(res)-1]
	}
	return json.Marshal(res)
}

// treeFromJSON converts a JSON level-order array to a TreeNode binary tree.
func treeFromJSON(data json.RawMessage) *TreeNode {
	var vals []*int
	if err := json.Unmarshal(data, &vals); err != nil {
		return nil
	}
	if len(vals) == 0 || vals[0] == nil {
		return nil
	}
	root := &TreeNode{Val: *vals[0]}
	queue := []*TreeNode{root}
	i := 1
	for len(queue) > 0 && i < len(vals) {
		node := queue[0]
		queue = queue[1:]
		if i < len(vals) && vals[i] != nil {
			node.Left = &TreeNode{Val: *vals[i]}
			queue = append(queue, node.Left)
		}
		i++
		if i < len(vals) && vals[i] != nil {
			node.Right = &TreeNode{Val: *vals[i]}
			queue = append(queue, node.Right)
		}
		i++
	}
	return root
}

// USER_CODE_MARKER

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Missing input payload\n")
		os.Exit(1)
	}

	decoded, err := base64.StdEncoding.DecodeString(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to decode payload: %v\n", err)
		os.Exit(1)
	}

	var payload struct {
		Inputs []json.RawMessage `json:"inputs"`
	}
	if err := json.Unmarshal(decoded, &payload); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to parse payload: %v\n", err)
		os.Exit(1)
	}

	var result struct {
		Output interface{} `json:"output"`
		Error  string      `json:"error,omitempty"`
	}

	defer func() {
		if r := recover(); r != nil {
			result.Error = "Runtime Error"
			fmt.Printf("{\"error\": \"Runtime Error\", \"message\": \"%v\"}\n", r)
			os.Exit(0)
		}
	}()

	// GENERATED_CALL_MARKER
}
