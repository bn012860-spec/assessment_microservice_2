// wrapper injected by judge (batched execution for central comparator mode)
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

function emit(payload) {
  process.stdout.write(JSON.stringify(payload) + "\n");
}

async function runAll() {
  try {
    let tests;
    if (process.argv.length >= 3) {
      const decoded = Buffer.from(process.argv[2], "base64").toString("utf8");
      tests = JSON.parse(decoded);
    } else {
      tests = JSON.parse(fs.readFileSync(0, "utf8"));
    }
    
    const params = {{PARAMS_JSON}};
    const returnType = "{{RETURN_TYPE}}";

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      try {
        const testInput = test.inputs;
        const rawInputs = Array.isArray(testInput) ? testInput : [testInput];
        const convertedInputs = rawInputs.map((val, j) => {
          const typeStr = params[j] ? params[j].type : "";
          return convertInput(val, typeStr);
        });

        let out = await {{FUNCTION_NAME}}(...convertedInputs);
        const convertedOut = convertOutput(out, returnType);
        emit({ test: i + 1, output: convertedOut });
      } catch (exc) {
        emit({
          test: i + 1,
          error: String(exc.message || exc),
          traceback: String(exc.stack || ""),
        });
      }
    }
  } catch (fatal) {
    emit({
      fatal: String(fatal.message || fatal),
      traceback: String(fatal.stack || ""),
    });
    process.exit(1);
  }
}

runAll();
