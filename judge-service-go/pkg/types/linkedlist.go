package types

import (
	"encoding/json"
	"fmt"
)

// ListNode represents a node in a singly linked list.
type ListNode struct {
	Val  interface{} `json:"val"`
	Next *ListNode   `json:"next"`
}

// BuildLinkedList builds a linked list from an array.
func BuildLinkedList(data []interface{}) (*ListNode, error) {
	if len(data) == 0 {
		return nil, nil
	}

	dummy := &ListNode{}
	curr := dummy

	for _, v := range data {
		curr.Next = &ListNode{Val: v}
		curr = curr.Next
	}

	return dummy.Next, nil
}

// SerializeLinkedList serializes a linked list to an array.
func SerializeLinkedList(head *ListNode) []interface{} {
	var result []interface{}
	curr := head
	for curr != nil {
		result = append(result, curr.Val)
		curr = curr.Next
	}
	return result
}

// AreLinkedListsEqual checks if two linked lists are equal.
func AreLinkedListsEqual(l1, l2 *ListNode) bool {
	curr1, curr2 := l1, l2
	for curr1 != nil && curr2 != nil {
		if fmt.Sprintf("%v", curr1.Val) != fmt.Sprintf("%v", curr2.Val) {
			return false
		}
		curr1 = curr1.Next
		curr2 = curr2.Next
	}
	return curr1 == nil && curr2 == nil
}

// ConvertToListNode converts a generic interface (expected to be []interface{}) to a ListNode.
func ConvertToListNode(v interface{}) (*ListNode, error) {
	data, ok := v.([]interface{})
	if !ok {
		// Try to see if it's already a map representation of ListNode
		bytes, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		var arr []interface{}
		if err := json.Unmarshal(bytes, &arr); err == nil {
			return BuildLinkedList(arr)
		}
		return nil, fmt.Errorf("expected array for linked list building, got %T", v)
	}
	return BuildLinkedList(data)
}
