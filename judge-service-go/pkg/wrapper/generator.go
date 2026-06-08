package wrapper

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"text/template"

	"judge-service-go/pkg/languages"
	"judge-service-go/pkg/models"
)

// safe identifier regexp
var validIdent = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]{0,127}$`)

func escapeForJavaString(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\\\`)
	s = strings.ReplaceAll(s, `"`, `\"`)
	s = strings.ReplaceAll(s, `
`, `\n`)
	s = strings.ReplaceAll(s, `
`, `\r`)
	s = strings.ReplaceAll(s, `	`, `\t`)
	return s
}

// GenerateWrapper generates the wrapper source for a problem + language.
func GenerateWrapper(p models.Problem, lang *languages.Language, submissionFuncName string, templateName string) (string, error) {
	if len(p.TestCases) == 0 && len(p.TestsJSON) > 0 {
		if err := p.ParseTestsJSON(); err != nil {
			return "", fmt.Errorf("failed to parse TestsJSON: %w", err)
		}
	}

	if templateName == "" {
		templateName = lang.WrapperTemplate
	}

	tplPath := filepath.Join("pkg", "wrappers", templateName)
	b, err := os.ReadFile(tplPath)
	if err != nil {
		return "", fmt.Errorf("failed to read template %s: %w", tplPath, err)
	}
	tpl := string(b)

	sanitizedFuncName, _ := sanitizeIdentifier(submissionFuncName)

	// For Java, continue using the template engine because it has complex logic.
	if lang.ID == "java" {
		ctx := map[string]interface{}{
			"FUNCTION_NAME":        sanitizedFuncName,
			"EXPECTED_OUTPUT_TYPE": p.ReturnType,
			"TestCases":            p.TestCases,
			"CLASS_NAME":           "GeneratedTester",
		}

		javaTests, javaExpected, err := buildJavaTestLiterals(p)
		if err != nil {
			return "", fmt.Errorf("failed to build Java test literals: %w", err)
		}
		ctx["TESTS_LITERAL"] = javaTests
		ctx["EXPECTED_LITERAL"] = javaExpected

		testsJSONBytes, err := json.Marshal(p.TestCases)
		if err != nil {
			return "", fmt.Errorf("failed to marshal TestCases to JSON: %w", err)
		}
		ctx["TESTS_JSON_STRING"] = string(testsJSONBytes)

		t, err := template.New("wrapper").Option("missingkey=error").Parse(string(b))
		if err != nil {
			return "", fmt.Errorf("failed to parse template %s: %w", tplPath, err)
		}
		var out bytes.Buffer
		if err := t.Execute(&out, ctx); err != nil {
			return "", fmt.Errorf("failed to execute template %s: %w", tplPath, err)
		}

		result := out.String()
		result = strings.ReplaceAll(result, "{{COMPARE_MODE}}", "") // Assuming empty for now
		return result, nil
	}

	if lang.ID == "cpp" {
		tpl = strings.ReplaceAll(tpl, "{{FUNCTION_NAME}}", sanitizedFuncName)
		cppCall := buildCppCall(p, sanitizedFuncName)
		tpl = strings.ReplaceAll(tpl, "// GENERATED_CALL_MARKER", cppCall)
		return tpl, nil
	}

	if lang.ID == "go" {
		tpl = strings.ReplaceAll(tpl, "{{FUNCTION_NAME}}", sanitizedFuncName)
		goCall := buildGoCall(p, sanitizedFuncName)
		tpl = strings.ReplaceAll(tpl, "// GENERATED_CALL_MARKER", goCall)
		return tpl, nil
	}

	// For other languages (JS, Python, etc.), use simple string replacement.
	tpl = strings.ReplaceAll(tpl, "{{FUNCTION_NAME}}", sanitizedFuncName)

	// Always marshal p.TestCases to ensure valid JSON is injected.
	testsJSONBytes, err := json.Marshal(p.TestCases)
	if err != nil {
		return "", fmt.Errorf("failed to marshal TestCases to JSON: %w", err)
	}
	tpl = strings.ReplaceAll(tpl, "{{TESTS_JSON}}", string(testsJSONBytes))

	paramsJSONBytes, err := json.Marshal(p.Parameters)
	if err != nil {
		return "", fmt.Errorf("failed to marshal Parameters to JSON: %w", err)
	}
	paramsJSON := string(paramsJSONBytes)
	if lang.ID == "csharp" {
		paramsJSON = strings.ReplaceAll(paramsJSON, "\"", "\"\"")
	}
	tpl = strings.ReplaceAll(tpl, "{{PARAMS_JSON}}", paramsJSON)
	tpl = strings.ReplaceAll(tpl, "{{RETURN_TYPE}}", p.ReturnType)

	tpl = strings.ReplaceAll(tpl, "{{EXPECTED_OUTPUT_TYPE}}", p.ReturnType)
	// Inject compare mode and deep-copy flag
	replCompare := ""
	if p.CompareConfig.Mode != "" {
		replCompare = p.CompareConfig.Mode
	}
	tpl = strings.ReplaceAll(tpl, "{{COMPARE_MODE}}", replCompare)
	tpl = strings.ReplaceAll(tpl, "{{REQUIRE_DEEP_COPY}}", fmt.Sprintf("%t", p.CompareConfig.RequireDeepCopy))

	return tpl, nil
}

func sanitizeIdentifier(name string) (string, bool) {
	if validIdent.MatchString(name) {
		return name, true
	}
	re := regexp.MustCompile(`[^A-Za-z0-9_]`)
	s := re.ReplaceAllString(name, "_")
	if !regexp.MustCompile(`^[A-Za-z_]`).MatchString(s) {
		s = "f_" + s
	}
	if len(s) > 127 {
		s = s[:127]
	}
	return s, false
}

func buildJavaTestLiterals(p models.Problem) (string, string, error) {
	var testsBuf strings.Builder
	var expectedBuf strings.Builder

	allIntInputs := true
	for _, tc := range p.TestCases {
		for _, in := range tc.Input {
			switch v := in.(type) {
			case []interface{}:
				for _, e := range v {
					_, okFloat := e.(float64)
					_, okInt64 := e.(int64)
					_, okInt := e.(int)
					if !(okFloat || okInt64 || okInt) {
						allIntInputs = false
					}
				}
			default:
				_, okFloat := in.(float64)
				_, okInt64 := in.(int64)
				_, okInt := in.(int)
				if !(okFloat || okInt64 || okInt) {
					allIntInputs = false
				}
			}
		}
	}

	if allIntInputs {
		testsBuf.WriteString("Object[][] tests = new Object[][]{\n")
		expectedBuf.WriteString("Object[] expected = new Object[]{\n")

		for _, tc := range p.TestCases {
			testsBuf.WriteString("    new Object[]{")
			for i, in := range tc.Input {
				if arr, ok := in.([]interface{}); ok {
					testsBuf.WriteString("new int[]{")
					for j, vv := range arr {
						num := numericToInt(vv)
						if j > 0 {
							testsBuf.WriteString(",")
						}
						testsBuf.WriteString(fmt.Sprintf("%d", num))
					}
					testsBuf.WriteString("}")
				} else {
					num := numericToInt(in)
					testsBuf.WriteString(fmt.Sprintf("%d", num))
				}
				if i < len(tc.Input)-1 {
					testsBuf.WriteString(", ")
				}
			}
			testsBuf.WriteString("},\n")

			switch exp := tc.Expected.(type) {
			case float64:
				expectedBuf.WriteString(fmt.Sprintf("    %d,\n", int64(exp)))
			case int64:
				expectedBuf.WriteString(fmt.Sprintf("    %d,\n", exp))
			case int:
				expectedBuf.WriteString(fmt.Sprintf("    %d,\n", exp))
			case []interface{}:
				expectedBuf.WriteString("    new int[]{")
				for j, vv := range exp {
					num := numericToInt(vv)
					if j > 0 {
						expectedBuf.WriteString(",")
					}
					expectedBuf.WriteString(fmt.Sprintf("%d", num))
				}
				expectedBuf.WriteString("},\n")
			default:
				jb, _ := json.Marshal(exp)
				expectedBuf.WriteString(fmt.Sprintf("    %s,\n", string(jb)))
			}
		}

		testsBuf.WriteString("};")
		expectedBuf.WriteString("};")
		return testsBuf.String(), expectedBuf.String(), nil
	}

	jb, err := json.Marshal(p.TestCases)
	if err != nil {
		return "", "", fmt.Errorf("failed to marshal tests to json: %w", err)
	}
	escaped := escapeForJavaString(string(jb))
	testsLiteral := fmt.Sprintf("String testsJson = \"%s\";", escaped)
	return testsLiteral, "", nil
}

func numericToInt(v interface{}) int64 {
	switch n := v.(type) {
	case float64:
		return int64(n)
	case int64:
		return n
	case int:
		return int64(n)
	default:
		return 0
	}
}

func cppType(t string) string {
	switch t {
	case "number":
		return "int"
	case "string":
		return "std::string"
	case "boolean":
		return "bool"
	case "void":
		return "void"
	case "array<number>":
		return "std::vector<int>"
	case "matrix<number>", "array<array<number>>":
		return "std::vector<std::vector<int>>"
	case "linkedlist<number>":
		return "ListNode*"
	case "tree<number>":
		return "TreeNode*"
	case "graph<number>":
		return "Node*"
	default:
		return "auto"
	}
}

func buildCppCall(p models.Problem, funcName string) string {
	var sb strings.Builder
	for i, param := range p.Parameters {
		sb.WriteString(fmt.Sprintf("        %s arg%d = ", cppType(param.Type), i))
		switch param.Type {
		case "linkedlist<number>":
			sb.WriteString(fmt.Sprintf("list_from_json(inputs[%d]);\n", i))
		case "tree<number>":
			sb.WriteString(fmt.Sprintf("tree_from_json(inputs[%d]);\n", i))
		case "graph<number>":
			sb.WriteString(fmt.Sprintf("graph_from_json(inputs[%d]);\n", i))
		default:
			sb.WriteString(fmt.Sprintf("inputs[%d].get<%s>();\n", i, cppType(param.Type)))
		}
	}

	if p.ReturnType == "void" {
		sb.WriteString(fmt.Sprintf("        sol.%s(", funcName))
		for i := range p.Parameters {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(fmt.Sprintf("arg%d", i))
		}
		sb.WriteString(");\n")

		if len(p.Parameters) > 0 {
			sb.WriteString("        result[\"output\"] = arg0;\n")
		} else {
			sb.WriteString("        result[\"output\"] = nullptr;\n")
		}
	} else {
		sb.WriteString(fmt.Sprintf("        %s output = sol.%s(", cppType(p.ReturnType), funcName))
		for i := range p.Parameters {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(fmt.Sprintf("arg%d", i))
		}
		sb.WriteString(");\n")
		sb.WriteString("        result[\"output\"] = output;\n")
	}
	sb.WriteString("        std::cout << result.dump() << std::endl;")
	return sb.String()
}

func goType(t string) string {
	switch t {
	case "number":
		return "int"
	case "string":
		return "string"
	case "boolean":
		return "bool"
	case "void":
		return ""
	case "array<number>":
		return "[]int"
	case "matrix<number>", "array<array<number>>":
		return "[][]int"
	case "linkedlist<number>":
		return "*ListNode"
	case "tree<number>":
		return "*TreeNode"
	case "graph<number>":
		return "*Node"
	default:
		return "interface{}"
	}
}

func buildGoCall(p models.Problem, funcName string) string {
	var sb strings.Builder
	for i, param := range p.Parameters {
		t := goType(param.Type)
		sb.WriteString(fmt.Sprintf("\tvar arg%d %s\n", i, t))
		switch param.Type {
		case "linkedlist<number>":
			sb.WriteString(fmt.Sprintf("\targ%d = listFromJSON(payload.Inputs[%d])\n", i, i))
		case "tree<number>":
			sb.WriteString(fmt.Sprintf("\targ%d = treeFromJSON(payload.Inputs[%d])\n", i, i))
		case "graph<number>":
			sb.WriteString(fmt.Sprintf("\targ%d = graphFromJSON(payload.Inputs[%d])\n", i, i))
		default:
			sb.WriteString(fmt.Sprintf("\tif err := json.Unmarshal(payload.Inputs[%d], &arg%d); err != nil {\n", i, i))
			sb.WriteString("\t\tresult.Error = \"Runtime Error\"\n")
			sb.WriteString(fmt.Sprintf("\t\tfmt.Printf(\"{\\\"error\\\": \\\"Runtime Error\\\", \\\"message\\\": \\\"failed to unmarshal arg%d: %%v\\\"}\\n\", err)\n", i))
			sb.WriteString("\t\treturn\n")
			sb.WriteString("\t}\n")
		}
	}

	if p.ReturnType == "void" {
		sb.WriteString(fmt.Sprintf("\t%s(", funcName))
		for i := range p.Parameters {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(fmt.Sprintf("arg%d", i))
		}
		sb.WriteString(")\n")
		if len(p.Parameters) > 0 {
			sb.WriteString("\tresult.Output = arg0\n")
		} else {
			sb.WriteString("\tresult.Output = nil\n")
		}
	} else {
		sb.WriteString(fmt.Sprintf("\toutput := %s(", funcName))
		for i := range p.Parameters {
			if i > 0 {
				sb.WriteString(", ")
			}
			sb.WriteString(fmt.Sprintf("arg%d", i))
		}
		sb.WriteString(")\n")
		sb.WriteString("\tresult.Output = output\n")
	}

	sb.WriteString("\tjsonRes, _ := json.Marshal(result)\n")
	sb.WriteString("\tfmt.Println(string(jsonRes))\n")
	return sb.String()
}
