export const PROBLEM_TEMPLATES = [
  {
    id: "empty",
    label: "Generic (Empty)",
    data: {
      functionName: "solution",
      parameters: [{ name: "n", type: "number" }],
      returnType: "number",
      testCases: [{ inputs: "[0]", expected: "0", isSample: true }]
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
      testCases: [{ inputs: "[[2, 7, 11, 15], 9]", expected: "[0, 1]", isSample: true }]
    }
  },
  {
    id: "string",
    label: "String / Reverse style",
    data: {
      functionName: "reverseString",
      parameters: [{ name: "s", type: "string" }],
      returnType: "string",
      testCases: [{ inputs: '["hello"]', expected: '"olleh"', isSample: true }]
    }
  },
  {
    id: "matrix",
    label: "Matrix / Rotate style",
    data: {
      functionName: "rotate",
      parameters: [{ name: "matrix", type: "matrix<number>" }],
      returnType: "void",
      testCases: [{ inputs: "[[[1,2],[3,4]]]", expected: "[[3,1],[4,2]]", isSample: true }]
    }
  },
  {
    id: "linkedlist",
    label: "Linked List / Reverse style",
    data: {
      functionName: "reverseList",
      parameters: [{ name: "head", type: "linkedlist<number>" }],
      returnType: "linkedlist<number>",
      testCases: [{ inputs: "[[1, 2, 3]]", expected: "[3, 2, 1]", isSample: true }]
    }
  },
  {
    id: "tree",
    label: "Binary Tree / Depth style",
    data: {
      functionName: "maxDepth",
      parameters: [{ name: "root", type: "tree<number>" }],
      returnType: "number",
      testCases: [{ inputs: "[[3, 9, 20, null, null, 15, 7]]", expected: "3", isSample: true }]
    }
  }
];
