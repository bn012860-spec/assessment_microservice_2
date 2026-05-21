package types

import (
	"encoding/json"
	"fmt"
)

// TreeNode represents a node in a binary tree.
type TreeNode struct {
	Val   interface{} `json:"val"`
	Left  *TreeNode   `json:"left"`
	Right *TreeNode   `json:"right"`
}

// BuildTree builds a binary tree from a level-order traversal array (LeetCode style).
func BuildTree(data []interface{}) (*TreeNode, error) {
	if len(data) == 0 || data[0] == nil {
		return nil, nil
	}

	root := &TreeNode{Val: data[0]}
	queue := []*TreeNode{root}
	i := 1

	for len(queue) > 0 && i < len(data) {
		node := queue[0]
		queue = queue[1:]

		// Left child
		if i < len(data) {
			if data[i] != nil {
				node.Left = &TreeNode{Val: data[i]}
				queue = append(queue, node.Left)
			}
			i++
		}

		// Right child
		if i < len(data) {
			if data[i] != nil {
				node.Right = &TreeNode{Val: data[i]}
				queue = append(queue, node.Right)
			}
			i++
		}
	}

	return root, nil
}

// SerializeTree serializes a binary tree to a level-order traversal array (LeetCode style).
func SerializeTree(root *TreeNode) []interface{} {
	if root == nil {
		return []interface{}{}
	}

	var result []interface{}
	queue := []*TreeNode{root}

	for len(queue) > 0 {
		node := queue[0]
		queue = queue[1:]

		if node == nil {
			result = append(result, nil)
			continue
		}

		result = append(result, node.Val)
		queue = append(queue, node.Left)
		queue = append(queue, node.Right)
	}

	// Trim trailing nils
	for len(result) > 0 && result[len(result)-1] == nil {
		result = result[:len(result)-1]
	}

	return result
}

// Helper to check if two trees are equal (useful for comparator)
func AreTreesEqual(t1, t2 *TreeNode) bool {
	if t1 == nil && t2 == nil {
		return true
	}
	if t1 == nil || t2 == nil {
		return false
	}
	if fmt.Sprintf("%v", t1.Val) != fmt.Sprintf("%v", t2.Val) {
		return false
	}
	return AreTreesEqual(t1.Left, t2.Left) && AreTreesEqual(t1.Right, t2.Right)
}

// ConvertToTreeNode converts a generic interface (expected to be []interface{}) to a TreeNode.
func ConvertToTreeNode(v interface{}) (*TreeNode, error) {
	data, ok := v.([]interface{})
	if !ok {
		// Try to see if it's already a map representation of TreeNode (rare but possible if already parsed)
		bytes, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		var arr []interface{}
		if err := json.Unmarshal(bytes, &arr); err == nil {
			return BuildTree(arr)
		}
		return nil, fmt.Errorf("expected array for tree building, got %T", v)
	}
	return BuildTree(data)
}
