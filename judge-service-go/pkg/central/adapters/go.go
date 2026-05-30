package adapters

import (
	"fmt"
	"strings"

	"judge-service-go/pkg/languages"
	"judge-service-go/pkg/models"
	"judge-service-go/pkg/workspace"
	"judge-service-go/pkg/wrapper"
)

type GoAdapter struct{}

func (GoAdapter) Name() string {
	return "go"
}

func (GoAdapter) PrepareFiles(workDir string, submissionMsg models.SubmissionMessage, problem models.Problem) ([]string, error) {
	lang := languages.GetLanguage("go")
	wrapperCode, err := wrapper.GenerateWrapper(problem, lang, submissionMsg.FunctionName)
	if err != nil {
		return nil, err
	}

	// Go needs the user code and wrapper in the same package (main) to compile together.
	// We'll write them as main.go and solution.go.
	solutionCode := submissionMsg.Code
	if !strings.Contains(solutionCode, "package ") {
		solutionCode = "package main\n\n" + solutionCode
	}

	if err := workspace.WriteFile(workDir, "solution.go", []byte(solutionCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write solution.go: %w", err)
	}
	if err := workspace.WriteFile(workDir, "main.go", []byte(wrapperCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write main.go: %w", err)
	}

	return []string{"solution.go", "main.go"}, nil
}

func (GoAdapter) CompileCommand() []string {
	// Compile all .go files in the directory
	return []string{"go", "build", "-o", "/app/main", "main.go", "solution.go"}
}

func (GoAdapter) RunCommand(inputB64 string) []string {
	return []string{"/app/main", inputB64}
}
