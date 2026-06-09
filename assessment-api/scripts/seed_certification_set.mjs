import mongoose from "mongoose";
import Problem from "../models/Problem.mjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/assessment_db";
const DB_NAME = process.env.MONGO_DB_NAME || "assessment_db";

const PROBLEMS = [
  {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    difficulty: "Medium",
    functionName: "threeSum",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[-1, 0, 1, 2, -1, -4]], expected: [[-1, -1, 2], [-1, 0, 1]], isSample: true },
      { inputs: [[0, 1, 1]], expected: [], isSample: true },
      { inputs: [[0, 0, 0]], expected: [[0, 0, 0]], isSample: false, isHidden: true }
    ],
    tags: ["array", "two-pointers", "sorting"]
  },
  {
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The algorithm must run in O(n) time and without using the division operation.",
    difficulty: "Medium",
    functionName: "productExceptSelf",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "array<number>",
    testCases: [
      { inputs: [[1, 2, 3, 4]], expected: [24, 12, 8, 6], isSample: true },
      { inputs: [[-1, 1, 0, -3, 3]], expected: [0, 0, 9, 0, 0], isSample: true }
    ],
    tags: ["array", "prefix-sum"]
  },
  {
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. The algorithm must run in O(n) time.",
    difficulty: "Medium",
    functionName: "longestConsecutive",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[100, 4, 200, 1, 3, 2]], expected: 4, isSample: true },
      { inputs: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9, isSample: true }
    ],
    tags: ["array", "hash-map", "union-find"]
  },
  {
    title: "Subarray Sum Equals K",
    description: "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.",
    difficulty: "Medium",
    functionName: "subarraySum",
    parameters: [{ name: "nums", type: "array<number>" }, { name: "k", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 1, 1], 2], expected: 2, isSample: true },
      { inputs: [[1, 2, 3], 3], expected: 2, isSample: true }
    ],
    tags: ["array", "hash-map", "prefix-sum"]
  },
  {
    title: "Container With Most Water",
    description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
    difficulty: "Medium",
    functionName: "maxArea",
    parameters: [{ name: "height", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49, isSample: true },
      { inputs: [[1, 1]], expected: 1, isSample: true }
    ],
    tags: ["array", "two-pointers", "greedy"]
  },
  {
    title: "First Missing Positive",
    description: "Given an unsorted integer array nums, return the smallest missing positive integer. The algorithm must run in O(n) time and use O(1) auxiliary space.",
    difficulty: "Hard",
    functionName: "firstMissingPositive",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 2, 0]], expected: 3, isSample: true },
      { inputs: [[3, 4, -1, 1]], expected: 2, isSample: true },
      { inputs: [[7, 8, 9, 11, 12]], expected: 1, isSample: false, isHidden: true }
    ],
    tags: ["array", "hash-map"]
  },
  {
    title: "Trapping Rain Water",
    description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    difficulty: "Hard",
    functionName: "trap",
    parameters: [{ name: "height", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6, isSample: true },
      { inputs: [[4, 2, 0, 3, 2, 5]], expected: 9, isSample: true }
    ],
    tags: ["array", "two-pointers", "stack", "dynamic-programming"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    functionName: "lengthOfLongestSubstring",
    parameters: [{ name: "s", type: "string" }],
    returnType: "number",
    testCases: [
      { inputs: ["abcabcbb"], expected: 3, isSample: true },
      { inputs: ["bbbbb"], expected: 1, isSample: true },
      { inputs: ["pwwkew"], expected: 3, isSample: true }
    ],
    tags: ["string", "hash-map", "sliding-window"]
  },
  {
    title: "Group Anagrams",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
    difficulty: "Medium",
    functionName: "groupAnagrams",
    parameters: [{ name: "strs", type: "array<string>" }],
    returnType: "matrix<string>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [["eat", "tea", "tan", "ate", "nat", "bat"]], expected: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]], isSample: true },
      { inputs: [[""]], expected: [[""]], isSample: true },
      { inputs: [["a"]], expected: [["a"]], isSample: true }
    ],
    tags: ["string", "hash-map", "sorting"]
  },
  {
    title: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Medium",
    functionName: "longestPalindrome",
    parameters: [{ name: "s", type: "string" }],
    returnType: "string",
    testCases: [
      { inputs: ["babad"], expected: "bab", isSample: true },
      { inputs: ["cbbd"], expected: "bb", isSample: true }
    ],
    tags: ["string", "dynamic-programming"]
  },
  {
    title: "Decode String",
    description: "Given an encoded string, return its decoded string. The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is being repeated exactly k times.",
    difficulty: "Medium",
    functionName: "decodeString",
    parameters: [{ name: "s", type: "string" }],
    returnType: "string",
    testCases: [
      { inputs: ["3[a]2[bc]"], expected: "aaabcbc", isSample: true },
      { inputs: ["3[a2[c]]"], expected: "accaccacc", isSample: true }
    ],
    tags: ["string", "stack", "recursion"]
  },
  {
    title: "Minimum Window Substring",
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string \"\".",
    difficulty: "Hard",
    functionName: "minWindow",
    parameters: [{ name: "s", type: "string" }, { name: "t", type: "string" }],
    returnType: "string",
    testCases: [
      { inputs: ["ADOBECODEBANC", "ABC"], expected: "BANC", isSample: true },
      { inputs: ["a", "a"], expected: "a", isSample: true }
    ],
    tags: ["string", "hash-map", "sliding-window"]
  },
  {
    title: "Regular Expression Matching",
    description: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' matches any single character and '*' matches zero or more of the preceding element.",
    difficulty: "Hard",
    functionName: "isMatch",
    parameters: [{ name: "s", type: "string" }, { name: "p", type: "string" }],
    returnType: "boolean",
    testCases: [
      { inputs: ["aa", "a"], expected: false, isSample: true },
      { inputs: ["aa", "a*"], expected: true, isSample: true }
    ],
    tags: ["string", "dynamic-programming", "recursion"]
  },
  {
    title: "Top K Frequent Elements",
    description: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
    difficulty: "Medium",
    functionName: "topKFrequent",
    parameters: [{ name: "nums", type: "array<number>" }, { name: "k", type: "number" }],
    returnType: "array<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2], isSample: true }
    ],
    tags: ["array", "hash-map", "heap", "sorting"]
  },
  {
    title: "Find All Anagrams in a String",
    description: "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
    difficulty: "Medium",
    functionName: "findAnagrams",
    parameters: [{ name: "s", type: "string" }, { name: "p", type: "string" }],
    returnType: "array<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: ["cbaebabacd", "abc"], expected: [0, 6], isSample: true }
    ],
    tags: ["string", "hash-map", "sliding-window"]
  },
  {
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    difficulty: "Medium",
    functionName: "addTwoNumbers",
    parameters: [{ name: "l1", type: "linkedlist<number>" }, { name: "l2", type: "linkedlist<number>" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8], isSample: true }
    ],
    tags: ["linked-list", "math"]
  },
  {
    title: "Remove Nth Node From End",
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    difficulty: "Medium",
    functionName: "removeNthFromEnd",
    parameters: [{ name: "head", type: "linkedlist<number>" }, { name: "n", type: "number" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5], isSample: true }
    ],
    tags: ["linked-list", "two-pointers"]
  },
  {
    title: "Reorder List",
    description: "You are given the head of a singly linked-list. Reorder the list to be in the following form: L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → ... Return the head of the reordered list.",
    difficulty: "Medium",
    functionName: "reorderList",
    parameters: [{ name: "head", type: "linkedlist<number>" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[1, 2, 3, 4]], expected: [1, 4, 2, 3], isSample: true }
    ],
    tags: ["linked-list", "two-pointers"]
  },
  {
    title: "Odd Even Linked List",
    description: "Given the head of a singly linked list, group all the nodes with odd indices together followed by the nodes with even indices, and return the reordered list.",
    difficulty: "Medium",
    functionName: "oddEvenList",
    parameters: [{ name: "head", type: "linkedlist<number>" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[1, 2, 3, 4, 5]], expected: [1, 3, 5, 2, 4], isSample: true }
    ],
    tags: ["linked-list"]
  },
  {
    title: "Merge K Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "Hard",
    functionName: "mergeKLists",
    parameters: [{ name: "lists", type: "array<linkedlist<number>>" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expected: [1, 1, 2, 3, 4, 4, 5, 6], isSample: true }
    ],
    tags: ["linked-list", "heap", "merge-sort"]
  },
  {
    title: "Reverse Nodes in K Group",
    description: "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.",
    difficulty: "Hard",
    functionName: "reverseKGroup",
    parameters: [{ name: "head", type: "linkedlist<number>" }, { name: "k", type: "number" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5], isSample: true }
    ],
    tags: ["linked-list", "recursion"]
  },
  {
    title: "Daily Temperatures",
    description: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.",
    difficulty: "Medium",
    functionName: "dailyTemperatures",
    parameters: [{ name: "temperatures", type: "array<number>" }],
    returnType: "array<number>",
    testCases: [
      { inputs: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0], isSample: true }
    ],
    tags: ["array", "stack", "monotonic-stack"]
  },
  {
    title: "Evaluate Reverse Polish Notation",
    description: "You are given an array of strings tokens that represents an arithmetic expression in a Reverse Polish Notation. Evaluate the expression.",
    difficulty: "Medium",
    functionName: "evalRPN",
    parameters: [{ name: "tokens", type: "array<string>" }],
    returnType: "number",
    testCases: [
      { inputs: [["2", "1", "+", "3", "*"]], expected: 9, isSample: true }
    ],
    tags: ["stack", "math"]
  },
  {
    title: "Largest Rectangle in Histogram",
    description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    difficulty: "Hard",
    functionName: "largestRectangleArea",
    parameters: [{ name: "heights", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[2, 1, 5, 6, 2, 3]], expected: 10, isSample: true }
    ],
    tags: ["stack", "monotonic-stack"]
  },
  {
    title: "Sliding Window Maximum",
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.",
    difficulty: "Hard",
    functionName: "maxSlidingWindow",
    parameters: [{ name: "nums", type: "array<number>" }, { name: "k", type: "number" }],
    returnType: "array<number>",
    testCases: [
      { inputs: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7], isSample: true }
    ],
    tags: ["queue", "sliding-window", "monotonic-queue"]
  },
  {
    title: "Shortest Subarray With Sum At Least K",
    description: "Given an integer array nums and an integer k, return the length of the shortest non-empty subarray of nums with a sum of at least k. If there is no such subarray, return -1.",
    difficulty: "Hard",
    functionName: "shortestSubarray",
    parameters: [{ name: "nums", type: "array<number>" }, { name: "k", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[1], 1], expected: 1, isSample: true },
      { inputs: [[1, 2], 4], expected: -1, isSample: true }
    ],
    tags: ["queue", "sliding-window", "prefix-sum", "monotonic-queue"]
  },
  {
    title: "Binary Tree Level Order Traversal",
    description: "Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
    difficulty: "Medium",
    functionName: "levelOrder",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]], isSample: true }
    ],
    tags: ["tree", "breadth-first-search"]
  },
  {
    title: "Path Sum II",
    description: "Given the root of a binary tree and an integer targetSum, return all root-to-leaf paths where the sum of the node values in the path equals targetSum.",
    difficulty: "Medium",
    functionName: "pathSum",
    parameters: [{ name: "root", type: "tree<number>" }, { name: "targetSum", type: "number" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expected: [[5, 4, 11, 2], [5, 8, 4, 5]], isSample: true }
    ],
    tags: ["tree", "depth-first-search", "backtracking"]
  },
  {
    title: "Lowest Common Ancestor of a Binary Tree",
    description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.",
    difficulty: "Medium",
    functionName: "lowestCommonAncestor",
    parameters: [{ name: "root", type: "tree<number>" }, { name: "p", type: "number" }, { name: "q", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3, isSample: true }
    ],
    tags: ["tree", "depth-first-search"]
  },
  {
    title: "Validate Binary Search Tree",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    difficulty: "Medium",
    functionName: "isValidBST",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "boolean",
    testCases: [
      { inputs: [[2, 1, 3]], expected: true, isSample: true },
      { inputs: [[5, 1, 4, null, null, 3, 6]], expected: false, isSample: true }
    ],
    tags: ["tree", "depth-first-search", "binary-search-tree"]
  },
  {
    title: "Binary Tree Maximum Path Sum",
    description: "Given the root of a binary tree, return the maximum path sum of any non-empty path.",
    difficulty: "Hard",
    functionName: "maxPathSum",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 2, 3]], expected: 6, isSample: true },
      { inputs: [[-10, 9, 20, null, null, 15, 7]], expected: 42, isSample: true }
    ],
    tags: ["tree", "depth-first-search", "dynamic-programming"]
  },
  {
    title: "Kth Smallest Element in a BST",
    description: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    difficulty: "Medium",
    functionName: "kthSmallest",
    parameters: [{ name: "root", type: "tree<number>" }, { name: "k", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[3, 1, 4, null, 2], 1], expected: 1, isSample: true }
    ],
    tags: ["tree", "binary-search-tree"]
  },
  {
    title: "Convert BST to Greater Tree",
    description: "Given the root of a Binary Search Tree (BST), convert it to a Greater Tree such that every key of the original BST is changed to the original key plus the sum of all keys greater than the original key in BST.",
    difficulty: "Medium",
    functionName: "convertBST",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "tree<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]], expected: [30, 36, 21, 36, 35, 26, 15, null, null, null, 33, null, null, null, 8], isSample: true }
    ],
    tags: ["tree", "binary-search-tree"]
  },
  {
    title: "Recover Binary Search Tree",
    description: "You are given the root of a binary search tree (BST), where the values of exactly two nodes of the tree were swapped by mistake. Recover the tree without changing its structure.",
    difficulty: "Hard",
    functionName: "recoverTree",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "tree<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[1, 3, null, null, 2]], expected: [3, 1, null, null, 2], isSample: true }
    ],
    tags: ["tree", "binary-search-tree"]
  },
  {
    title: "K Closest Points to Origin",
    description: "Given an array of points where points[i] = [xi, yi] and an integer k, return the k closest points to the origin (0, 0).",
    difficulty: "Medium",
    functionName: "kClosest",
    parameters: [{ name: "points", type: "matrix<number>" }, { name: "k", type: "number" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[[1, 3], [-2, 2]], 1], expected: [[-2, 2]], isSample: true }
    ],
    tags: ["heap", "sorting", "quickselect"]
  },
  {
    title: "Search in Rotated Sorted Array",
    description: "Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
    difficulty: "Medium",
    functionName: "search",
    parameters: [{ name: "nums", type: "array<number>" }, { name: "target", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, isSample: true }
    ],
    tags: ["array", "binary-search"]
  },
  {
    title: "Find Peak Element",
    description: "A peak element is an element that is strictly greater than its neighbors. Given a 0-indexed integer array nums, find a peak element, and return its index.",
    difficulty: "Medium",
    functionName: "findPeakElement",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 2, 3, 1]], expected: 2, isSample: true }
    ],
    tags: ["array", "binary-search"]
  },
  {
    title: "Koko Eating Bananas",
    description: "Return the minimum integer k such that Koko can eat all the bananas within h hours.",
    difficulty: "Medium",
    functionName: "minEatingSpeed",
    parameters: [{ name: "piles", type: "array<number>" }, { name: "h", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[3, 6, 7, 11], 8], expected: 4, isSample: true }
    ],
    tags: ["array", "binary-search"]
  },
  {
    title: "Median of Two Sorted Arrays",
    description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
    difficulty: "Hard",
    functionName: "findMedianSortedArrays",
    parameters: [{ name: "nums1", type: "array<number>" }, { name: "nums2", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 3], [2]], expected: 2.0, isSample: true }
    ],
    tags: ["array", "binary-search", "divide-and-conquer"]
  },
  {
    title: "Clone Graph",
    description: "Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.",
    difficulty: "Medium",
    functionName: "cloneGraph",
    parameters: [{ name: "node", type: "graph<number>" }],
    returnType: "graph<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expected: [[2, 4], [1, 3], [2, 4], [1, 3]], isSample: true }
    ],
    tags: ["graph", "breadth-first-search", "depth-first-search"]
  },
  {
    title: "Course Schedule",
    description: "Return true if you can finish all courses. Otherwise, return false.",
    difficulty: "Medium",
    functionName: "canFinish",
    parameters: [{ name: "numCourses", type: "number" }, { name: "prerequisites", type: "matrix<number>" }],
    returnType: "boolean",
    testCases: [
      { inputs: [2, [[1, 0]]], expected: true, isSample: true }
    ],
    tags: ["graph", "topological-sort"]
  },
  {
    title: "Course Schedule II",
    description: "Return the ordering of courses you should take to finish all courses.",
    difficulty: "Medium",
    functionName: "findOrder",
    parameters: [{ name: "numCourses", type: "number" }, { name: "prerequisites", type: "matrix<number>" }],
    returnType: "array<number>",
    testCases: [
      { inputs: [2, [[1, 0]]], expected: [0, 1], isSample: true }
    ],
    tags: ["graph", "topological-sort"]
  },
  {
    title: "Network Delay Time",
    description: "Return the minimum time it takes for all the n nodes to receive the signal. If it is impossible, return -1.",
    difficulty: "Medium",
    functionName: "networkDelayTime",
    parameters: [{ name: "times", type: "matrix<number>" }, { name: "n", type: "number" }, { name: "k", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2, isSample: true }
    ],
    tags: ["graph", "shortest-path", "dijkstra"]
  },
  {
    title: "Word Ladder",
    description: "Return the number of words in the shortest transformation sequence from beginWord to endWord.",
    difficulty: "Hard",
    functionName: "ladderLength",
    parameters: [{ name: "beginWord", type: "string" }, { name: "endWord", type: "string" }, { name: "wordList", type: "array<string>" }],
    returnType: "number",
    testCases: [
      { inputs: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]], expected: 5, isSample: true }
    ],
    tags: ["breadth-first-search", "string"]
  },
  {
    title: "Combination Sum",
    description: "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.",
    difficulty: "Medium",
    functionName: "combinationSum",
    parameters: [{ name: "candidates", type: "array<number>" }, { name: "target", type: "number" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[2, 3, 6, 7], 7], expected: [[2, 2, 3], [7]], isSample: true }
    ],
    tags: ["backtracking"]
  },
  {
    title: "Permutations",
    description: "Given an array nums of distinct integers, return all the possible permutations. You can return the answer in any order.",
    difficulty: "Medium",
    functionName: "permute",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[1, 2, 3]], expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]], isSample: true }
    ],
    tags: ["backtracking"]
  },
  {
    title: "Subsets",
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
    difficulty: "Medium",
    functionName: "subsets",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[1, 2, 3]], expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]], isSample: true }
    ],
    tags: ["backtracking"]
  },
  {
    title: "Letter Combinations of a Phone Number",
    description: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.",
    difficulty: "Medium",
    functionName: "letterCombinations",
    parameters: [{ name: "digits", type: "string" }],
    returnType: "array<string>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: ["23"], expected: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"], isSample: true }
    ],
    tags: ["backtracking", "string"]
  },
  {
    title: "N-Queens",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Given an integer n, return all distinct solutions to the n-queens puzzle.",
    difficulty: "Hard",
    functionName: "solveNQueens",
    parameters: [{ name: "n", type: "number" }],
    returnType: "matrix<string>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [4], expected: [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]], isSample: true }
    ],
    tags: ["backtracking"]
  },
  {
    title: "Coin Change",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
    difficulty: "Medium",
    functionName: "coinChange",
    parameters: [{ name: "coins", type: "array<number>" }, { name: "amount", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 2, 5], 11], expected: 3, isSample: true }
    ],
    tags: ["dynamic-programming"]
  },
  {
    title: "Longest Increasing Subsequence",
    description: "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
    difficulty: "Medium",
    functionName: "lengthOfLIS",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4, isSample: true }
    ],
    tags: ["dynamic-programming"]
  },
  {
    title: "House Robber II",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle. Return the maximum amount of money you can rob tonight without alerting the police.",
    difficulty: "Medium",
    functionName: "rob",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[2, 3, 2]], expected: 3, isSample: true }
    ],
    tags: ["dynamic-programming"]
  },
  {
    title: "Partition Equal Subset Sum",
    description: "Given a non-empty array nums containing only positive integers, find if the array can be partitioned into two subsets such that the sum of elements in both subsets is equal.",
    difficulty: "Medium",
    functionName: "canPartition",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "boolean",
    testCases: [
      { inputs: [[1, 5, 11, 5]], expected: true, isSample: true }
    ],
    tags: ["dynamic-programming"]
  },
  {
    title: "Edit Distance",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.",
    difficulty: "Hard",
    functionName: "minDistance",
    parameters: [{ name: "word1", type: "string" }, { name: "word2", type: "string" }],
    returnType: "number",
    testCases: [
      { inputs: ["horse", "ros"], expected: 3, isSample: true }
    ],
    tags: ["dynamic-programming", "string"]
  },
  {
    title: "Burst Balloons",
    description: "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it represented by an array nums. You are asked to burst all the balloons. Return the maximum coins you can collect by bursting the balloons wisely.",
    difficulty: "Hard",
    functionName: "maxCoins",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[3, 1, 5, 8]], expected: 167, isSample: true }
    ],
    tags: ["dynamic-programming"]
  },
  {
    title: "Longest Valid Parentheses",
    description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    difficulty: "Hard",
    functionName: "longestValidParentheses",
    parameters: [{ name: "s", type: "string" }],
    returnType: "number",
    testCases: [
      { inputs: ["(()"], expected: 2, isSample: true },
      { inputs: [")()())"], expected: 4, isSample: true }
    ],
    tags: ["dynamic-programming", "string", "stack"]
  },
  {
    title: "Jump Game",
    description: "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
    difficulty: "Medium",
    functionName: "canJump",
    parameters: [{ name: "nums", type: "array<number>" }],
    returnType: "boolean",
    testCases: [
      { inputs: [[2, 3, 1, 1, 4]], expected: true, isSample: true },
      { inputs: [[3, 2, 1, 0, 4]], expected: false, isSample: true }
    ],
    tags: ["greedy", "array"]
  },
  {
    title: "Gas Station",
    description: "There are n gas stations along a circular route, where the amount of gas at the ith station is gas[i]. You have a car with an unlimited gas tank and it costs cost[i] of gas to travel from the ith station to its next (i + 1)th station. You begin the journey with an empty tank at one of the gas stations. Return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return -1.",
    difficulty: "Medium",
    functionName: "canCompleteCircuit",
    parameters: [{ name: "gas", type: "array<number>" }, { name: "cost", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3, isSample: true }
    ],
    tags: ["greedy", "array"]
  },
  {
    title: "Task Scheduler",
    description: "Given a characters array tasks, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. For each unit of time, the CPU could complete either one task or just be idle. However, there is a non-negative integer n that represents the cooldown period between two same tasks. Return the least number of units of times that the CPU will take to finish all the given tasks.",
    difficulty: "Medium",
    functionName: "leastInterval",
    parameters: [{ name: "tasks", type: "array<string>" }, { name: "n", type: "number" }],
    returnType: "number",
    testCases: [
      { inputs: [["A", "A", "A", "B", "B", "B"], 2], expected: 8, isSample: true }
    ],
    tags: ["greedy", "array", "heap"]
  },
  {
    title: "Candy",
    description: "There are n children standing in a line. Each child is assigned a rating value given in the integer array ratings. You are giving candies to these children subjected to the following requirements: Each child must have at least one candy. Children with a higher rating get more candies than their neighbors. Return the minimum number of candies you need to have to distribute the candies to the children.",
    difficulty: "Hard",
    functionName: "candy",
    parameters: [{ name: "ratings", type: "array<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[1, 0, 2]], expected: 5, isSample: true },
      { inputs: [[1, 2, 2]], expected: 4, isSample: true }
    ],
    tags: ["greedy", "array"]
  },
  {
    title: "Number of Connected Components in an Undirected Graph",
    description: "You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph. Return the number of connected components in the graph.",
    difficulty: "Medium",
    functionName: "countComponents",
    parameters: [{ name: "n", type: "number" }, { name: "edges", type: "matrix<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2, isSample: true }
    ],
    tags: ["union-find", "graph"]
  },
  {
    title: "Redundant Connection",
    description: "In this problem, a tree is an undirected graph that is connected and has no cycles. You are given a graph that started as a tree with n nodes labeled from 1 to n, with one additional edge added. Return an edge that can be removed so that the resulting graph is a tree of n nodes. If there are multiple answers, return the answer that occurs last in the input.",
    difficulty: "Medium",
    functionName: "findRedundantConnection",
    parameters: [{ name: "edges", type: "matrix<number>" }],
    returnType: "array<number>",
    testCases: [
      { inputs: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3], isSample: true }
    ],
    tags: ["union-find", "graph"]
  },
  {
    title: "Accounts Merge",
    description: "Given a list of accounts where each element accounts[i] is a list of strings, where the first element accounts[i][0] is a name, and the rest of the elements are emails representing that account. Now, we would like to merge these accounts. Two accounts definitely belong to the same person if there is some common email to both accounts. Return the merged accounts in any order.",
    difficulty: "Hard",
    functionName: "accountsMerge",
    parameters: [{ name: "accounts", type: "matrix<string>" }],
    returnType: "matrix<string>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[["John", "johnsmith@mail.com", "john_newyork@mail.com"], ["John", "johnsmith@mail.com", "john00@mail.com"], ["Mary", "mary@mail.com"], ["John", "johnnybravo@mail.com"]]], expected: [["John", "john00@mail.com", "john_newyork@mail.com", "johnsmith@mail.com"], ["Mary", "mary@mail.com"], ["John", "johnnybravo@mail.com"]], isSample: true }
    ],
    tags: ["union-find", "graph", "string"]
  },
  {
    title: "Reverse Linked List (Certification)",
    description: "Special case: empty list.",
    difficulty: "Easy",
    functionName: "reverseList",
    parameters: [{ name: "head", type: "linkedlist<number>" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[]], expected: [], isSample: true }
    ],
    tags: ["linked-list", "certification"]
  },
  {
    title: "Maximum Depth of Binary Tree (Certification)",
    description: "Special case: null root.",
    difficulty: "Easy",
    functionName: "maxDepth",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "number",
    testCases: [
      { inputs: [[]], expected: 0, isSample: true }
    ],
    tags: ["tree", "certification"]
  },
  {
    title: "Clone Graph (Certification)",
    description: "Special case: single node cycle.",
    difficulty: "Medium",
    functionName: "cloneGraph",
    parameters: [{ name: "node", type: "graph<number>" }],
    returnType: "graph<number>",
    compareConfig: { mode: "STRUCTURAL", orderInsensitive: true },
    testCases: [
      { inputs: [[[0]]], expected: [[0]], isSample: true }
    ],
    tags: ["graph", "certification"]
  },
  {
    title: "Merge Two Sorted Lists (Certification)",
    description: "Special case: one empty list.",
    difficulty: "Easy",
    functionName: "mergeTwoLists",
    parameters: [{ name: "l1", type: "linkedlist<number>" }, { name: "l2", type: "linkedlist<number>" }],
    returnType: "linkedlist<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[], [1]], expected: [1], isSample: true }
    ],
    tags: ["linked-list", "certification"]
  },
  {
    title: "Level Order Traversal (Certification)",
    description: "Special case: empty tree.",
    difficulty: "Medium",
    functionName: "levelOrder",
    parameters: [{ name: "root", type: "tree<number>" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[]], expected: [], isSample: true }
    ],
    tags: ["tree", "certification"]
  },
  {
    title: "Two Sum (Certification)",
    description: "Special case: duplicate values.",
    difficulty: "Easy",
    functionName: "twoSum",
    parameters: [{ name: "nums", type: "array<number>" }, { name: "target", type: "number" }],
    returnType: "array<number>",
    testCases: [
      { inputs: [[3, 3], 6], expected: [0, 1], isSample: true }
    ],
    tags: ["array", "certification"]
  },
  {
    title: "Rotate Image (Certification)",
    description: "Special case: 1x1 matrix.",
    difficulty: "Medium",
    functionName: "rotate",
    parameters: [{ name: "matrix", type: "matrix<number>" }],
    returnType: "matrix<number>",
    compareConfig: { mode: "STRUCTURAL" },
    testCases: [
      { inputs: [[[1]]], expected: [[1]], isSample: true }
    ],
    tags: ["matrix", "certification"]
  },
  {
    title: "Number of Islands (All Water)",
    description: "Special case: all water.",
    difficulty: "Medium",
    functionName: "numIslands",
    parameters: [{ name: "grid", type: "matrix<string>" }],
    returnType: "number",
    testCases: [
      { inputs: [[["0", "0"], ["0", "0"]]], expected: 0, isSample: true }
    ],
    tags: ["matrix", "certification"]
  },
  {
    title: "Number of Islands (All Land)",
    description: "Special case: all land.",
    difficulty: "Medium",
    functionName: "numIslands",
    parameters: [{ name: "grid", type: "matrix<string>" }],
    returnType: "number",
    testCases: [
      { inputs: [[["1", "1"], ["1", "1"]]], expected: 1, isSample: true }
    ],
    tags: ["matrix", "certification"]
  },
  {
    title: "Course Schedule (Cycle)",
    description: "Special case: cycle.",
    difficulty: "Medium",
    functionName: "canFinish",
    parameters: [{ name: "numCourses", type: "number" }, { name: "prerequisites", type: "matrix<number>" }],
    returnType: "boolean",
    testCases: [
      { inputs: [2, [[1, 0], [0, 1]]], expected: false, isSample: true }
    ],
    tags: ["graph", "certification"]
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
