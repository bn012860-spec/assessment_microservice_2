const path = require('path');

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

const tests = {{TESTS_JSON}};
const params = {{PARAMS_JSON}};
const returnType = "{{RETURN_TYPE}}";

async function runTests(userFunction) {
  const results = [];

  for (let i = 0; i < tests.length; ++i) {
    const t = tests[i];

    try {
      const rawInputs = Array.isArray(t.inputs) ? t.inputs : [t.inputs];
      const convertedInputs = rawInputs.map((val, j) => {
        const typeStr = params[j] ? params[j].type : "";
        return convertInput(val, typeStr);
      });

      const out = await userFunction(...convertedInputs);
      const convertedOut = convertOutput(out, returnType);

      const ok = JSON.stringify(convertedOut) === JSON.stringify(t.expected);

      results.push({
        test: i + 1,
        ok,
        output: convertedOut
      });
    } catch (err) {
      results.push({
        test: i + 1,
        ok: false,
        error: String(err),
        stack: err && err.stack ? err.stack : undefined
      });
    }
  }

  const summary = {
    status: "finished",
    passed: results.filter(r => r.ok).length,
    total: results.length,
    details: results
  };

  console.log(JSON.stringify(summary));
}

(async () => {
  const submissionPath = path.join(__dirname, 'submission.js');
  const { {{FUNCTION_NAME}} } = require(submissionPath);

  if (typeof {{FUNCTION_NAME}} !== "function") {
    console.log(JSON.stringify({
      status: "error",
      message: "No {{FUNCTION_NAME}} function exported"
    }));
    process.exit(1);
  }

  await runTests({{FUNCTION_NAME}});
})();
