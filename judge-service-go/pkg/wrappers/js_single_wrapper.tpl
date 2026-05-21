// wrapper injected by judge (single test execution for central comparator mode)
const fs = require("fs");

class TreeNode {
  constructor(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
  }
}

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

function convertInput(val, typeStr) {
  if (typeStr && typeStr.startsWith("tree")) {
    return buildTree(val);
  }
  return val;
}

function convertOutput(val, typeStr) {
  if (val instanceof TreeNode || (typeStr && typeStr.startsWith("tree"))) {
    return serializeTree(val);
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
    
    const params = {{PARAMS_JSON}};
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
            const convertedOut = convertOutput(resolvedOut, returnType);
            process.stdout.write(JSON.stringify({ output: convertedOut }));
        }).catch(err => {
            emitError(err);
        });
    } else {
        const convertedOut = convertOutput(out, returnType);
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
