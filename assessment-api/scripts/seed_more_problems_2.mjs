
import mongoose from "mongoose";
import Problem from "../models/Problem.mjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/assessment_db";

const MORE_PROBLEMS = [
  {
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    difficulty: "Easy",
    functionName: "search",
    parameters: [
      { name: "nums", type: "array<number>" },
      { name: "target", type: "number" }
    ],
    returnType: "number",
    testCases: [
      { inputs: [[-1, 0, 3, 5, 9, 12], 9], expected: 4, isSample: true },
      { inputs: [[-1, 0, 3, 5, 9, 12], 2], expected: -1, isSample: true }
    ],
    tags: ["array", "binary-search"]
  },
  {
    title: "Implement strStr()",
    description: "Return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack.",
    difficulty: "Easy",
    functionName: "strStr",
    parameters: [
      { name: "haystack", type: "string" },
      { name: "needle", type: "string" }
    ],
    returnType: "number",
    testCases: [
      { inputs: ["hello", "ll"], expected: 2, isSample: true },
      { inputs: ["aaaaa", "bba"], expected: -1, isSample: true },
      { inputs: ["", ""], expected: 0, isSample: false }
    ],
    tags: ["string", "two-pointers"]
  },
  {
    title: "Intersection of Two Arrays II",
    description: "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays and you may return the result in any order.",
    difficulty: "Easy",
    functionName: "intersect",
    parameters: [
      { name: "nums1", type: "array<number>" },
      { name: "nums2", type: "array<number>" }
    ],
    returnType: "array<number>",
    compareConfig: { orderInsensitive: true },
    testCases: [
      { inputs: [[1, 2, 2, 1], [2, 2]], expected: [2, 2], isSample: true },
      { inputs: [[4, 9, 5], [9, 4, 9, 8, 4]], expected: [4, 9], isSample: true }
    ],
    tags: ["array", "hash-table"]
  },
  {
    title: "Missing Number",
    description: "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
    difficulty: "Easy",
    functionName: "missingNumber",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[3, 0, 1]], expected: 2, isSample: true },
      { inputs: [[0, 1]], expected: 2, isSample: true },
      { inputs: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8, isSample: false }
    ],
    tags: ["array", "math", "bit-manipulation"]
  },
  {
    title: "Power of Three",
    description: "Given an integer n, return true if it is a power of three. Otherwise, return false.",
    difficulty: "Easy",
    functionName: "isPowerOfThree",
    parameters: [{ name: "n", type: "number" }],
    returnType: "boolean",
    testCases: [
      { inputs: [27], expected: true, isSample: true },
      { inputs: [0], expected: false, isSample: true },
      { inputs: [9], expected: true, isSample: false },
      { inputs: [45], expected: false, isSample: false }
    ],
    tags: ["math"]
  },
  {
    title: "Symmetric Tree",
    description: "Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).",
    difficulty: "Easy",
    functionName: "isSymmetric",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "boolean",
    testCases: [
      { inputs: [[1, 2, 2, 3, 4, 4, 3]], expected: true, isSample: true },
      { inputs: [[1, 2, 2, null, 3, null, 3]], expected: false, isSample: true }
    ],
    tags: ["tree", "depth-first-search", "breadth-first-search"]
  },
  {
    title: "Same Tree",
    description: "Given the roots of two binary trees p and q, write a function to check if they are the same or not.",
    difficulty: "Easy",
    functionName: "isSameTree",
    parameters: [
      { name: "p", type: "tree<number>" },
      { name: "q", type: "tree<number>" }
    ],
    returnType: "boolean",
    testCases: [
      { inputs: [[1, 2, 3], [1, 2, 3]], expected: true, isSample: true },
      { inputs: [[1, 2], [1, null, 2]], expected: false, isSample: true }
    ],
    tags: ["tree", "depth-first-search"]
  },
  {
    title: "Path Sum",
    description: "Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum.",
    difficulty: "Easy",
    functionName: "hasPathSum",
    parameters: [
      { name: "root", type: "tree<number>" },
      { name: "targetSum", type: "number" }
    ],
    returnType: "boolean",
    testCases: [
      { inputs: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expected: true, isSample: true },
      { inputs: [[1, 2, 3], 5], expected: false, isSample: true },
      { inputs: [[], 0], expected: false, isSample: false }
    ],
    tags: ["tree", "depth-first-search"]
  },
  {
    title: "House Robber",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night. Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
    difficulty: "Medium",
    functionName: "rob",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 2, 3, 1]], expected: 4, isSample: true },
      { inputs: [[2, 7, 9, 3, 1]], expected: 12, isSample: true }
    ],
    tags: ["array", "dynamic-programming"]
  },
  {
    title: "Number of Islands",
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
    difficulty: "Medium",
    functionName: "numIslands",
    parameters: [{ name: "grid", type: "matrix<string>" }],
    returnType: "number",
    testCases: [
      { inputs: [[["1", "1", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "0", "0", "0"]]], expected: 1, isSample: true },
      { inputs: [[["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]]], expected: 3, isSample: true }
    ],
    tags: ["matrix", "depth-first-search", "breadth-first-search"]
  }
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  for (const p of MORE_PROBLEMS) {
    const existing = await Problem.findOne({ title: p.title });
    if (existing) {
      await Problem.updateOne({ _id: existing._id }, { $set: p });
      console.log(`Updated: ${p.title}`);
    } else {
      await Problem.create(p);
      console.log(`Created: ${p.title}`);
    }
  }

  const count = await Problem.countDocuments();
  console.log(`Done. Total problems: ${count}`);
  await mongoose.connection.close();
}

seed().catch(console.error);
