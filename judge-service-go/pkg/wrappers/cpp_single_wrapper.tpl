#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <unordered_map>
#include <algorithm>
#include <stdexcept>
#include <sstream>
#include <iomanip>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

// Data structures
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

class Node {
public:
    int val;
    std::vector<Node*> neighbors;
    Node() { val = 0; neighbors = std::vector<Node*>(); }
    Node(int _val) { val = _val; neighbors = std::vector<Node*>(); }
    Node(int _val, std::vector<Node*> _neighbors) { val = _val; neighbors = _neighbors; }
};

// JSON conversions for ListNode
void to_json(json& j, const ListNode* p) {
    if (!p) {
        j = nullptr;
        return;
    }
    std::vector<int> res;
    while (p) {
        res.push_back(p->val);
        p = p->next;
    }
    j = res;
}

ListNode* list_from_json(const json& j) {
    if (j.is_null() || !j.is_array()) return nullptr;
    ListNode dummy;
    ListNode* curr = &dummy;
    for (auto& el : j) {
        curr->next = new ListNode(el.get<int>());
        curr = curr->next;
    }
    return dummy.next;
}

// JSON conversions for TreeNode
void to_json(json& j, const TreeNode* root) {
    if (!root) {
        j = nullptr;
        return;
    }
    std::vector<json> res;
    std::queue<const TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        const TreeNode* node = q.front();
        q.pop();
        if (node) {
            res.push_back(node->val);
            q.push(node->left);
            q.push(node->right);
        } else {
            res.push_back(nullptr);
        }
    }
    while (!res.empty() && res.back().is_null()) res.pop_back();
    j = res;
}

TreeNode* tree_from_json(const json& j) {
    if (j.is_null() || !j.is_array() || j.empty() || j[0].is_null()) return nullptr;
    TreeNode* root = new TreeNode(j[0].get<int>());
    std::queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (!q.empty() && i < j.size()) {
        TreeNode* node = q.front();
        q.pop();
        if (i < j.size() && !j[i].is_null()) {
            node->left = new TreeNode(j[i].get<int>());
            q.push(node->left);
        }
        i++;
        if (i < j.size() && !j[i].is_null()) {
            node->right = new TreeNode(j[i].get<int>());
            q.push(node->right);
        }
        i++;
    }
    return root;
}

// JSON conversions for Node (Graph)
void to_json(json& j, const Node* node) {
    if (!node) {
        j = nullptr;
        return;
    }
    std::unordered_map<int, const Node*> map;
    std::queue<const Node*> q;
    q.push(node);
    map[node->val] = node;
    while (!q.empty()) {
        const Node* curr = q.front();
        q.pop();
        for (const Node* neighbor : curr->neighbors) {
            if (map.find(neighbor->val) == map.end()) {
                map[neighbor->val] = neighbor;
                q.push(neighbor);
            }
        }
    }
    std::vector<std::vector<int>> res;
    for (int i = 1; i <= map.size(); i++) {
        if (map.count(i)) {
            std::vector<int> neighbors;
            for (const Node* nb : map[i]->neighbors) neighbors.push_back(nb->val);
            res.push_back(neighbors);
        } else {
            res.push_back({});
        }
    }
    j = res;
}

Node* graph_from_json(const json& j) {
    if (j.is_null() || !j.is_array() || j.empty()) return nullptr;
    int n = j.size();
    std::vector<Node*> nodes(n);
    for (int i = 0; i < n; i++) nodes[i] = new Node(i + 1);
    for (int i = 0; i < n; i++) {
        for (const auto& neighborIdx : j[i]) {
            nodes[i]->neighbors.push_back(nodes[neighborIdx.get<int>() - 1]);
        }
    }
    return nodes[0];
}

// Simple base64 decoder
static std::string base64_decode(const std::string &in) {
    std::string out;
    std::vector<int> T(256, -1);
    for (int i = 0; i < 64; i++) T["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[i]] = i;

    int val = 0, valb = -8;
    for (unsigned char c : in) {
        if (T[c] == -1) break;
        val = (val << 6) + T[c];
        valb += 6;
        if (valb >= 0) {
            out.push_back(char((val >> valb) & 0xFF));
            valb -= 8;
        }
    }
    return out;
}

// User's solution inclusion
#include "solution.cpp"

int main(int argc, char** argv) {
    if (argc < 2) {
        std::cerr << "Missing input payload" << std::endl;
        return 1;
    }

    try {
        std::string decoded = base64_decode(argv[1]);
        json payload = json::parse(decoded);
        json inputs = payload["inputs"];

        Solution sol;
        json result;

        // GENERATED_CALL_MARKER

    } catch (const std::exception& e) {
        json err;
        err["error"] = "Runtime Error";
        err["message"] = e.what();
        std::cout << err.dump() << std::endl;
    }
    return 0;
}
