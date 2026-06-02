package executor

import (
	"errors"
	"fmt"
)

var (
	ErrCompilationFailed   = errors.New("compilation failed")
	ErrTimeLimitExceeded   = errors.New("time limit exceeded")
	ErrMemoryLimitExceeded = errors.New("memory limit exceeded")
	ErrRuntimeError        = errors.New("runtime error")
	ErrContainerUnhealthy  = errors.New("container unhealthy")
)

// ExecutionError wraps an error with additional context like exit code.
type ExecutionError struct {
	Type     error
	Message  string
	ExitCode int
}

func (e *ExecutionError) Error() string {
	if e.Message != "" {
		return fmt.Sprintf("%v: %s", e.Type, e.Message)
	}
	if e.ExitCode != 0 {
		return fmt.Sprintf("%v (exit code %d)", e.Type, e.ExitCode)
	}
	return e.Type.Error()
}

func (e *ExecutionError) Unwrap() error {
	return e.Type
}

func NewExecutionError(errType error, message string, exitCode int) *ExecutionError {
	return &ExecutionError{
		Type:     errType,
		Message:  message,
		ExitCode: exitCode,
	}
}
