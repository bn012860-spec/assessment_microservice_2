
import mongoose from "mongoose";
import Problem from "../models/Problem.mjs";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/assessment_db";

const MORE_PROBLEMS = [
  {
    title: "Valid Palindrome II",
    description: "Given a string s, return true if the s can be palindrome after deleting at most one character from it.",
    difficulty: "Easy",
    functionName: "validPalindrome",
    parameters: [{ name: "s", type: "string" }],
    returnType: "boolean",
    testCases: [
      { inputs: ["aba"], expected: true, isSample: true },
      { inputs: ["abca"], expected: true, isSample: true },
      { inputs: ["abc"], expected: false, isSample: true }
    ],
    tags: ["string", "two-pointers"]
  },
  {
    title: "Intersection of Two Arrays",
    description: "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.",
    difficulty: "Easy",
    functionName: "intersection",
    parameters: [
      { name: "nums1", type: "array<number>" },
      { name: "nums2", type: "array<number>" }
    ],
    returnType: "array<number>",
    compareConfig: { orderInsensitive: true },
    testCases: [
      { inputs: [[1, 2, 2, 1], [2, 2]], expected: [2], isSample: true },
      { inputs: [[4, 9, 5], [9, 4, 9, 8, 4]], expected: [9, 4], isSample: true }
    ],
    tags: ["array", "hash-table"]
  },
  {
    title: "Word Pattern",
    description: "Given a pattern and a string s, find if s follows the same pattern. Here follow means a full match, such that there is a bijection between a letter in pattern and a non-empty word in s.",
    difficulty: "Easy",
    functionName: "wordPattern",
    parameters: [
      { name: "pattern", type: "string" },
      { name: "s", type: "string" }
    ],
    returnType: "boolean",
    testCases: [
      { inputs: ["abba", "dog cat cat dog"], expected: true, isSample: true },
      { inputs: ["abba", "dog cat cat fish"], expected: false, isSample: true },
      { inputs: ["aaaa", "dog cat cat dog"], expected: false, isSample: false }
    ],
    tags: ["string", "hash-table"]
  },
  {
    title: "Isomorphic Strings",
    description: "Given two strings s and t, determine if they are isomorphic. Two strings s and t are isomorphic if the characters in s can be replaced to get t.",
    difficulty: "Easy",
    functionName: "isIsomorphic",
    parameters: [
      { name: "s", type: "string" },
      { name: "t", type: "string" }
    ],
    returnType: "boolean",
    testCases: [
      { inputs: ["egg", "add"], expected: true, isSample: true },
      { inputs: ["foo", "bar"], expected: false, isSample: true },
      { inputs: ["paper", "title"], expected: true, isSample: false }
    ],
    tags: ["string", "hash-table"]
  },
  {
    title: "Happy Number",
    description: "Write an algorithm to determine if a number n is happy. A happy number is a number defined by the following process: Starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1. Those numbers for which this process ends in 1 are happy. Return true if n is a happy number, and false if not.",
    difficulty: "Easy",
    functionName: "isHappy",
    parameters: [{ name: "n", type: "number" }],
    returnType: "boolean",
    testCases: [
      { inputs: [19], expected: true, isSample: true },
      { inputs: [2], expected: false, isSample: true }
    ],
    tags: ["math", "hash-table", "two-pointers"]
  },
  {
    title: "Excel Sheet Column Number",
    description: "Given a string columnTitle that represents the column title as appears in an Excel sheet, return its corresponding column number.",
    difficulty: "Easy",
    functionName: "titleToNumber",
    parameters: [{ name: "columnTitle", type: "string" }],
    returnType: "number",
    testCases: [
      { inputs: ["A"], expected: 1, isSample: true },
      { inputs: ["AB"], expected: 28, isSample: true },
      { inputs: ["ZY"], expected: 701, isSample: false }
    ],
    tags: ["math", "string"]
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
