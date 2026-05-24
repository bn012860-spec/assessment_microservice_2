//go:build integration

package main

import (
	"testing"
	"judge-service-go/pkg/models"
)

func TestCertificationSuite(t *testing.T) {
	languagesToTest := []string{"python", "javascript", "java"}

	problems := []struct {
		Problem   models.Problem
		Solutions map[string]struct {
			Correct string
			Wrong   string
		}
	}{
		{
			Problem: models.Problem{
				Title:        "Add Two Numbers",
				FunctionName: "add",
				ReturnType:   "number",
				Parameters: []models.Parameter{
					{Name: "a", Type: "number"},
					{Name: "b", Type: "number"},
				},
				TestCases: []models.TestCase{
					{Input: []interface{}{float64(1), float64(2)}, Expected: int64(3)},
				},
			},
			Solutions: map[string]struct {
				Correct string
				Wrong   string
			}{
				"python":     {Correct: "def add(a, b): return a + b", Wrong: "def add(a, b): return a - b"},
				"javascript": {Correct: "function add(a, b) { return a + b; }", Wrong: "function add(a, b) { return a - b; }"},
				"java": {
					Correct: "public class Solution { public int add(int a, int b) { return a + b; } }",
					Wrong:   "public class Solution { public int add(int a, int b) { return a - b; } }",
				},
			},
		},
		{
			Problem: models.Problem{
				Title:        "Two Sum",
				FunctionName: "twoSum",
				ReturnType:   "array<number>",
				Parameters: []models.Parameter{
					{Name: "nums", Type: "array<number>"},
					{Name: "target", Type: "number"},
				},
				TestCases: []models.TestCase{
					{
						Input:    []interface{}{[]interface{}{float64(2), float64(7), float64(11), float64(15)}, float64(9)},
						Expected: []interface{}{int64(0), int64(1)},
					},
				},
			},
			Solutions: map[string]struct {
				Correct string
				Wrong   string
			}{
				"python": {
					Correct: "def twoSum(nums, target):\n    d = {}\n    for i, n in enumerate(nums):\n        if target - n in d: return [d[target - n], i]\n        d[n] = i",
					Wrong:   "def twoSum(nums, target): return [0, 0]",
				},
				"javascript": {
					Correct: "function twoSum(nums, target) {\n    const m = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        if (m.has(target - nums[i])) return [m.get(target - nums[i]), i];\n        m.set(nums[i], i);\n    }\n}",
					Wrong:   "function twoSum(nums, target) { return [0, 0]; }",
				},
				"java": {
					Correct: "import java.util.*;\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> m = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (m.containsKey(target - nums[i])) return new int[]{m.get(target - nums[i]), i};\n            m.put(nums[i], i);\n        }\n        return null;\n    }\n}",
					Wrong:   "public class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0, 0}; } }",
				},
			},
		},
		{
			Problem: models.Problem{
				Title:        "Rotate Image",
				FunctionName: "rotate",
				ReturnType:   "void",
				Parameters: []models.Parameter{
					{Name: "matrix", Type: "array<array<number>>"},
				},
				TestCases: []models.TestCase{
					{
						Input: []interface{}{
							[]interface{}{
								[]interface{}{float64(1), float64(2)},
								[]interface{}{float64(3), float64(4)},
							},
						},
						Expected: []interface{}{
							[]interface{}{int64(3), int64(1)},
							[]interface{}{int64(4), int64(2)},
						},
					},
				},
			},
			Solutions: map[string]struct {
				Correct string
				Wrong   string
			}{
				"python": {
					Correct: "def rotate(matrix):\n    n = len(matrix)\n    for i in range(n // 2):\n        for j in range(i, n - i - 1):\n            temp = matrix[i][j]\n            matrix[i][j] = matrix[n - j - 1][i]\n            matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1]\n            matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1]\n            matrix[j][n - i - 1] = temp",
					Wrong:   "def rotate(matrix): pass",
				},
				"javascript": {
					Correct: "function rotate(matrix) {\n    const n = matrix.length;\n    for (let i = 0; i < Math.floor(n / 2); i++) {\n        for (let j = i; j < n - i - 1; j++) {\n            let temp = matrix[i][j];\n            matrix[i][j] = matrix[n - j - 1][i];\n            matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1];\n            matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1];\n            matrix[j][n - i - 1] = temp;\n        }\n    }\n}",
					Wrong:   "function rotate(matrix) { }",
				},
				"java": {
					Correct: "public class Solution {\n    public void rotate(int[][] matrix) {\n        int n = matrix.length;\n        for (int i = 0; i < n / 2; i++) {\n            for (int j = i; j < n - i - 1; j++) {\n                int temp = matrix[i][j];\n                matrix[i][j] = matrix[n - j - 1][i];\n                matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1];\n                matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1];\n                matrix[j][n - i - 1] = temp;\n            }\n        }\n    }\n}",
					Wrong:   "public class Solution { public void rotate(int[][] matrix) { } }",
				},
			},
		},
		{
			Problem: models.Problem{
				Title:        "Reverse Linked List",
				FunctionName: "reverseList",
				ReturnType:   "linkedlist<number>",
				Parameters: []models.Parameter{
					{Name: "head", Type: "linkedlist<number>"},
				},
				TestCases: []models.TestCase{
					{
						Input:    []interface{}{[]interface{}{float64(1), float64(2), float64(3)}},
						Expected: []interface{}{int64(3), int64(2), int64(1)},
					},
				},
			},
			Solutions: map[string]struct {
				Correct string
				Wrong   string
			}{
				"python": {
					Correct: "def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev",
					Wrong:   "def reverseList(head): return head",
				},
				"javascript": {
					Correct: "function reverseList(head) {\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        let next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}",
					Wrong:   "function reverseList(head) { return head; }",
				},
				"java": {
					Correct: "public class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}",
					Wrong:   "public class Solution { public ListNode reverseList(ListNode head) { return head; } }",
				},
			},
		},
		{
			Problem: models.Problem{
				Title:        "Maximum Depth of Binary Tree",
				FunctionName: "maxDepth",
				ReturnType:   "number",
				Parameters: []models.Parameter{
					{Name: "root", Type: "tree<number>"},
				},
				TestCases: []models.TestCase{
					{
						Input:    []interface{}{[]interface{}{float64(3), float64(9), float64(20), nil, nil, float64(15), float64(7)}},
						Expected: int64(3),
					},
				},
			},
			Solutions: map[string]struct {
				Correct string
				Wrong   string
			}{
				"python": {
					Correct: "def maxDepth(root):\n    if not root: return 0\n    return 1 + max(maxDepth(root.left), maxDepth(root.right))",
					Wrong:   "def maxDepth(root): return 1",
				},
				"javascript": {
					Correct: "function maxDepth(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
					Wrong:   "function maxDepth(root) { return 1; }",
				},
				"java": {
					Correct: "public class Solution {\n    public int maxDepth(TreeNode root) {\n        if (root == null) return 0;\n        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n    }\n}",
					Wrong:   "public class Solution { public int maxDepth(TreeNode root) { return 1; } }",
				},
			},
		},
		{
			Problem: models.Problem{
				Title:        "Binary Tree Level Order Traversal",
				FunctionName: "levelOrder",
				ReturnType:   "array<array<number>>",
				Parameters: []models.Parameter{
					{Name: "root", Type: "tree<number>"},
				},
				TestCases: []models.TestCase{
					{
						Input:    []interface{}{[]interface{}{float64(3), float64(9), float64(20), nil, nil, float64(15), float64(7)}},
						Expected: []interface{}{[]interface{}{int64(3)}, []interface{}{int64(9), int64(20)}, []interface{}{int64(15), int64(7)}},
					},
				},
			},
			Solutions: map[string]struct {
				Correct string
				Wrong   string
			}{
				"python": {
					Correct: "import collections\ndef levelOrder(root):\n    if not root: return []\n    res, q = [], collections.deque([root])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        res.append(level)\n    return res",
					Wrong:   "def levelOrder(root): return []",
				},
				"javascript": {
					Correct: "function levelOrder(root) {\n    if (!root) return [];\n    const res = [], q = [root];\n    while (q.length > 0) {\n        const level = [], size = q.length;\n        for (let i = 0; i < size; i++) {\n            const node = q.shift();\n            level.push(node.val);\n            if (node.left) q.push(node.left);\n            if (node.right) q.push(node.right);\n        }\n        res.push(level);\n    }\n    return res;\n}",
					Wrong:   "function levelOrder(root) { return []; }",
				},
				"java": {
					Correct: "import java.util.*;\npublic class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        List<List<Integer>> res = new ArrayList<>();\n        if (root == null) return res;\n        Queue<TreeNode> q = new LinkedList<>();\n        q.add(root);\n        while (!q.isEmpty()) {\n            int size = q.size();\n            List<Integer> level = new ArrayList<>();\n            for (int i = 0; i < size; i++) {\n                TreeNode node = q.poll();\n                level.add(node.val);\n                if (node.left != null) q.add(node.left);\n                if (node.right != null) q.add(node.right);\n            }\n            res.add(level);\n        }\n        return res;\n    }\n}",
					Wrong:   "import java.util.*;\npublic class Solution { public List<List<Integer>> levelOrder(TreeNode root) { return new ArrayList<>(); } }",
				},
			},
		},
	}

	failureModes := []struct {
		Name      string
		Problem   models.Problem
		Expected  string
		Solutions map[string]string
	}{
		{
			Name: "Time Limit Exceeded",
			Problem: models.Problem{
				Title: "Infinite Loop", FunctionName: "run", ReturnType: "void", TimeLimitMs: 500,
				Parameters: []models.Parameter{{Name: "n", Type: "number"}},
				TestCases: []models.TestCase{{Input: []interface{}{float64(0)}, Expected: nil}},
			},
			Expected: models.SubmissionStatusTimeLimitExceeded,
			Solutions: map[string]string{
				"python":     "def run(n):\n    while True:\n        pass",
				"javascript": "function run(n) { while(true); }",
				"java":       "public class Solution { public void run(int n) { while(true); } }",
			},
		},
		{
			Name: "Memory Limit Exceeded",
			Problem: models.Problem{
				Title: "Memory Bomb", FunctionName: "run", ReturnType: "void", MemoryLimitMb: 32,
				Parameters: []models.Parameter{{Name: "n", Type: "number"}},
				TestCases: []models.TestCase{{Input: []interface{}{float64(0)}, Expected: nil}},
			},
			Expected: models.SubmissionStatusMemoryLimitExceeded,
			Solutions: map[string]string{
				"python":     "def run(n): a = [0.1] * 10000000",
				"javascript": "function run(n) { const a = new Array(10000000).fill(0.1); }",
				"java":       "import java.util.*;\npublic class Solution { public void run(int n) { long[] a = new long[10000000]; Arrays.fill(a, 1L); } }",
			},
		},
		{
			Name: "Runtime Error",
			Problem: models.Problem{
				Title: "Divide by Zero", FunctionName: "run", ReturnType: "number",
				Parameters: []models.Parameter{{Name: "n", Type: "number"}},
				TestCases: []models.TestCase{{Input: []interface{}{float64(0)}, Expected: 0}},
			},
			Expected: models.SubmissionStatusRuntimeError,
			Solutions: map[string]string{
				"python":     "def run(n): return 1 / n",
				"javascript": "function run(n) { throw new Error('boom'); }",
				"java":       "public class Solution { public int run(int n) { return 1 / n; } }",
			},
		},
		{
			Name: "Compilation Error",
			Problem: models.Problem{
				Title: "Syntax Error", FunctionName: "run", ReturnType: "void",
				Parameters: []models.Parameter{{Name: "n", Type: "number"}},
				TestCases: []models.TestCase{{Input: []interface{}{float64(0)}, Expected: nil}},
			},
			Expected: models.SubmissionStatusCompilationError,
			Solutions: map[string]string{
				"java": "public class Solution { public void run(int n) { return 1 + ; } }",
			},
		},
	}

	for _, cp := range problems {
		t.Run(cp.Problem.Title, func(t *testing.T) {
			for _, langID := range languagesToTest {
				sols, ok := cp.Solutions[langID]
				if !ok {
					continue
				}

				t.Run(langID, func(t *testing.T) {
					exec, p, pc, lang := setupIntegration(t, langID)
					defer p.Release(pc)

					t.Run("Correct", func(t *testing.T) {
						result := runCertificationTest(t, exec, pc, lang, cp.Problem, sols.Correct, "cert-correct")
						if result.Status != models.SubmissionStatusAccepted {
							t.Fatalf("expected Accepted, got %q. Details: %+v", result.Status, result.Details)
						}
					})

					t.Run("Wrong", func(t *testing.T) {
						result := runCertificationTest(t, exec, pc, lang, cp.Problem, sols.Wrong, "cert-wrong")
						if result.Status != models.SubmissionStatusWrongAnswer {
							t.Fatalf("expected Wrong Answer, got %q. Details: %+v", result.Status, result.Details)
						}
					})
				})
			}
		})
	}

	for _, fm := range failureModes {
		t.Run("Failure/"+fm.Name, func(t *testing.T) {
			for _, langID := range languagesToTest {
				code, ok := fm.Solutions[langID]
				if !ok {
					continue
				}

				t.Run(langID, func(t *testing.T) {
					exec, p, pc, lang := setupIntegration(t, langID)
					defer p.Release(pc)

					result := runCertificationTest(t, exec, pc, lang, fm.Problem, code, "cert-failure")
					if result.Status != fm.Expected {
						t.Fatalf("expected %q, got %q. Details: %+v", fm.Expected, result.Status, result.Details)
					}
				})
			}
		})
	}
}
