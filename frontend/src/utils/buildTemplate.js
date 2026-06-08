import { mapType } from './typeValidator';

export function detectUses(parameters = [], returnType = '') {
  const uses = { tree: false, list: false, graph: false };
  const allTypes = [ ...(parameters || []).map(p => (p.type || '').toString()), (returnType || '').toString() ];
  for (const raw of allTypes) {
    const t = (raw || '').toLowerCase();
    if (!t) continue;
    if (t.includes('tree')) uses.tree = true;
    if (t.includes('linkedlist') || t.includes('listnode') || t === 'list' || t.includes('list')) uses.list = true;
    if (t.includes('graph')) uses.graph = true;
  }
  return uses;
}

export function getDefinitionsSnippet(language, parameters = [], returnType = '') {
  const { tree, list, graph } = detectUses(parameters, returnType);
  if (!tree && !list && !graph) return '';

  // Provide a concise, language-appropriate snippet containing only the structure definitions
  switch ((language || '').toLowerCase()) {
    case 'python': {
      let out = '';
      if (list) out += `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n`;
      if (tree) out += `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\n`;
      if (graph) out += `class Node:\n    def __init__(self, val=0, neighbors=None):\n        self.val = val\n        self.neighbors = neighbors if neighbors is not None else []\n\n`;
      return out.trim();
    }
    case 'javascript':
    case 'node':
    case 'js': {
      let out = '';
      if (list) out += `class ListNode { constructor(val=0, next=null) { this.val = val; this.next = next; } }\n\n`;
      if (tree) out += `class TreeNode { constructor(val=0, left=null, right=null) { this.val = val; this.left = left; this.right = right; } }\n\n`;
      if (graph) out += `class Node { constructor(val=0, neighbors=[]) { this.val = val; this.neighbors = neighbors; } }\n\n`;
      return out.trim();
    }
    default: {
      // Default to Java-like definitions (familiar and explicit)
      let out = '';
      if (list) out += `/*\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() { val = 0; next = null; }\n    ListNode(int val) { this.val = val; next = null; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n*/\n\n`;
      if (tree) out += `/*\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() { val = 0; left = right = null; }\n    TreeNode(int val) { this.val = val; left = right = null; }\n    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }\n}\n*/\n\n`;
      if (graph) out += `/*\nclass Node {\n    public int val;\n    public List<Node> neighbors;\n    public Node() { val = 0; neighbors = new ArrayList<>(); }\n    public Node(int val) { this.val = val; neighbors = new ArrayList<>(); }\n    public Node(int val, List<Node> neighbors) { this.val = val; this.neighbors = neighbors; }\n}\n*/\n\n`;
      return out.trim();
    }
  }
}

export default function buildTemplate(language, functionName, parameters = [], returnType = '') {
  const { tree: usesTree, list: usesList, graph: usesGraph } = detectUses(parameters, returnType);
  const paramNames = (parameters || []).map(p => p.name || 'arg');
  const params = paramNames.join(', ');

  if ((language || '').toLowerCase() === 'python') {
    let defs = '';
    if (usesList) defs += `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\n`;
    if (usesTree) defs += `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        this.right = right\n\n`.replace('this.', '');
    if (usesGraph) defs += `class Node:\n    def __init__(self, val=0, neighbors=None):\n        self.val = val\n        self.neighbors = neighbors if neighbors is not None else []\n\n`;
    defs += `def ${functionName}(${params}):\n    # your code here\n    pass`;
    return defs;
  }

  if ((language || '').toLowerCase() === 'javascript' || (language || '').toLowerCase() === 'typescript') {
    let defs = '';
    if (usesList) defs += `class ListNode {\n  constructor(val=0, next=null) { this.val = val; this.next = next; }\n}\n\n`;
    if (usesTree) defs += `class TreeNode {\n  constructor(val=0, left=null, right=null) { this.val = val; this.left = left; this.right = right; }\n}\n\n`;
    if (usesGraph) defs += `class Node {\n  constructor(val=0, neighbors=[]) { this.val = val; this.neighbors = neighbors; }\n}\n\n`;
    defs += `function ${functionName}(${params}) {\n  // your code here\n}`;
    return defs;
  }

  if ((language || '').toLowerCase() === 'java') {
    // keep similar behavior to previous implementation
    const javaParams = (parameters || []).map(p => `${p.type || 'int'} ${p.name || 'arg'}`).join(', ');
    let defs = 'import java.util.*;\n\n';
    if (usesList) {
      defs += `/*\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode() { val = 0; next = null; }\n    ListNode(int val) { this.val = val; next = null; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n*/\n\n`;
    }
    if (usesTree) {
      defs += `/*\nclass TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() { val = 0; left = right = null; }\n    TreeNode(int val) { this.val = val; left = right = null; }\n    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }\n}\n*/\n\n`;
    }
    if (usesGraph) {
      defs += `/*\nclass Node {\n    public int val;\n    public List<Node> neighbors;\n    public Node() { val = 0; neighbors = new ArrayList<>(); }\n    public Node(int val) { this.val = val; neighbors = new ArrayList<>(); }\n    public Node(int val, List<Node> neighbors) { this.val = val; this.neighbors = neighbors; }\n}\n*/\n\n`;
    }
    defs += `class Solution {\n    public ${returnType || 'int'} ${functionName}(${javaParams}) {\n        // your code here\n    }\n}`;
    return defs;
  }
  const lang = (language || '').toLowerCase();

  if (lang === 'cpp') {
    const cppReturn = mapType('cpp', returnType) || 'int';
    const cppParams = (parameters || []).map(p => `${mapType('cpp', p.type)} ${p.name}`).join(', ');
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${cppReturn} ${functionName}(${cppParams}) {\n        // your code here\n    }\n};`;
  }

  if (lang === 'csharp') {
    const csReturn = mapType('csharp', returnType) || 'int';
    const csParams = (parameters || []).map(p => `${mapType('csharp', p.type)} ${p.name}`).join(', ');
    return `using System;\nusing System.Collections.Generic;\n\npublic class Solution {\n    public ${csReturn} ${functionName}(${csParams}) {\n        // your code here\n    }\n}`;
  }

  if (lang === 'go') {
    const goReturn = mapType('go', returnType) || '';
    const goParams = (parameters || []).map(p => `${p.name} ${mapType('go', p.type)}`).join(', ');
    return `func ${functionName}(${goParams}) ${goReturn} {\n    // your code here\n}`;
  }

  if (lang === 'c') {
    // C wrapper expects: long <function>(long *args, int argc)
    return `#include <stdint.h>\n\nlong ${functionName}(long *args, int argc) {\n    // your code here\n    return 0;\n}`;
  }

  // Generic fallback: include brief placeholders
  let out = '';
  if (usesList) out += `/* ListNode definition placeholder */\n`;
  if (usesTree) out += `/* TreeNode definition placeholder */\n`;
  if (usesGraph) out += `/* Node (graph) definition placeholder */\n`;
  out += `// ${functionName}(${params})\n// implement here`;
  return out;
}
