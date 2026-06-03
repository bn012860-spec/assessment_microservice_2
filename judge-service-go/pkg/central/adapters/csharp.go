package adapters

import (
	"fmt"
	"strings"

	"judge-service-go/pkg/languages"
	"judge-service-go/pkg/models"
	"judge-service-go/pkg/workspace"
	"judge-service-go/pkg/wrapper"
)

type CSharpAdapter struct{}

func (CSharpAdapter) Name() string {
	return "csharp"
}

func (CSharpAdapter) PrepareFiles(workDir string, submissionMsg models.SubmissionMessage, problem models.Problem) ([]string, error) {
	lang := languages.GetLanguage("csharp")
	wrapperCode, err := wrapper.GenerateWrapper(problem, lang, submissionMsg.FunctionName, "csharp_wrapper.tpl")
	if err != nil {
		return nil, err
	}

	// C# wrapper template has {{USER_CODE}} which wrapper.GenerateWrapper should have handled if it follows the pattern.
	// Actually, let's check how GenerateWrapper works.
	
	finalCode := strings.Replace(wrapperCode, "// USER_CODE_MARKER", submissionMsg.Code, 1)
	// If the template uses {{USER_CODE}}, GenerateWrapper might have already replaced it if it's using text/template.
	// But javascript.go does a manual replace of // USER_CODE_MARKER.
	// Let's check wrapper/wrapper.go

	if err := workspace.WriteFile(workDir, "main.cs", []byte(finalCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write main.cs: %w", err)
	}

	return []string{"main.cs"}, nil
}

func (CSharpAdapter) RunCommand(inputB64 string) []string {
	return []string{"mono", "/app/main.exe", inputB64}
}

func (CSharpAdapter) CompileCommand() []string {
	return []string{"mcs", "-out:/app/main.exe", "/app/main.cs", "-r:System.Runtime.Serialization.dll"}
}
