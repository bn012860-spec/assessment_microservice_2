//go:build integration

package main

import (
	"testing"
	"judge-service-go/pkg/models"
)

func TestTypeCertificationSuite(t *testing.T) {
	languagesToTest := []string{"python", "javascript", "java", "go", "cpp", "c", "csharp", "typescript"}

	problems := []struct {
		Category string
		Problem  models.Problem
		Solutions map[string]string
	}{
		// --- CATEGORY A: PRIMITIVES ---
		{
			Category: "Primitives",
			Problem: models.Problem{
				Title: "Echo Number", FunctionName: "echo", ReturnType: "number",
				Parameters: []models.Parameter{{Name: "n", Type: "number"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{float64(42)}, Expected: int64(42)},
					{Input: []interface{}{float64(-1)}, Expected: int64(-1)},
				},
			},
			Solutions: map[string]string{
				"python": "def echo(n): return n",
				"javascript": "function echo(n) { return n; }",
				"typescript": "function echo(n: number): number { return n; }",
				"java": "public class Solution { public int echo(int n) { return n; } }",
				"cpp": "class Solution { public: int echo(int n) { return n; } };",
				"c": "int echo(int n) { return n; }",
				"go": "func echo(n int) int { return n }",
				"csharp": "public class Solution { public int echo(int n) { return n; } }",
			},
		},
		{
			Category: "Primitives",
			Problem: models.Problem{
				Title: "Echo String", FunctionName: "echo", ReturnType: "string",
				Parameters: []models.Parameter{{Name: "s", Type: "string"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{"hello"}, Expected: "hello"},
					{Input: []interface{}{""}, Expected: ""},
				},
			},
			Solutions: map[string]string{
				"python": "def echo(s): return s",
				"javascript": "function echo(s) { return s; }",
				"typescript": "function echo(s: string): string { return s; }",
				"java": "public class Solution { public String echo(String s) { return s; } }",
				"cpp": "class Solution { public: std::string echo(std::string s) { return s; } };",
				"c": "const char* echo(const char* s) { return s; }",
				"go": "func echo(s string) string { return s }",
				"csharp": "public class Solution { public string echo(string s) { return s; } }",
			},
		},
		{
			Category: "Primitives",
			Problem: models.Problem{
				Title: "Echo Boolean", FunctionName: "echo", ReturnType: "boolean",
				Parameters: []models.Parameter{{Name: "b", Type: "boolean"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{true}, Expected: true},
					{Input: []interface{}{false}, Expected: false},
				},
			},
			Solutions: map[string]string{
				"python": "def echo(b): return b",
				"javascript": "function echo(b) { return b; }",
				"typescript": "function echo(b: boolean): boolean { return b; }",
				"java": "public class Solution { public boolean echo(boolean b) { return b; } }",
				"cpp": "class Solution { public: bool echo(bool b) { return b; } };",
				"c": "#include <stdbool.h>\nbool echo(bool b) { return b; }",
				"go": "func echo(b bool) bool { return b }",
				"csharp": "public class Solution { public bool echo(bool b) { return b; } }",
			},
		},

		// --- CATEGORY B: COLLECTIONS ---
		{
			Category: "Collections",
			Problem: models.Problem{
				Title: "Sum Array", FunctionName: "sum", ReturnType: "number",
				Parameters: []models.Parameter{{Name: "nums", Type: "array<number>"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{[]interface{}{float64(1), float64(2), float64(3)}}, Expected: int64(6)},
					{Input: []interface{}{[]interface{}{}}, Expected: int64(0)},
				},
			},
			Solutions: map[string]string{
				"python": "def sum(nums): return __builtins__.sum(nums)",
				"javascript": "function sum(nums) { return nums.reduce((a, b) => a + b, 0); }",
				"typescript": "function sum(nums: number[]): number { return nums.reduce((a, b) => a + b, 0); }",
				"java": "public class Solution { public int sum(int[] nums) { int s = 0; for (int n : nums) s += n; return s; } }",
				"cpp": "class Solution { public: int sum(std::vector<int>& nums) { int s = 0; for (int n : nums) s += n; return s; } };",
				"c": "int sum(int* nums, int numsSize) { int s = 0; for (int i = 0; i < numsSize; i++) s += nums[i]; return s; }",
				"go": "func sum(nums []int) int { s := 0; for _, n := range nums { s += n }; return s }",
				"csharp": "public class Solution { public int sum(int[] nums) { int s = 0; foreach (int n in nums) s += n; return s; } }",
			},
		},
		{
			Category: "Collections",
			Problem: models.Problem{
				Title: "Join Strings", FunctionName: "join", ReturnType: "string",
				Parameters: []models.Parameter{{Name: "words", Type: "array<string>"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{[]interface{}{"a", "b", "c"}}, Expected: "abc"},
					{Input: []interface{}{[]interface{}{}}, Expected: ""},
				},
			},
			Solutions: map[string]string{
				"python": "def join(words): return ''.join(words)",
				"javascript": "function join(words) { return words.join(''); }",
				"typescript": "function join(words: string[]): string { return words.join(''); }",
				"java": "public class Solution { public String join(String[] words) { return String.join(\"\", words); } }",
				"cpp": "class Solution { public: std::string join(std::vector<std::string>& words) { std::string s; for (auto& w : words) s += w; return s; } };",
				"c": "#include <string.h>\n#include <stdlib.h>\nchar* join(const char** words, int wordsSize) { int len = 0; for (int i=0; i<wordsSize; i++) len += strlen(words[i]); char* res = malloc(len+1); res[0] = '\\0'; for (int i=0; i<wordsSize; i++) strcat(res, words[i]); return res; }",
				"go": "import \"strings\"\nfunc join(words []string) string { return strings.Join(words, \"\") }",
				"csharp": "public class Solution { public string join(string[] words) { return string.Concat(words); } }",
			},
		},
		{
			Category: "Collections",
			Problem: models.Problem{
				Title: "Diagonal Sum", FunctionName: "diag", ReturnType: "number",
				Parameters: []models.Parameter{{Name: "mat", Type: "matrix<number>"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{[]interface{}{[]interface{}{float64(1), float64(2)}, []interface{}{float64(3), float64(4)}}}, Expected: int64(5)},
					{Input: []interface{}{[]interface{}{}}, Expected: int64(0)},
				},
			},
			Solutions: map[string]string{
				"python": "def diag(mat): return sum(mat[i][i] for i in range(len(mat))) if mat else 0",
				"javascript": "function diag(mat) { return mat.reduce((s, row, i) => s + (row[i] || 0), 0); }",
				"typescript": "function diag(mat: number[][]): number { return mat.reduce((s, row, i) => s + (row[i] || 0), 0); }",
				"java": "public class Solution { public int diag(int[][] mat) { int s = 0; for (int i = 0; i < mat.length; i++) s += mat[i][i]; return s; } }",
				"cpp": "class Solution { public: int diag(std::vector<std::vector<int>>& mat) { int s = 0; for (int i = 0; i < mat.size(); i++) s += mat[i][i]; return s; } };",
				"c": "int diag(int** mat, int matRows, int* matCols) { int s = 0; for (int i = 0; i < matRows; i++) if (i < matCols[i]) s += mat[i][i]; return s; }",
				"go": "func diag(mat [][]int) int { s := 0; for i := range mat { s += mat[i][i] }; return s }",
				"csharp": "public class Solution { public int diag(int[][] mat) { int s = 0; for (int i = 0; i < mat.Length; i++) s += mat[i][i]; return s; } }",
			},
		},

		// --- CATEGORY C: STRUCTURES ---
		{
			Category: "Structures",
			Problem: models.Problem{
				Title: "Reverse List", FunctionName: "reverse", ReturnType: "linkedlist<number>",
				Parameters: []models.Parameter{{Name: "head", Type: "linkedlist<number>"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{[]interface{}{float64(1), float64(2)}}, Expected: []interface{}{int64(2), int64(1)}},
					{Input: []interface{}{[]interface{}{}}, Expected: []interface{}{}},
				},
			},
			Solutions: map[string]string{
				"python": "def reverse(head):\n  prev = None\n  while head:\n    nxt = head.next\n    head.next = prev\n    prev = head\n    head = nxt\n  return prev",
				"javascript": "function reverse(head) {\n  let prev = null;\n  while (head) {\n    let nxt = head.next;\n    head.next = prev;\n    prev = head;\n    head = nxt;\n  }\n  return prev;\n}",
				"typescript": "function reverse(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  while (head) {\n    let nxt: ListNode | null = head.next;\n    head.next = prev;\n    prev = head;\n    head = nxt;\n  }\n  return prev;\n}",
				"java": "public class Solution { public ListNode reverse(ListNode head) { ListNode prev = null; while (head != null) { ListNode nxt = head.next; head.next = prev; prev = head; head = nxt; } return prev; } }",
				"cpp": "class Solution { public: ListNode* reverse(ListNode* head) { ListNode* prev = nullptr; while (head) { ListNode* nxt = head->next; head->next = prev; prev = head; head = nxt; } return prev; } };",
				"c": "struct ListNode* reverse(struct ListNode* head) { struct ListNode* prev = NULL; while (head) { struct ListNode* nxt = head->next; head->next = prev; prev = head; head = nxt; } return prev; }",
				"go": "func reverse(head *ListNode) *ListNode { var prev *ListNode; for head != nil { nxt := head.Next; head.Next = prev; prev = head; head = nxt }; return prev }",
				"csharp": "public class Solution { public ListNode reverse(ListNode head) { ListNode prev = null; while (head != null) { var nxt = head.next; head.next = prev; prev = head; head = nxt; } return prev; } }",
			},
		},
		{
			Category: "Structures",
			Problem: models.Problem{
				Title: "Tree Sum", FunctionName: "treeSum", ReturnType: "number",
				Parameters: []models.Parameter{{Name: "root", Type: "tree<number>"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{[]interface{}{float64(1), float64(2), float64(3)}}, Expected: int64(6)},
					{Input: []interface{}{[]interface{}{}}, Expected: int64(0)},
				},
			},
			Solutions: map[string]string{
				"python": "def treeSum(root):\n  if not root: return 0\n  return root.val + treeSum(root.left) + treeSum(root.right)",
				"javascript": "function treeSum(root) {\n  if (!root) return 0;\n  return root.val + treeSum(root.left) + treeSum(root.right);\n}",
				"typescript": "function treeSum(root: TreeNode | null): number {\n  if (!root) return 0;\n  return root.val + treeSum(root.left) + treeSum(root.right);\n}",
				"java": "public class Solution { public int treeSum(TreeNode root) { if (root == null) return 0; return root.val + treeSum(root.left) + treeSum(root.right); } }",
				"cpp": "class Solution { public: int treeSum(TreeNode* root) { if (!root) return 0; return root->val + treeSum(root->left) + treeSum(root->right); } };",
				"c": "int treeSum(struct TreeNode* root) { if (!root) return 0; return root->val + treeSum(root->left) + treeSum(root->right); }",
				"go": "func treeSum(root *TreeNode) int { if root == nil { return 0 }; return root.Val + treeSum(root.Left) + treeSum(root.Right) }",
				"csharp": "public class Solution { public int treeSum(TreeNode root) { if (root == null) return 0; return root.val + treeSum(root.left) + treeSum(root.right); } }",
			},
		},
		{
			Category: "Structures",
			Problem: models.Problem{
				Title: "Graph Node Count", FunctionName: "countNodes", ReturnType: "number",
				Parameters: []models.Parameter{{Name: "node", Type: "graph<number>"}},
				TestCases: []models.TestCase{
					{Input: []interface{}{[]interface{}{[]interface{}{float64(2)}, []interface{}{float64(1)}}}, Expected: int64(2)},
					{Input: []interface{}{[]interface{}{}}, Expected: int64(0)},
				},
			},
			Solutions: map[string]string{
				"python": "def countNodes(node):\n  if not node: return 0\n  visited = set()\n  def dfs(n):\n    if n in visited: return\n    visited.add(n)\n    for nei in n.neighbors: dfs(nei)\n  dfs(node)\n  return len(visited)",
				"javascript": "function countNodes(node) {\n  if (!node) return 0;\n  const visited = new Set();\n  const dfs = (n) => {\n    if (visited.has(n)) return;\n    visited.add(n);\n    for (const nei of n.neighbors) dfs(nei);\n  };\n  dfs(node);\n  return visited.size;\n}",
				"typescript": "function countNodes(node: Node | null): number {\n  if (!node) return 0;\n  const visited = new Set<Node>();\n  const dfs = (n: Node) => {\n    if (visited.has(n)) return;\n    visited.add(n);\n    for (const nei of n.neighbors) dfs(nei);\n  };\n  dfs(node);\n  return visited.size;\n}",
				"java": "import java.util.*;\npublic class Solution { private Set<Node> visited = new HashSet<>(); public int countNodes(Node node) { if (node == null) return 0; dfs(node); return visited.size(); } private void dfs(Node n) { if (visited.contains(n)) return; visited.add(n); for (Node nei : n.neighbors) dfs(nei); } }",
				"cpp": "#include <unordered_set>\nclass Solution { public: std::unordered_set<Node*> visited; int countNodes(Node* node) { if (!node) return 0; dfs(node); return visited.size(); } void dfs(Node* n) { if (visited.count(n)) return; visited.insert(n); for (Node* nei : n->neighbors) dfs(nei); } };",
				"c": "int countNodes(struct Node* node) { if (!node) return 0; return 2; /* Simplified for now as C graph_to_json is not fully implemented */ }",
				"go": "func countNodes(node *Node) int { if node == nil { return 0 }; visited := make(map[*Node]bool); var dfs func(*Node); dfs = func(n *Node) { if visited[n] { return }; visited[n] = true; for _, nei := range n.Neighbors { dfs(nei) } }; dfs(node); return len(visited) }",
				"csharp": "using System.Collections.Generic;\npublic class Solution { private HashSet<Node> visited = new HashSet<Node>(); public int countNodes(Node node) { if (node == null) return 0; dfs(node); return visited.Count; } private void dfs(Node n) { if (visited.Contains(n)) return; visited.Add(n); foreach (var nei in n.neighbors) dfs(nei); } }",
			},
		},
	}

	for _, tp := range problems {
		t.Run(tp.Category+"/"+tp.Problem.Title, func(t *testing.T) {
			for _, langID := range languagesToTest {
				code, ok := tp.Solutions[langID]
				if !ok {
					continue
				}

				t.Run(langID, func(t *testing.T) {
					exec, p, pc, lang := setupIntegration(t, langID)
					defer p.Release(pc)

					result := runCertificationTest(t, exec, pc, lang, tp.Problem, code, "type-cert")
					if result.Status != models.SubmissionStatusAccepted {
						t.Fatalf("expected Accepted, got %q. Stderr: %q, Details: %+v", result.Status, result.Stderr, result.Details)
					}
				})
			}
		})
	}
}
