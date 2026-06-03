const TYPE_REGEX = /^([a-z]+)(?:<(.+)>)?$/;

const VALID_KINDS = new Set([
  "number",
  "string",
  "boolean",
  "array",
  "matrix",
  "tree",
  "linkedlist",
  "graph",
  "void"
]);

const GENERIC_KINDS = new Set([
  "array",
  "matrix",
  "tree",
  "linkedlist",
  "graph"
]);

/**
 * Validates a type string against the platform's type grammar.
 * @param {string} typeStr 
 * @returns {boolean}
 */
export function isValidType(typeStr) {
  if (!typeStr || typeof typeStr !== 'string') return false;
  const s = typeStr.trim();
  if (!s) return false;

  const match = s.match(TYPE_REGEX);
  if (!match) return false;

  const kind = match[1];
  const inner = match[2];

  if (!VALID_KINDS.has(kind)) return false;

  if (GENERIC_KINDS.has(kind)) {
    if (!inner) return false;
    return isValidType(inner);
  } else {
    if (inner) return false;
  }

  return true;
}

/**
 * Validates actual data against a type string.
 * @param {any} data 
 * @param {string} typeStr 
 * @returns {{valid: boolean, error?: string}}
 */
export function validateData(data, typeStr) {
  const s = (typeStr || '').trim();
  const match = s.match(TYPE_REGEX);
  if (!match) return { valid: false, error: `Invalid type string: ${typeStr}` };

  const kind = match[1];
  const inner = match[2];

  switch (kind) {
    case "number":
      if (typeof data !== 'number') return { valid: false, error: `Expected number, got ${typeof data}` };
      return { valid: true };
    case "string":
      if (typeof data !== 'string') return { valid: false, error: `Expected string, got ${typeof data}` };
      return { valid: true };
    case "boolean":
      if (typeof data !== 'boolean') return { valid: false, error: `Expected boolean, got ${typeof data}` };
      return { valid: true };
    case "void":
      if (data !== null && data !== undefined && data !== "") return { valid: false, error: `Expected void (null/empty), got ${typeof data}` };
      return { valid: true };
    case "array":
      if (!Array.isArray(data)) return { valid: false, error: `Expected array, got ${typeof data}` };
      for (let i = 0; i < data.length; i++) {
        const res = validateData(data[i], inner);
        if (!res.valid) return { valid: false, error: `Array item at [${i}]: ${res.error}` };
      }
      return { valid: true };
    case "matrix":
      if (!Array.isArray(data)) return { valid: false, error: `Expected matrix (array), got ${typeof data}` };
      for (let i = 0; i < data.length; i++) {
        if (!Array.isArray(data[i])) return { valid: false, error: `Matrix row at [${i}] is not an array` };
        for (let j = 0; j < data[i].length; j++) {
          const res = validateData(data[i][j], inner);
          if (!res.valid) return { valid: false, error: `Matrix item at [${i}][${j}]: ${res.error}` };
        }
      }
      return { valid: true };
    case "tree":
      // Trees are represented as arrays in Level Order (LeetCode style)
      if (!Array.isArray(data)) return { valid: false, error: `Expected tree representation as array, got ${typeof data}` };
      for (let i = 0; i < data.length; i++) {
        if (data[i] === null) continue;
        const res = validateData(data[i], inner);
        if (!res.valid) return { valid: false, error: `Tree node at [${i}]: ${res.error}` };
      }
      return { valid: true };
    case "linkedlist":
      if (!Array.isArray(data)) return { valid: false, error: `Expected linked list representation as array, got ${typeof data}` };
      for (let i = 0; i < data.length; i++) {
        const res = validateData(data[i], inner);
        if (!res.valid) return { valid: false, error: `Linked list node at [${i}]: ${res.error}` };
      }
      return { valid: true };
    case "graph":
      // Graphs are represented as Adjacency Lists: array<array<number>>
      if (!Array.isArray(data)) return { valid: false, error: `Expected graph representation as adjacency list (array), got ${typeof data}` };
      for (let i = 0; i < data.length; i++) {
        if (!Array.isArray(data[i])) return { valid: false, error: `Graph adjacency list at [${i}] is not an array` };
        for (let j = 0; j < data[i].length; j++) {
          const res = validateData(data[i][j], inner);
          if (!res.valid) return { valid: false, error: `Graph neighbor value at [${i}][${j}]: ${res.error}` };
        }
      }
      return { valid: true };
    default:
      return { valid: false, error: `Unsupported validation for kind: ${kind}` };
  }
}
