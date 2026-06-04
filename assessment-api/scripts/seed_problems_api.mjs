import mongoose from "mongoose";
import Problem from "../models/Problem.mjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/assessment_db";
const DB_NAME = process.env.MONGO_DB_NAME || "assessment_db";

const PROBLEMS = [
  {
    title: "Two Sum",
    description:
      "Return the indices of the two numbers such that they add up to the target. Assume exactly one valid answer exists.",
    difficulty: "Easy",
    functionName: "twoSum",
    parameters: [
      { name: "nums", type: "array<number>" },
      { name: "target", type: "number" }
    ],
    returnType: "array<number>",
    compareConfig: {
      mode: "EXACT",
      floatTolerance: 0,
      orderInsensitive: false
    },
    testCases: [
      {
        inputs: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[3, 2, 4], 6],
        expected: [1, 2],
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[3, 3], 6],
        expected: [0, 1],
        isSample: false,
        isHidden: true
      }
    ],
    tags: ["array", "hash-map"],
    isPremium: false
  },
  {
    title: "Valid Palindrome",
    description:
      "Return true if the input string is a palindrome after converting to lowercase and removing non-alphanumeric characters.",
    difficulty: "Easy",
    functionName: "isPalindrome",
    parameters: [
      { name: "s", type: "string" }
    ],
    returnType: "boolean",
    compareConfig: {
      mode: "EXACT",
      floatTolerance: 0,
      orderInsensitive: false
    },
    testCases: [
      {
        inputs: ["A man, a plan, a canal: Panama"],
        expected: true,
        isSample: true,
        isHidden: false
      },
      {
        inputs: ["race a car"],
        expected: false,
        isSample: true,
        isHidden: false
      },
      {
        inputs: [" "],
        expected: true,
        isSample: false,
        isHidden: true
      }
    ],
    tags: ["string", "two-pointers"],
    isPremium: false
  },
  {
    title: "Kth Largest Element",
    description: "Return the kth largest element in the array. k is 1-based.",
    difficulty: "Medium",
    functionName: "findKthLargest",
    parameters: [
      { name: "nums", type: "array<number>" },
      { name: "k", type: "number" }
    ],
    returnType: "number",
    compareConfig: {
      mode: "EXACT",
      floatTolerance: 0,
      orderInsensitive: false
    },
    testCases: [
      {
        inputs: [[3, 2, 1, 5, 6, 4], 2],
        expected: 5,
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4],
        expected: 4,
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[7, 10, 4, 3, 20, 15], 3],
        expected: 10,
        isSample: false,
        isHidden: true
      }
    ],
    tags: ["array", "heap", "selection"],
    isPremium: false
  },
  {
    title: "Longest Common Prefix",
    description: "Return the longest common prefix string amongst an array of strings.",
    difficulty: "Easy",
    functionName: "longestCommonPrefix",
    parameters: [
      { name: "strs", type: "array<string>" }
    ],
    returnType: "string",
    compareConfig: {
      mode: "EXACT",
      floatTolerance: 0,
      orderInsensitive: false
    },
    testCases: [
      {
        inputs: [["flower", "flow", "flight"]],
        expected: "fl",
        isSample: true,
        isHidden: false
      },
      {
        inputs: [["dog", "racecar", "car"]],
        expected: "",
        isSample: true,
        isHidden: false
      },
      {
        inputs: [["interview", "internet", "internal"]],
        expected: "inter",
        isSample: false,
        isHidden: true
      }
    ],
    tags: ["string"],
    isPremium: false
  },
  {
    title: "Maximum Depth of Binary Tree",
    description: "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    difficulty: "Easy",
    functionName: "maxDepth",
    parameters: [
      { name: "root", type: "tree<number>" }
    ],
    returnType: "number",
    compareConfig: {
      mode: "EXACT",
      floatTolerance: 0,
      orderInsensitive: false
    },
    testCases: [
      {
        inputs: [[3, 9, 20, null, null, 15, 7]],
        expected: 3,
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[1, null, 2]],
        expected: 2,
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[]],
        expected: 0,
        isSample: false,
        isHidden: true
      },
      {
        inputs: [[0]],
        expected: 1,
        isSample: false,
        isHidden: true
      }
    ],
    tags: ["tree", "depth-first-search", "binary-tree"],
    isPremium: false
  },
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "Easy",
    functionName: "reverseList",
    parameters: [
      { name: "head", type: "linkedlist<number>" }
    ],
    returnType: "linkedlist<number>",
    compareConfig: {
      mode: "STRUCTURAL"
    },
    testCases: [
      {
        inputs: [[1, 2, 3, 4, 5]],
        expected: [5, 4, 3, 2, 1],
        isSample: true
      },
      {
        inputs: [[1, 2]],
        expected: [2, 1],
        isSample: true
      },
      {
        inputs: [[]],
        expected: [],
        isSample: false
      }
    ],
    tags: ["linked-list"]
  },
  {
    title: "Middle of the Linked List",
    description: "Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.",
    difficulty: "Easy",
    functionName: "middleNode",
    parameters: [
      { name: "head", type: "linkedlist<number>" }
    ],
    returnType: "linkedlist<number>",
    compareConfig: {
      mode: "STRUCTURAL"
    },
    testCases: [
      {
        inputs: [[1, 2, 3, 4, 5]],
        expected: [3, 4, 5],
        isSample: true
      },
      {
        inputs: [[1, 2, 3, 4, 5, 6]],
        expected: [4, 5, 6],
        isSample: true
      }
    ],
    tags: ["linked-list", "two-pointers"]
  },
  {
    title: "Matrix Diagonal Sum",
    description: "Given a square matrix mat, return the sum of the matrix diagonals. Only include the sum of all the elements on the primary diagonal and all the elements on the secondary diagonal that are not part of the primary diagonal.",
    difficulty: "Easy",
    functionName: "diagonalSum",
    parameters: [
      { name: "mat", type: "matrix<number>" }
    ],
    returnType: "number",
    testCases: [
      {
        inputs: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]],
        expected: 25,
        isSample: true
      },
      {
        inputs: [[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]],
        expected: 8,
        isSample: true
      },
      {
        inputs: [[[5]]],
        expected: 5,
        isSample: false
      }
    ],
    tags: ["matrix", "array"]
  },
  {
    title: "Invert Binary Tree",
    description: "Given the root of a binary tree, invert the tree, and return its root.",
    difficulty: "Easy",
    functionName: "invertTree",
    parameters: [
      { name: "root", type: "tree<number>" }
    ],
    returnType: "tree<number>",
    compareConfig: {
      mode: "STRUCTURAL"
    },
    testCases: [
      {
        inputs: [[4, 2, 7, 1, 3, 6, 9]],
        expected: [4, 7, 2, 9, 6, 3, 1],
        isSample: true
      },
      {
        inputs: [[2, 1, 3]],
        expected: [2, 3, 1],
        isSample: true
      },
      {
        inputs: [[]],
        expected: [],
        isSample: false
      }
    ],
    tags: ["tree", "binary-tree"]
  },
  {
    title: "Binary Tree Level Order Traversal",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    difficulty: "Medium",
    functionName: "levelOrder",
    parameters: [
      { name: "root", type: "tree<number>" }
    ],
    returnType: "matrix<number>",
    compareConfig: {
      mode: "STRUCTURAL"
    },
    testCases: [
      {
        inputs: [[3, 9, 20, null, null, 15, 7]],
        expected: [[3], [9, 20], [15, 7]],
        isSample: true
      },
      {
        inputs: [[1]],
        expected: [[1]],
        isSample: true
      },
      {
        inputs: [[]],
        expected: [],
        isSample: false
      }
    ],
    tags: ["tree", "breadth-first-search", "binary-tree"]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    difficulty: "Easy",
    functionName: "maxProfit",
    parameters: [
      { name: "prices", type: "array<number>" }
    ],
    returnType: "number",
    testCases: [
      {
        inputs: [[7, 1, 5, 3, 6, 4]],
        expected: 5,
        isSample: true
      },
      {
        inputs: [[7, 6, 4, 3, 1]],
        expected: 0,
        isSample: true
      }
    ],
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    difficulty: "Easy",
    functionName: "isAnagram",
    parameters: [
      { name: "s", type: "string" },
      { name: "t", type: "string" }
    ],
    returnType: "boolean",
    testCases: [
      {
        inputs: ["anagram", "nagaram"],
        expected: true,
        isSample: true
      },
      {
        inputs: ["rat", "car"],
        expected: false,
        isSample: true
      }
    ],
    tags: ["string", "hash-map"]
  },
  {
    title: "Merge Sorted Array",
    description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order. The result should be returned as a new array.",
    difficulty: "Easy",
    functionName: "merge",
    parameters: [
      { name: "nums1", type: "array<number>" },
      { name: "m", type: "number" },
      { name: "nums2", type: "array<number>" },
      { name: "n", type: "number" }
    ],
    returnType: "array<number>",
    testCases: [
      {
        inputs: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3],
        expected: [1, 2, 2, 3, 5, 6],
        isSample: true
      },
      {
        inputs: [[1], 1, [], 0],
        expected: [1],
        isSample: true
      },
      {
        inputs: [[0], 0, [1], 1],
        expected: [1],
        isSample: false
      }
    ],
    tags: ["array", "two-pointers"]
  },
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
    functionName: "isValid",
    parameters: [
      { name: "s", type: "string" }
    ],
    returnType: "boolean",
    testCases: [
      {
        inputs: ["()"],
        expected: true,
        isSample: true
      },
      {
        inputs: ["()[]{}"],
        expected: true,
        isSample: true
      },
      {
        inputs: ["(]"],
        expected: false,
        isSample: true
      }
    ],
    tags: ["string", "stack"]
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "Medium",
    functionName: "maxSubArray",
    parameters: [
      { name: "nums", type: "array<number>" }
    ],
    returnType: "number",
    testCases: [
      {
        inputs: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expected: 6,
        isSample: true
      },
      {
        inputs: [[1]],
        expected: 1,
        isSample: true
      },
      {
        inputs: [[5, 4, -1, 7, 8]],
        expected: 23,
        isSample: false
      }
    ],
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    functionName: "climbStairs",
    parameters: [
      { name: "n", type: "number" }
    ],
    returnType: "number",
    testCases: [
      {
        inputs: [2],
        expected: 2,
        isSample: true
      },
      {
        inputs: [3],
        expected: 3,
        isSample: true
      }
    ],
    tags: ["dynamic-programming", "math"]
  },
  {
    title: "Two Sum IV - Input is a BST",
    description: "Given the root of a binary search tree and an integer k, return true if there exist two elements in the BST such that their sum is equal to k.",
    difficulty: "Easy",
    functionName: "findTarget",
    parameters: [
      { name: "root", type: "tree<number>" },
      { name: "k", type: "number" }
    ],
    returnType: "boolean",
    testCases: [
      {
        inputs: [[5, 3, 6, 2, 4, null, 7], 9],
        expected: true,
        isSample: true
      },
      {
        inputs: [[5, 3, 6, 2, 4, null, 7], 28],
        expected: false,
        isSample: true
      }
    ],
    tags: ["tree", "binary-search-tree", "hash-map"]
  },
  {
    title: "Search in a Binary Search Tree",
    description: "You are given the root of a binary search tree (BST) and an integer val. Find the node in the BST that the node's value equals val and return the subtree rooted with that node. If such a node does not exist, return null.",
    difficulty: "Easy",
    functionName: "searchBST",
    parameters: [
      { name: "root", type: "tree<number>" },
      { name: "val", type: "number" }
    ],
    returnType: "tree<number>",
    compareConfig: {
      mode: "STRUCTURAL"
    },
    testCases: [
      {
        inputs: [[4, 2, 7, 1, 3], 2],
        expected: [2, 1, 3],
        isSample: true
      },
      {
        inputs: [[4, 2, 7, 1, 3], 5],
        expected: [],
        isSample: true
      }
    ],
    tags: ["tree", "binary-search-tree"]
  },
  {
    title: "Remove Linked List Elements",
    description: "Given the head of a linked list and an integer val, remove all the nodes of the linked list that has Node.val == val, and return the new head.",
    difficulty: "Easy",
    functionName: "removeElements",
    parameters: [
      { name: "head", type: "linkedlist<number>" },
      { name: "val", type: "number" }
    ],
    returnType: "linkedlist<number>",
    compareConfig: {
      mode: "STRUCTURAL"
    },
    testCases: [
      {
        inputs: [[1, 2, 6, 3, 4, 5, 6], 6],
        expected: [1, 2, 3, 4, 5],
        isSample: true
      },
      {
        inputs: [[], 1],
        expected: [],
        isSample: true
      },
      {
        inputs: [[7, 7, 7, 7], 7],
        expected: [],
        isSample: false
      }
    ],
    tags: ["linked-list"]
  },
  {
    title: "Palindrome Linked List",
    description: "Given the head of a singly linked list, return true if it is a palindrome or false otherwise.",
    difficulty: "Easy",
    functionName: "isPalindrome",
    parameters: [
      { name: "head", type: "linkedlist<number>" }
    ],
    returnType: "boolean",
    testCases: [
      {
        inputs: [[1, 2, 2, 1]],
        expected: true,
        isSample: true
      },
      {
        inputs: [[1, 2]],
        expected: false,
        isSample: true
      }
    ],
    tags: ["linked-list", "two-pointers"]
  },
  {
    title: "Clone Graph",
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
    difficulty: "Medium",
    functionName: "cloneGraph",
    parameters: [
      { name: "node", type: "graph<number>" }
    ],
    returnType: "graph<number>",
    compareConfig: {
      mode: "STRUCTURAL",
      floatTolerance: 0,
      orderInsensitive: true
    },
    testCases: [
      {
        inputs: [[[2, 4], [1, 3], [2, 4], [1, 3]]],
        expected: [[2, 4], [1, 3], [2, 4], [1, 3]],
        isSample: true,
        isHidden: false
      },
      {
        inputs: [[[]]],
        expected: [[]],
        isSample: true,
        isHidden: false
      }
    ],
    tags: ["graph", "bfs", "dfs"]
  }
];

async function seedProblems() {
  await mongoose.connect(MONGO_URI, {
    dbName: DB_NAME,
    serverSelectionTimeoutMS: 20000
  });

  console.log(`Connected to MongoDB: ${MONGO_URI}`);

  let created = 0;
  let updated = 0;

  for (const payload of PROBLEMS) {
    const existing = await Problem.findOne({ title: payload.title }).select("_id");
    if (existing) {
      await Problem.updateOne({ _id: existing._id }, { $set: payload }, { runValidators: true });
      updated += 1;
      console.log(`Updated: ${payload.title}`);
      continue;
    }

    await Problem.create(payload);
    created += 1;
    console.log(`Created: ${payload.title}`);
  }

  const total = await Problem.countDocuments();
  console.log(`Seed complete. Created=${created} Updated=${updated} Total=${total}`);
}

seedProblems()
  .catch((err) => {
    console.error("Problem seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
