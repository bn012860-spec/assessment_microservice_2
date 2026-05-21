# wrapper injected by judge (batched execution for central comparator mode)
import base64, json, sys, traceback, collections

# --- Security: Restrict dangerous modules and built-ins ---
for module_name in [
    'os', 'subprocess', 'shutil', 'socket', 'urllib', 'requests',
    'pathlib', 'glob', 'tempfile', 'mmap', 'fcntl', 'resource', 'signal',
    'ctypes', 'gc', 'inspect', 'site', 'distutils', 'setuptools', 'pip'
]:
    if module_name in sys.modules:
        del sys.modules[module_name]
    if module_name in globals():
        del globals()[module_name]

restricted_builtins = ['__import__', 'eval', 'exec', 'compile', 'open', 'file', 'input']
for builtin_name in restricted_builtins:
    if hasattr(__builtins__, builtin_name):
        delattr(__builtins__, builtin_name)

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    
    def __repr__(self):
        return f"TreeNode({self.val})"

def build_tree(data):
    if not data or data[0] is None:
        return None
    root = TreeNode(data[0])
    queue = collections.deque([root])
    i = 1
    while queue and i < len(data):
        node = queue.popleft()
        if i < len(data):
            if data[i] is not None:
                node.left = TreeNode(data[i])
                queue.append(node.left)
            i += 1
        if i < len(data):
            if data[i] is not None:
                node.right = TreeNode(data[i])
                queue.append(node.right)
            i += 1
    return root

def serialize_tree(root):
    if not root:
        return []
    result = []
    queue = collections.deque([root])
    while queue:
        node = queue.popleft()
        if node:
            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)
        else:
            result.append(None)
    while result and result[-1] is None:
        result.pop()
    return result

def convert_input(val, type_str):
    if type_str.startswith("tree"):
        return build_tree(val)
    return val

def convert_output(val, type_str):
    if isinstance(val, TreeNode) or type_str.startswith("tree"):
        return serialize_tree(val)
    return val

# USER_CODE_MARKER

def emit(payload):
    print(json.dumps(payload), flush=True)

def run_all():
    if len(sys.argv) < 2:
        emit({"fatal": "missing tests payload"})
        return 2

    decoded = base64.b64decode(sys.argv[1]).decode("utf-8")
    tests = json.loads(decoded)
    
    params = json.loads('''{{PARAMS_JSON}}''')
    return_type = '''{{RETURN_TYPE}}'''

    for i, test in enumerate(tests):
        try:
            raw_inputs = test.get("inputs", [])
            converted_inputs = []
            for j, val in enumerate(raw_inputs):
                type_str = params[j]["type"] if j < len(params) else ""
                converted_inputs.append(convert_input(val, type_str))
            
            if isinstance(converted_inputs, list):
                out = {{FUNCTION_NAME}}(*converted_inputs)
            else:
                out = {{FUNCTION_NAME}}(converted_inputs)
            
            converted_out = convert_output(out, return_type)
            emit({"test": i + 1, "output": converted_out})
        except Exception as exc:
            emit({
                "test": i + 1,
                "error": str(exc),
                "traceback": traceback.format_exc(),
            })

    return 0

if __name__ == "__main__":
    try:
        sys.exit(run_all())
    except Exception as exc:
        emit({
            "fatal": str(exc),
            "traceback": traceback.format_exc(),
        })
        sys.exit(1)
