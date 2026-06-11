import * as fs from 'fs';

class TreeNode {
    val: number;
    left: TreeNode | null;
    right: TreeNode | null;
    constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}

class ListNode {
    val: number;
    next: ListNode | null;
    constructor(val?: number, next?: ListNode | null) {
        this.val = (val === undefined ? 0 : val);
        this.next = (next === undefined ? null : next);
    }
}

class Node {
    val: number;
    neighbors: Node[];
    constructor(val?: number, neighbors?: Node[]) {
        this.val = (val === undefined ? 0 : val);
        this.neighbors = (neighbors === undefined ? [] : neighbors);
    }
}

function buildTree(data: (number | null)[]): TreeNode | null {
    if (!data || data.length === 0 || data[0] === null) return null;
    const root = new TreeNode(data[0]!);
    const queue: TreeNode[] = [root];
    let i = 1;
    while (queue.length > 0 && i < data.length) {
        const node = queue.shift()!;
        if (i < data.length) {
            if (data[i] !== null) {
                node.left = new TreeNode(data[i]!);
                queue.push(node.left);
            }
            i++;
        }
        if (i < data.length) {
            if (data[i] !== null) {
                node.right = new TreeNode(data[i]!);
                queue.push(node.right);
            }
            i++;
        }
    }
    return root;
}

function serializeTree(root: TreeNode | null): (number | null)[] {
    if (!root) return [];
    const result: (number | null)[] = [];
    const queue: (TreeNode | null)[] = [root];
    while (queue.length > 0) {
        const node = queue.shift()!;
        if (node) {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            result.push(null);
        }
    }
    while (result.length > 0 && result[result.length - 1] === null) result.pop();
    return result;
}

function buildLinkedList(data: number[]): ListNode | null {
    if (!data || data.length === 0) return null;
    const dummy = new ListNode();
    let curr = dummy;
    for (const v of data) {
        curr.next = new ListNode(v);
        curr = curr.next;
    }
    return dummy.next;
}

function serializeLinkedList(head: ListNode | null): number[] {
    const result: number[] = [];
    let curr = head;
    while (curr) {
        result.push(curr.val);
        curr = curr.next;
    }
    return result;
}

function buildGraph(adj: number[][]): Node | null {
    if (!adj || adj.length === 0) return null;
    const nodes = adj.map((_, i) => new Node(i + 1));
    adj.forEach((neighbors, i) => {
        neighbors.forEach(neighborIdx => {
            nodes[i].neighbors.push(nodes[neighborIdx - 1]);
        });
    });
    return nodes[0];
}

function serializeGraph(node: Node | null): number[][] {
    if (!node) return [];
    const map = new Map<number, Node>();
    const queue: Node[] = [node];
    map.set(node.val, node);
    while (queue.length > 0) {
        const curr = queue.shift()!;
        for (const neighbor of curr.neighbors) {
            if (!map.has(neighbor.val)) {
                map.set(neighbor.val, neighbor);
                queue.push(neighbor);
            }
        }
    }
    const res: number[][] = [];
    for (let i = 1; i <= map.size; i++) {
        const n = map.get(i);
        res.push(n ? n.neighbors.map(nb => nb.val) : []);
    }
    return res;
}

function convertInput(val: any, typeStr: string): any {
    if (typeStr === "tree<number>") return buildTree(val);
    if (typeStr === "linkedlist<number>") return buildLinkedList(val);
    if (typeStr === "graph<number>") return buildGraph(val);
    return val;
}

function convertOutput(val: any, typeStr: string): any {
    if (val instanceof TreeNode || typeStr === "tree<number>") return serializeTree(val);
    if (val instanceof ListNode || typeStr === "linkedlist<number>") return serializeLinkedList(val);
    if (val instanceof Node || typeStr === "graph<number>") return serializeGraph(val);
    return val;
}

// USER_CODE_MARKER

async function runOne() {
    try {
        const args = process.argv.slice(2);
        if (args.length === 0) return;
        
        const payload = JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8'));
        const params = JSON.parse(`{{PARAMS_JSON}}`) || [];
        const returnType = `{{RETURN_TYPE}}` as any;
        const funcName = `{{FUNCTION_NAME}}`;

        const rawInputs = payload.inputs || [];
        const convertedInputs = rawInputs.map((val: any, i: number) => {
            const typeStr = params[i] ? params[i].type : "";
            return convertInput(val, typeStr);
        });

        // @ts-ignore
        const out = await (typeof Solution !== 'undefined' ? new Solution()[funcName](...convertedInputs) : eval(funcName)(...convertedInputs));
        
        let convertedOut;
        if (returnType === "void" && convertedInputs.length > 0) {
            convertedOut = convertOutput(convertedInputs[0], params[0] ? params[0].type : "");
        } else {
            convertedOut = convertOutput(out, returnType);
        }

        process.stderr.write(JSON.stringify({ output: convertedOut }));
    } catch (err: any) {
        process.stderr.write(JSON.stringify({
            error: err.message || String(err),
            traceback: err.stack
        }));
    }
}

runOne();
