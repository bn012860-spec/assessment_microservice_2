export const PROBLEM_TEMPLATES = [
  {
    id: "empty",
    label: "Generic (Empty)",
    data: {
      functionName: "solution",
      parameters: [{ name: "n", type: "number" }],
      returnType: "number",
      testCases: [{ inputs: "[0]", expected: "0", isSample: true }],
      referenceSolution: "function solution(n) {\n    return n;\n}",
      solutionLanguage: "javascript"
    }
  },
  {
    id: "array",
    label: "Array / Two Sum style",
    data: {
      functionName: "twoSum",
      parameters: [
        { name: "nums", type: "array<number>" },
        { name: "target", type: "number" }
      ],
      returnType: "array<number>",
      testCases: [{ inputs: "[[2, 7, 11, 15], 9]", expected: "[0, 1]", isSample: true }],
      referenceSolution: "function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}",
      solutionLanguage: "javascript"
    }
  },
  {
    id: "string",
    label: "String / Reverse style",
    data: {
      functionName: "reverseString",
      parameters: [{ name: "s", type: "string" }],
      returnType: "string",
      testCases: [{ inputs: '["hello"]', expected: '"olleh"', isSample: true }],
      referenceSolution: "function reverseString(s) {\n    return s.split('').reverse().join('');\n}",
      solutionLanguage: "javascript"
    }
  },
  {
    id: "matrix",
    label: "Matrix / Rotate style",
    data: {
      functionName: "rotate",
      parameters: [{ name: "matrix", type: "matrix<number>" }],
      returnType: "void",
      testCases: [{ inputs: "[[[1,2],[3,4]]]", expected: "[[3,1],[4,2]]", isSample: true }],
      referenceSolution: "function rotate(matrix) {\n    const n = matrix.length;\n    for (let i = 0; i < n / 2; i++) {\n        for (let j = i; j < n - i - 1; j++) {\n            const temp = matrix[i][j];\n            matrix[i][j] = matrix[n - 1 - j][i];\n            matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];\n            matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];\n            matrix[j][n - 1 - i] = temp;\n        }\n    }\n}",
      solutionLanguage: "javascript"
    }
  },
  {
    id: "linkedlist",
    label: "Linked List / Reverse style",
    data: {
      functionName: "reverseList",
      parameters: [{ name: "head", type: "linkedlist<number>" }],
      returnType: "linkedlist<number>",
      testCases: [{ inputs: "[[1, 2, 3]]", expected: "[3, 2, 1]", isSample: true }],
      referenceSolution: "function reverseList(head) {\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        let next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}",
      solutionLanguage: "javascript"
    }
  },
  {
    id: "tree",
    label: "Binary Tree / Depth style",
    data: {
      functionName: "maxDepth",
      parameters: [{ name: "root", type: "tree<number>" }],
      returnType: "number",
      testCases: [{ inputs: "[[3, 9, 20, null, null, 15, 7]]", expected: "3", isSample: true }],
      referenceSolution: "function maxDepth(root) {\n    if (!root) return 0;\n    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}",
      solutionLanguage: "javascript"
    }
  }
];
