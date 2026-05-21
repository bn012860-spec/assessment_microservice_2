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
