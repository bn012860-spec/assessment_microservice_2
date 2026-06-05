package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/redis/go-redis/v9"

	"judge-service-go/pkg/central/adapters"
	"judge-service-go/pkg/executor"
	"judge-service-go/pkg/languages"
	"judge-service-go/pkg/models"
	"judge-service-go/pkg/pool"
	"judge-service-go/pkg/workspace"
	"judge-service-go/pkg/wrapper"
)

const (
	defaultRabbitMQURL      = "amqp://user:password@rabbitmq:5672"
	defaultSubmissionQueue  = "submission_queue"
	defaultMongoURI         = "mongodb://mongo:27017/assessment_db"
	defaultRedisURI         = "redis://redis:6379"
	defaultSandboxTimeout   = 10 * time.Second
	centralComparePythonEnv = "JUDGE_CENTRAL_COMPARE_PY"
	centralCompareJSEnv     = "JUDGE_CENTRAL_COMPARE_JS"
	centralCompareJavaEnv   = "JUDGE_CENTRAL_COMPARE_JAVA"
	centralCompareCppEnv    = "JUDGE_CENTRAL_COMPARE_CPP"
	maxTestOutputBytes      = 64 * 1024
	maxLogOutputBytes       = 4 * 1024
	maxTestsBytes           = 1 << 20 // 1MB
	defaultPoolSizePerLang  = 2
)

func failOnError(err error, msg string) {
	if err != nil {
		slog.Error(msg, "error", err)
		os.Exit(1)
	}
}

func isTruthyEnv(v string) bool {
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}

type singleTestExecOutput struct {
	Output    interface{} `json:"output"`
	Error     string      `json:"error,omitempty"`
	Traceback string      `json:"traceback,omitempty"`
}

func truncateString(s string, maxBytes int) (string, bool) {
	if maxBytes <= 0 || len(s) <= maxBytes {
		return s, false
	}
	return s[:maxBytes], true
}

func parseSingleTestOutput(rawStdout string) (singleTestExecOutput, error) {
	var out singleTestExecOutput
	trimmed := strings.TrimSpace(rawStdout)
	if trimmed == "" {
		return out, fmt.Errorf("empty wrapper output")
	}
	if err := json.Unmarshal([]byte(trimmed), &out); err == nil {
		return out, nil
	}

	// If user prints extra lines, try parsing the last non-empty line as JSON.
	lines := strings.Split(trimmed, "\n")
	for i := len(lines) - 1; i >= 0; i-- {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}
		if err := json.Unmarshal([]byte(line), &out); err == nil {
			return out, nil
		}
		break
	}
	return out, fmt.Errorf("wrapper output is not valid JSON")
}

func perTestTimeout(problem models.Problem) time.Duration {
	if problem.TimeLimitMs > 0 {
		return time.Duration(problem.TimeLimitMs) * time.Millisecond
	}
	return defaultSandboxTimeout
}

// validateAndDecodeSubmission unmarshals and validates the submission message.
func validateAndDecodeSubmission(d amqp.Delivery) (models.SubmissionMessage, error) {
	var msg models.SubmissionMessage
	if err := json.Unmarshal(d.Body, &msg); err != nil {
		return msg, fmt.Errorf("error unmarshalling submission message: %w", err)
	}

	// Log ASAP, but validation will catch missing ID.
	slog.Info("Received a message", "submissionId", msg.SubmissionID)

	if err := msg.Validate(); err != nil {
		return msg, fmt.Errorf("invalid submission message: %w", err)
	}

	sanitizedName, ok := msg.SanitizeFunctionName()
	if !ok {
		slog.Debug("sanitized function name", "submissionId", msg.SubmissionID, "old", msg.FunctionName, "new", sanitizedName)
		msg.FunctionName = sanitizedName
	}

	return msg, nil
}

// fetchProblemData retrieves the problem details from MongoDB.
func fetchProblemData(ctx context.Context, problemsCollection *mongo.Collection, problemID string) (models.Problem, error) {
	var problem models.Problem
	objID, err := primitive.ObjectIDFromHex(problemID)
	if err != nil {
		return problem, fmt.Errorf("invalid ProblemID: %w", err)
	}

	err = problemsCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&problem)
	if err != nil {
		return problem, fmt.Errorf("error fetching problem %s: %w", problemID, err)
	}
	return problem, nil
}

// prepareSubmissionFiles generates the necessary wrapper and source files for execution.
func prepareSubmissionFiles(submissionMsg models.SubmissionMessage, problem models.Problem, lang *languages.Language, tempDir string) ([]string, []string, []string, error) {
	// The problem's TestCases have been parsed and normalized by ValidateBasic().
	// We re-marshal them here to pass the clean JSON to the wrapper.
	testsJSON, err := json.Marshal(problem.TestCases)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to marshal normalized test cases to JSON: %w", err)
	}
	if len(testsJSON) > maxTestsBytes {
		return nil, nil, nil, fmt.Errorf("tests JSON too large after normalization: %d bytes", len(testsJSON))
	}
	problem.TestsJSON = testsJSON

	// The submission message provides the function name used in the user's code.
	wrapperCode, err := wrapper.GenerateWrapper(problem, lang, submissionMsg.FunctionName, "")
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to generate wrapper: %w", err)
	}

	compareMode := submissionMsg.CompareMode
	if compareMode == "" {
		compareMode = "STRUCTURAL" // Default compare mode
	}
	wrapperCode = strings.ReplaceAll(wrapperCode, "{{COMPARE_MODE}}", compareMode)

	var filesToCopy []string
	compileCmd := lang.CompileCmd
	runCmd := lang.RunCmd

	// This large block can also be refactored further into language-specific file generators
	if lang.ID == "javascript" {
		submissionFileName := "submission.js"
		wrapperFileName := "wrapper.js"
		submissionCode := submissionMsg.Code + "\nmodule.exports = { " + submissionMsg.FunctionName + " };"
		if err := workspace.WriteFile(tempDir, submissionFileName, []byte(submissionCode), 0644); err != nil {
			return nil, nil, nil, fmt.Errorf("failed to write submission file: %w", err)
		}
		if err := workspace.WriteFile(tempDir, wrapperFileName, []byte(wrapperCode), 0644); err != nil {
			return nil, nil, nil, fmt.Errorf("failed to write wrapper file: %w", err)
		}
		filesToCopy = []string{submissionFileName, wrapperFileName}
	} else {
		finalCode := strings.Replace(wrapperCode, "// USER_CODE_MARKER", submissionMsg.Code, 1)
		finalCode = strings.Replace(finalCode, "# USER_CODE_MARKER", submissionMsg.Code, 1)

		switch lang.ID {
		case "java":
			solutionFileName := "Solution.java"
			if err := workspace.WriteFile(tempDir, solutionFileName, []byte(submissionMsg.Code), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write solution file: %w", err)
			}
			submissionFileName := "GeneratedTester.java"
			if err := workspace.WriteFile(tempDir, submissionFileName, []byte(wrapperCode), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write combined submission file: %w", err)
			}
			filesToCopy = []string{solutionFileName, submissionFileName}
		case "python":
			submissionFileName := "wrapper.py"
			solutionFileName := "solution.py"
			if err := workspace.WriteFile(tempDir, solutionFileName, []byte(submissionMsg.Code), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write solution file: %w", err)
			}
			if err := workspace.WriteFile(tempDir, submissionFileName, []byte(finalCode), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write combined submission file: %w", err)
			}
			filesToCopy = []string{submissionFileName, solutionFileName}
		case "go":
			solutionFileName := "solution.go"
			if err := workspace.WriteFile(tempDir, solutionFileName, []byte(submissionMsg.Code), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write solution file: %w", err)
			}
			wrapperFileName := "main.go"
			// Clear USER_CODE_MARKER in the wrapper since the user code is in a separate file
			finalWrapperCode := strings.Replace(wrapperCode, "// USER_CODE_MARKER", "", 1)
			if err := workspace.WriteFile(tempDir, wrapperFileName, []byte(finalWrapperCode), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write wrapper file: %w", err)
			}
			filesToCopy = []string{solutionFileName, wrapperFileName}
		default: // C, CSharp, etc.
			submissionFileName := "main" + lang.FileExt
			if err := workspace.WriteFile(tempDir, submissionFileName, []byte(finalCode), 0644); err != nil {
				return nil, nil, nil, fmt.Errorf("failed to write combined submission file: %w", err)
			}
			filesToCopy = []string{submissionFileName}
		}
	}

	return filesToCopy, compileCmd, runCmd, nil
}

// processAndStoreResults processes the executor output and updates the database and cache.
func fallbackResultForExecutionFailure(executionPath string, execErr error, stdout string) *models.SubmissionResult {
	result := models.NewSubmissionResult()
	result.ExecutionPath = executionPath
	result.Status = models.SubmissionStatusRuntimeError

	if stdout != "" {
		result.InternalError = models.InternalErrorJudge
		return result
	}

	if execErr != nil {
		var execErrObj *executor.ExecutionError
		if errors.As(execErr, &execErrObj) {
			switch execErrObj.Type {
			case executor.ErrCompilationFailed:
				result.Status = models.SubmissionStatusCompilationError
				return result
			case executor.ErrTimeLimitExceeded:
				result.Status = models.SubmissionStatusTimeLimitExceeded
				return result
			case executor.ErrMemoryLimitExceeded:
				result.Status = models.SubmissionStatusMemoryLimitExceeded
				return result
			}
		}
	}

	result.InternalError = models.InternalErrorWrapper
	return result
}

func shouldDiscardContainer(execErr error, result *models.SubmissionResult, cleanupFailed bool) (bool, string) {
	if cleanupFailed {
		return true, "submission workspace cleanup failed"
	}

	if execErr != nil {
		if isPoisonousExecutionError(execErr) {
			return true, execErr.Error()
		}
		return false, ""
	}

	if result == nil {
		return false, ""
	}
	if result.Status == models.SubmissionStatusTimeLimitExceeded || result.Status == models.SubmissionStatusMemoryLimitExceeded {
		return true, result.Status
	}
	if result.InternalError == models.InternalErrorWrapper {
		return true, "wrapper/internal runtime failure"
	}
	if result.Status == models.SubmissionStatusCompilationError && looksLikeContainerFailure(result.Stderr) {
		return true, "compile failed due to container-level failure"
	}

	return false, ""
}

func isPoisonousExecutionError(err error) bool {
	var execErr *executor.ExecutionError
	if errors.As(err, &execErr) {
		switch execErr.Type {
		case executor.ErrTimeLimitExceeded, executor.ErrMemoryLimitExceeded, executor.ErrRuntimeError, executor.ErrContainerUnhealthy:
			return true
		case executor.ErrCompilationFailed:
			return looksLikeContainerFailure(execErr.Message)
		}
	}
	return looksLikeContainerFailure(err.Error())
}

func looksLikeContainerFailure(message string) bool {
	msg := strings.ToLower(message)
	return strings.Contains(msg, "deadline exceeded") ||
		strings.Contains(msg, "timed out") ||
		strings.Contains(msg, "memory limit exceeded") ||
		strings.Contains(msg, "possibly oom") ||
		strings.Contains(msg, "container unhealthy") ||
		strings.Contains(msg, "stopped container") ||
		strings.Contains(msg, "no such container")
}


func finishWithContainer(containerPool *pool.ContainerPool, container *pool.PooledContainer, discard bool, reason string) {
	if discard {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		containerPool.Discard(ctx, container, reason)
		return
	}
	containerPool.Release(container)
}

func processAndStoreResults(ctx context.Context, executionPath string, stdout, stderr string, execErr error, submissionMsg models.SubmissionMessage, submissionsCollection *mongo.Collection, problemsCollection *mongo.Collection, redisClient *redis.Client) {
	var result models.SubmissionResult
	submissionStatus := models.StatusError
	submissionOutput := stderr
	var submissionTestResult *models.SubmissionResult

	if stdout != "" {
		slog.Info("Processing stdout", "submissionId", submissionMsg.SubmissionID, "stdoutLen", len(stdout), "stdoutHead", stdout[:min(len(stdout), 100)])
		if err := json.Unmarshal([]byte(stdout), &result); err == nil {
			submissionTestResult = &result
			submissionTestResult.ExecutionPath = executionPath
			result.NormalizeCounts()
			slog.Info("Parsed submission result", "submissionId", submissionMsg.SubmissionID, "status", result.Status, "passed", result.Passed, "total", result.Total)
			switch result.Status {
			case models.SubmissionStatusAccepted:
				submissionStatus = models.StatusSuccess
			case models.SubmissionStatusWrongAnswer:
				submissionStatus = models.StatusFail
			case models.SubmissionStatusCompilationError, models.SubmissionStatusRuntimeError, models.SubmissionStatusTimeLimitExceeded, models.SubmissionStatusMemoryLimitExceeded:
				submissionStatus = models.StatusError
			default:
				submissionStatus = models.StatusError
			}
			submissionOutput = stdout
		} else {
			slog.Error("Error unmarshalling stdout to result", "submissionId", submissionMsg.SubmissionID, "error", err, "stdout", stdout)
			submissionTestResult = fallbackResultForExecutionFailure(executionPath, execErr, stdout)
			if submissionTestResult.Status == models.SubmissionStatusCompilationError {
				submissionOutput = stderr
			} else {
				submissionOutput = fmt.Sprintf("Invalid judge output: %v\nStdout: %s", err, stdout)
				if execErr != nil {
					submissionOutput += fmt.Sprintf("\nExecution Error: %v\nStderr: %s", execErr, stderr)
				}
			}
		}
	} else if execErr != nil {
		submissionTestResult = fallbackResultForExecutionFailure(executionPath, execErr, stdout)
		if submissionTestResult.Status == models.SubmissionStatusCompilationError {
			submissionOutput = stderr
		} else {
			submissionOutput = fmt.Sprintf("Execution Error: %v\nStderr: %s", execErr, stderr)
		}
	}

	submissionObjID, err := primitive.ObjectIDFromHex(submissionMsg.SubmissionID)
	if err != nil {
		slog.Error("Invalid SubmissionID for result update", "submissionId", submissionMsg.SubmissionID, "error", err)
		return
	}

	update := bson.M{
		"$set": bson.M{
			"status":     submissionStatus,
			"output":     submissionOutput,
			"testResult": submissionTestResult,
			"updatedAt":  time.Now(),
		},
	}
	_, err = submissionsCollection.UpdateByID(ctx, submissionObjID, update)
	if err != nil {
		slog.Error("Error updating submission in MongoDB", "submissionId", submissionMsg.SubmissionID, "error", err)
		// Not returning error, as we will still try to update Redis
	}

	// Update problem analytics
	problemObjID, err := primitive.ObjectIDFromHex(submissionMsg.ProblemID)
	if err == nil {
		inc := bson.M{"submissionCount": 1}
		if submissionStatus == models.StatusSuccess {
			inc["acceptedCount"] = 1
		}
		_, err = problemsCollection.UpdateByID(ctx, problemObjID, bson.M{"$inc": inc})
		if err != nil {
			slog.Error("Error updating problem analytics", "problemId", submissionMsg.ProblemID, "error", err)
		}
	}

	// Fetch full submission to get CreatedAt and UserID for Redis
	var originalSubmission models.Submission
	err = submissionsCollection.FindOne(ctx, bson.M{"_id": submissionObjID}).Decode(&originalSubmission)
	if err != nil {
		slog.Warn("Could not fetch original submission for Redis update", "submissionId", submissionMsg.SubmissionID, "error", err)
		// Continue without full data if necessary
	}

	updatedSubmission := models.Submission{
		ID:         submissionObjID,
		ProblemID:  problemObjID,
		Language:   submissionMsg.Language,
		Code:       submissionMsg.Code,
		Status:     submissionStatus,
		Output:     submissionOutput,
		TestResult: submissionTestResult,
		CreatedAt:  originalSubmission.CreatedAt,
		UserID:     originalSubmission.UserID,
		UpdatedAt:  time.Now(),
	}

	jsonSubmission, err := json.Marshal(updatedSubmission)
	if err == nil {
		err := redisClient.Set(ctx, fmt.Sprintf("submission:%s", submissionMsg.SubmissionID), jsonSubmission, 3600*time.Second).Err()
		if err != nil {
			slog.Error("Error updating submission in Redis", "submissionId", submissionMsg.SubmissionID, "error", err)
		}
	}
}

// processSubmission is the main coordinator for handling a submission message.
func processSubmission(d amqp.Delivery, ch *amqp.Channel, retryQueueName string, problemsCollection *mongo.Collection, submissionsCollection *mongo.Collection, redisClient *redis.Client, executor *executor.Executor, containerPool *pool.ContainerPool) {
	ctx := context.Background()

	submissionMsg, err := validateAndDecodeSubmission(d)
	if err != nil {
		slog.Error("Validation failed", "error", err)
		d.Nack(false, false) // Permanent failure
		return
	}

	problem, err := fetchProblemData(ctx, problemsCollection, submissionMsg.ProblemID)
	if err != nil {
		slog.Error("Failed to fetch problem data", "submissionId", submissionMsg.SubmissionID, "error", err)
		d.Nack(false, true) // Transient failure (DB might be down)
		return
	}

	// Validate the problem data and parse/normalize test cases from the problem doc.
	if err := problem.ValidateBasic(); err != nil {
		slog.Error("Invalid problem data", "submissionId", submissionMsg.SubmissionID, "error", err)
		d.Nack(false, false) // Permanent failure, bad data
		return
	}

	lang := languages.GetLanguage(submissionMsg.Language)
	if lang == nil {
		slog.Error("Unsupported language", "submissionId", submissionMsg.SubmissionID, "language", submissionMsg.Language)
		d.Nack(false, false)
		return
	}

	// Acquire a container from the pool with a timeout
	acquireCtx, acquireCancel := context.WithTimeout(ctx, 30*time.Second)
	defer acquireCancel()

	pooledContainer := containerPool.Acquire(acquireCtx, lang.ID)
	if pooledContainer == nil {
		slog.Warn("No available containers for language, routing to retry queue", "submissionId", submissionMsg.SubmissionID, "language", lang.ID)
		
		// To avoid hot-requeue loop, we publish to a retry queue with TTL
		err := ch.PublishWithContext(ctx, "", retryQueueName, false, false, amqp.Publishing{
			ContentType:  d.ContentType,
			Body:         d.Body,
			DeliveryMode: amqp.Persistent,
		})
		if err != nil {
			slog.Error("Failed to publish to retry queue", "submissionId", submissionMsg.SubmissionID, "error", err)
			d.Nack(false, true) // Fallback to basic requeue
			return
		}
		
		d.Ack(false)
		return
	}
	discardContainer := false
	discardReason := ""
	defer func() {
		finishWithContainer(containerPool, pooledContainer, discardContainer, discardReason)
	}()

	if adapter, ok := adapters.GetAdapter(lang.ID); ok && isCentralCompareEnabled(lang.ID) {
		execCtx, cancel := context.WithTimeout(ctx, 120*time.Second)
		defer cancel()

		result, cleanupFailed, err := runSubmissionCentralDetailed(execCtx, executor, pooledContainer, submissionMsg, problem, adapter)
		if err != nil {
			slog.Error("Central execution setup failed", "submissionId", submissionMsg.SubmissionID, "adapter", adapter.Name(), "error", err)
			if discard, reason := shouldDiscardContainer(err, result, cleanupFailed); discard {
				discardContainer = true
				discardReason = reason
			}
			d.Nack(false, false)
			return
		}
		if discard, reason := shouldDiscardContainer(nil, result, cleanupFailed); discard {
			discardContainer = true
			discardReason = reason
		}

		resultBytes, err := result.ToJSON()
		if err != nil {
			slog.Error("Failed to marshal central result", "submissionId", submissionMsg.SubmissionID, "error", err)
			d.Nack(false, false)
			return
		}
		processAndStoreResults(ctx, models.ExecutionPathCentral, string(resultBytes), "", nil, submissionMsg, submissionsCollection, problemsCollection, redisClient)

		d.Ack(false)
		return
	}

	submissionWorkspace, err := workspace.NewSubmissionWorkspace(pooledContainer.WorkDir, submissionMsg.SubmissionID)
	if err != nil {
		slog.Error("Failed to create submission workspace", "submissionId", submissionMsg.SubmissionID, "error", err)
		d.Nack(false, true)
		return
	}
	defer func() {
		if cleanupErr := workspace.CleanupSubmissionWorkspace(submissionWorkspace.HostPath); cleanupErr != nil {
			discardContainer = true
			discardReason = "submission workspace cleanup failed"
			slog.Error("Failed to cleanup submission workspace", "submissionId", submissionMsg.SubmissionID, "path", submissionWorkspace.HostPath, "error", cleanupErr)
		}
	}()

	filesToCopy, compileCmd, runCmd, err := prepareSubmissionFiles(submissionMsg, problem, lang, submissionWorkspace.HostPath)
	if err != nil {
		slog.Error("Failed to prepare submission files", "submissionId", submissionMsg.SubmissionID, "error", err)
		d.Nack(false, false)
		return
	}

	execCtx, cancel := context.WithTimeout(ctx, 2*defaultSandboxTimeout)
	defer cancel()

	// RunSubmission needs to be refactored to use the pooled container
	stdout, stderr, execErr := executor.RunInContainer(
		execCtx,
		pooledContainer.ID,
		filesToCopy,
		submissionWorkspace.HostPath,
		submissionWorkspace.ContainerPath,
		compileCmd,
		runCmd,
		defaultSandboxTimeout,
		problem.MemoryLimitMb,
	)
	slog.Info("Execution finished", "submissionId", submissionMsg.SubmissionID, "error", execErr)
	if discard, reason := shouldDiscardContainer(execErr, nil, false); discard {
		discardContainer = true
		discardReason = reason
	}

	processAndStoreResults(ctx, models.ExecutionPathLegacy, stdout, stderr, execErr, submissionMsg, submissionsCollection, problemsCollection, redisClient)

	d.Ack(false)
}

func isCentralCompareEnabled(language string) bool {
	switch language {
	case "python":
		if raw, ok := os.LookupEnv(centralComparePythonEnv); ok {
			return isTruthyEnv(raw)
		}
		return true
	case "javascript":
		if raw, ok := os.LookupEnv(centralCompareJSEnv); ok {
			return isTruthyEnv(raw)
		}
		return true
	case "java":
		if raw, ok := os.LookupEnv(centralCompareJavaEnv); ok {
			return isTruthyEnv(raw)
		}
		return true
	case "cpp":
		if raw, ok := os.LookupEnv(centralCompareCppEnv); ok {
			return isTruthyEnv(raw)
		}
		return true
	case "go", "csharp", "typescript":
		return true
	default:
		return false
	}
}

func startHealthServer(ctx context.Context, containerPool *pool.ContainerPool, port string, problemsCollection *mongo.Collection, executor *executor.Executor) {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
	})

	mux.HandleFunc("/stats", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(containerPool.GetStats())
	})

	mux.HandleFunc("/run", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var msg models.SubmissionMessage
		if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := msg.Validate(); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		problem, err := fetchProblemData(r.Context(), problemsCollection, msg.ProblemID)
		if err != nil {
			http.Error(w, "Problem not found", http.StatusNotFound)
			return
		}

		// If the message contains custom tests, override the problem's tests
		if len(msg.Tests) > 0 {
			problem.TestCases = msg.Tests
		} else {
			// For "Run", usually we only run sample test cases
			var samples []models.TestCase
			for _, tc := range problem.TestCases {
				if tc.IsSample {
					samples = append(samples, tc)
				}
			}
			if len(samples) > 0 {
				problem.TestCases = samples
			}
		}

		if err := problem.ValidateBasic(); err != nil {
			http.Error(w, "Invalid problem data: "+err.Error(), http.StatusBadRequest)
			return
		}

		if len(problem.TestCases) == 0 {
			http.Error(w, "No test cases to run", http.StatusBadRequest)
			return
		}

		lang := languages.GetLanguage(msg.Language)
		if lang == nil {
			http.Error(w, "Unsupported language", http.StatusBadRequest)
			return
		}

		acquireCtx, acquireCancel := context.WithTimeout(r.Context(), 30*time.Second)
		defer acquireCancel()

		pooledContainer := containerPool.Acquire(acquireCtx, lang.ID)
		if pooledContainer == nil {
			http.Error(w, "No available containers (request timed out waiting for resource)", http.StatusServiceUnavailable)
			return
		}
		discardContainer := false
		discardReason := ""
		defer func() {
			finishWithContainer(containerPool, pooledContainer, discardContainer, discardReason)
		}()

		var result *models.SubmissionResult
		var runErr error

		if adapter, ok := adapters.GetAdapter(lang.ID); ok && isCentralCompareEnabled(lang.ID) {
			execCtx, cancel := context.WithTimeout(ctx, 120*time.Second)
			defer cancel()
			var cleanupFailed bool
			result, cleanupFailed, runErr = runSubmissionCentralDetailed(execCtx, executor, pooledContainer, msg, problem, adapter)
			if discard, reason := shouldDiscardContainer(runErr, result, cleanupFailed); discard {
				discardContainer = true
				discardReason = reason
			}
		} else {
			// Legacy execution path not fully supported for synchronous /run yet, but we can try
			// For now, let's assume central compare is the way forward
			http.Error(w, "Synchronous run only supported for languages with central compare", http.StatusBadRequest)
			return
		}

		if runErr != nil {
			http.Error(w, "Execution failed: "+runErr.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	})

	server := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	go func() {
		slog.Info("Health/Stats/Run server starting", "port", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Health server failed", "error", err)
		}
	}()

	go func() {
		<-ctx.Done()
		slog.Info("Shutting down health server...")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		server.Shutdown(shutdownCtx)
	}()
}

func main() {
	// Initialize Structured Logging
	logLevel := slog.LevelInfo
	if envLevel := os.Getenv("LOG_LEVEL"); envLevel != "" {
		switch strings.ToLower(envLevel) {
		case "debug":
			logLevel = slog.LevelDebug
		case "info":
			logLevel = slog.LevelInfo
		case "warn":
			logLevel = slog.LevelWarn
		case "error":
			logLevel = slog.LevelError
		}
	}
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: logLevel}))
	slog.SetDefault(logger)

	slog.Info("Go Judge Service starting...")

	// Load environment variables or use defaults
	rabbitmqURL := os.Getenv("RABBITMQ_URL")
	if rabbitmqURL == "" {
		rabbitmqURL = defaultRabbitMQURL
	}
	submissionQueueName := os.Getenv("SUBMISSION_QUEUE")
	if submissionQueueName == "" {
		submissionQueueName = defaultSubmissionQueue
	}
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = defaultMongoURI
	}
	redisURI := os.Getenv("REDIS_URI")
	if redisURI == "" {
		redisURI = defaultRedisURI
	}

	poolSize := defaultPoolSizePerLang
	if val := os.Getenv("DEFAULT_POOL_SIZE"); val != "" {
		if i, err := fmt.Sscanf(val, "%d", &poolSize); err == nil && i > 0 {
			slog.Info("Using configured pool size", "size", poolSize)
		}
	}

	// Initialize Docker Executor
	executor, err := executor.NewExecutor()
	failOnError(err, "Failed to create Docker executor")

	// Initialize Container Pool
	containerPool := pool.NewPool(executor.Client(), poolSize)
	slog.Info("Warming up container pool...")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	workspace.StartSweeper(
		ctx,
		workspace.RootDir,
		5*time.Minute,
		time.Hour,
	)

	var wg sync.WaitGroup
	for _, lang := range languages.GetSupportedLanguages() {
		wg.Add(1)
		go func(l *languages.Language) {
			defer wg.Done()
			slog.Info("Warming up pool", "language", l.ID)
			err := containerPool.WarmUp(ctx, l.ID, l.Image, poolSize)
			if err != nil {
				slog.Error("Failed to warm up pool", "language", l.ID, "error", err)
			}
		}(lang)
	}
	wg.Wait()
	slog.Info("Container pool warmed up.")

	containerPool.StartMonitor(ctx, time.Minute)

	// Connect to MongoDB
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	failOnError(err, "Failed to connect to MongoDB")
	defer func() {
		if err = mongoClient.Disconnect(context.Background()); err != nil {
			slog.Error("Error disconnecting from MongoDB", "error", err)
		}
	}()

	problemsCollection := mongoClient.Database("assessment_db").Collection("problems")
	submissionsCollection := mongoClient.Database("assessment_db").Collection("submissions")

	// Start Health/Stats/Run Server
	healthPort := os.Getenv("HEALTH_PORT")
	if healthPort == "" {
		healthPort = "8081"
	}
	startHealthServer(ctx, containerPool, healthPort, problemsCollection, executor)

	// Normalize Redis address
	redisAddr := redisURI
	if strings.HasPrefix(redisURI, "redis://") {
		if u, err := url.Parse(redisURI); err == nil {
			redisAddr = u.Host
		} else {
			redisAddr = strings.TrimPrefix(redisURI, "redis://")
		}
	}

	// Initialize Redis Client
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisAddr,
		DB:   0, // use default DB
	})
	_, err = redisClient.Ping(ctx).Result()
	failOnError(err, "Failed to connect to Redis")

	// Connect to RabbitMQ
	conn, err := amqp.Dial(rabbitmqURL)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	err = ch.Qos(runtime.NumCPU(), 0, false)
	failOnError(err, "Failed to set QoS")

	_, err = ch.QueueDeclare(
		submissionQueueName, // name
		true,                // durable
		false,               // delete when unused
		false,               // exclusive
		false,               // no-wait
		nil,                 // arguments
	)
	failOnError(err, "Failed to declare submission queue")

	// Declare a retry queue with TTL and DLX
	retryQueueName := submissionQueueName + "_retry"
	_, err = ch.QueueDeclare(
		retryQueueName,
		true,
		false,
		false,
		false,
		amqp.Table{
			"x-dead-letter-exchange":    "",
			"x-dead-letter-routing-key": submissionQueueName,
			"x-message-ttl":             5000, // 5 seconds wait before retry
		},
	)
	failOnError(err, "Failed to declare retry queue")

	msgs, err := ch.Consume(
		submissionQueueName, // queue
		"",                  // consumer
		false,               // auto-ack
		false,               // exclusive
		false,               // no-local
		false,               // no-wait
		nil,                 // args
	)
	failOnError(err, "Failed to register a consumer")

	slog.Info("Waiting for messages", "queue", submissionQueueName)

	// Graceful Shutdown implementation
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	workerWg := sync.WaitGroup{}
	numWorkers := runtime.NumCPU()

	for i := 0; i < numWorkers; i++ {
		workerWg.Add(1)
		go func(workerID int) {
			defer workerWg.Done()
			slog.Debug("Worker started", "workerId", workerID)
			for d := range msgs {
				processSubmission(d, ch, retryQueueName, problemsCollection, submissionsCollection, redisClient, executor, containerPool)
			}
			slog.Debug("Worker stopped", "workerId", workerID)
		}(i)
	}

	sig := <-sigChan
	slog.Info("Received signal, shutting down...", "signal", sig.String())

	// 1. Stop consuming (closing the channel or cancelling the consumer)
	err = ch.Cancel("", false)
	if err != nil {
		slog.Error("Error cancelling consumer", "error", err)
	}

	// 2. Wait for active workers to finish
	slog.Info("Waiting for active workers to finish...")
	workerWg.Wait()

	// 3. Cleanup pool
	slog.Info("Cleaning up container pool...")
	containerPool.Shutdown(context.Background())

	slog.Info("Shutdown complete.")
}
