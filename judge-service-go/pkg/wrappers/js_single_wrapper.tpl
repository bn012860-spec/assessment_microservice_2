// wrapper injected by judge (single test execution for central comparator mode)
const fs = require("fs");

class TreeNode {
  constructor(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
  }
}

class ListNode {
  constructor(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
  }
}

class Node {
  constructor(val, neighbors) {
    this.val = (val === undefined ? 0 : val);
    this.neighbors = (neighbors === undefined ? [] : neighbors);
  }
}

global.TreeNode = TreeNode;
global.ListNode = ListNode;
global.Node = Node;

function buildTree(data) {
  if (!data || data.length === 0 || data[0] === null) {
    return null;
  }

  const root = new TreeNode(data[0]);
  const queue = [root];
  let i = 1;

  while (queue.length > 0 && i < data.length) {
    const node = queue.shift();

    if (i < data.length) {
      if (data[i] !== null) {
        node.left = new TreeNode(data[i]);
        queue.push(node.left);
      }
      i++;
    }

    if (i < data.length) {
      if (data[i] !== null) {
        node.right = new TreeNode(data[i]);
        queue.push(node.right);
      }
      i++;
    }
  }

  return root;
}

function serializeTree(root) {
  if (!root) {
    return [];
  }

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();

    if (node) {
      result.push(node.val);
      queue.push(node.left);
      queue.push(node.right);
    } else {
      result.push(null);
    }
  }

  // Trim trailing nulls
  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

function buildLinkedList(data) {
  if (!data || data.length === 0) {
    return null;
  }

  const dummy = new ListNode();
  let curr = dummy;
  for (const v of data) {
    curr.next = new ListNode(v);
    curr = curr.next;
  }

  return dummy.next;
}

function serializeLinkedList(head) {
  const result = [];
  let curr = head;
  while (curr) {
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
}

function buildGraph(adj) {
  if (!adj || adj.length === 0) return null;
  const nodes = adj.map((_, i) => new Node(i + 1));
  adj.forEach((neighbors, i) => {
    neighbors.forEach(neighborIdx => {
      nodes[i].neighbors.push(nodes[neighborIdx - 1]);
    });
  });
  return nodes[0];
}

function serializeGraph(node) {
  if (!node) return [];
  const map = new Map();
  const queue = [node];
  map.set(node.val, node);
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of curr.neighbors) {
      if (!map.has(neighbor.val)) {
        map.set(neighbor.val, neighbor);
        queue.push(neighbor);
      }
    }
  }
  const res = [];
  for (let i = 1; i <= map.size; i++) {
    const n = map.get(i);
    res.push(n ? n.neighbors.map(nb => nb.val) : []);
  }
  return res;
}

function convertInput(val, typeStr) {
  if (typeStr && typeStr.startsWith("tree")) {
    return buildTree(val);
  }
  if (typeStr && typeStr.startsWith("linkedlist")) {
    return buildLinkedList(val);
  }
  if (typeStr && typeStr.startsWith("graph")) {
    return buildGraph(val);
  }
  return val;
}

function convertOutput(val, typeStr) {
  if (val instanceof TreeNode || (typeStr && typeStr.startsWith("tree"))) {
    return serializeTree(val);
  }
  if (val instanceof ListNode || (typeStr && typeStr.startsWith("linkedlist"))) {
    return serializeLinkedList(val);
  }
  if (val instanceof Node || (typeStr && typeStr.startsWith("graph"))) {
    return serializeGraph(val);
  }
  return val;
}

// USER_CODE_MARKER

function runOne() {
  try {
    let payload;
    if (process.argv.length >= 3) {
      const decoded = Buffer.from(process.argv[2], "base64").toString("utf8");
      payload = JSON.parse(decoded);
    } else {
      payload = JSON.parse(fs.readFileSync(0, "utf8"));
    }
    
    const params = {{PARAMS_JSON}} || [];
    const returnType = "{{RETURN_TYPE}}";

    const testInput = payload.inputs;
    const rawInputs = Array.isArray(testInput) ? testInput : [testInput];
    const convertedInputs = rawInputs.map((val, j) => {
      const typeStr = params[j] ? params[j].type : "";
      return convertInput(val, typeStr);
    });

    let out = {{FUNCTION_NAME}}(...convertedInputs);
    
    if (out instanceof Promise) {
        out.then(resolvedOut => {
            let convertedOut;
            if (returnType === "void" && convertedInputs.length > 0) {
              convertedOut = convertOutput(convertedInputs[0], params[0] ? params[0].type : "");
            } else {
              convertedOut = convertOutput(resolvedOut, returnType);
            }
            process.stdout.write(JSON.stringify({ output: convertedOut }));
        }).catch(err => {
            emitError(err);
        });
    } else {
        let convertedOut;
        if (returnType === "void" && convertedInputs.length > 0) {
          convertedOut = convertOutput(convertedInputs[0], params[0] ? params[0].type : "");
        } else {
          convertedOut = convertOutput(out, returnType);
        }
        process.stdout.write(JSON.stringify({ output: convertedOut }));
    }
  } catch (err) {
    emitError(err);
  }
}

function emitError(err) {
    process.stdout.write(
      JSON.stringify({
        error: err && err.message ? String(err.message) : String(err),
        traceback: err && err.stack ? String(err.stack) : "",
      }),
    );
}

runOne();
