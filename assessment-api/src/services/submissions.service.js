import * as submissionsRepo from "../repositories/submissions.repo.js";
import * as problemsRepo from "../repositories/problems.repo.js";
import * as attemptsRepo from "../repositories/assessmentAttempts.repo.js";
import * as assessmentsRepo from "../repositories/assessments.repo.js";
import { publishSubmissionMessage } from "./evaluation.service.js";
import { getCacheJSON, setCacheJSON } from "./cache.service.js";
import { HttpError } from "../utils/httpError.js";

function validateSubmissionMessage(msg) {
  if (!msg || typeof msg !== "object") return false;
  if (!msg.submissionId || !msg.problemId || !msg.language || !msg.code || !msg.functionName) return false;
  if (msg.tests && !Array.isArray(msg.tests)) return false;
  if (Array.isArray(msg.tests)) {
    for (const t of msg.tests) {
      if (typeof t !== "object") return false;
      if (!("inputs" in t) || !("expected" in t)) return false;
    }
  }
  return true;
}

function canAccessSubmission(submission, { userId, role }) {
  if (!submission || !userId) return false;
  if (role === "admin" || role === "faculty" || role === "superadmin") return true;
  return String(submission.userId) === String(userId);
}

function isPrivilegedRole(role) {
  return role === "admin" || role === "faculty" || role === "superadmin";
}

function isSampleTestCase(tc = {}) {
  if (typeof tc.isSample === "boolean") return tc.isSample;
  if (typeof tc.isHidden === "boolean") return !tc.isHidden;
  return true;
}

function getAttemptExpiration(attempt, assessment) {
  const durationExpiry = new Date(attempt.startedAt).getTime() + assessment.durationMinutes * 60 * 1000;
  return new Date(Math.min(durationExpiry, new Date(assessment.endTime).getTime()));
}

async function validateAssessmentSubmission({ problemId, language, userId, assessmentId, attemptId }) {
  if (!assessmentId && !attemptId) return;

  if (!assessmentId || !attemptId) {
    throw new HttpError(400, "Assessment submissions require both assessmentId and attemptId");
  }

  const attempt = await attemptsRepo.findById(attemptId);
  if (!attempt) throw new HttpError(404, "Attempt not found");

  const studentId = attempt.studentId?._id || attempt.studentId;
  if (String(studentId) !== String(userId)) {
    throw new HttpError(403, "Forbidden: You do not own this attempt");
  }

  const attemptAssessmentId = attempt.assessmentId?._id || attempt.assessmentId;
  if (String(attemptAssessmentId) !== String(assessmentId)) {
    throw new HttpError(400, "Attempt does not belong to this assessment");
  }

  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw new HttpError(404, "Assessment not found");

  if (attempt.status !== "Active") {
    throw new HttpError(409, `Attempt is ${attempt.status.toLowerCase()} and no longer accepts submissions`);
  }

  const expiration = getAttemptExpiration(attempt, assessment);
  if (Date.now() >= expiration.getTime()) {
    await attemptsRepo.updateById(attemptId, { status: "TimedOut", submittedAt: expiration });
    throw new HttpError(409, "Attempt has timed out and no longer accepts submissions");
  }

  const includesProblem = assessment.problems.some((entry) => {
    const assessmentProblemId = entry.problemId?._id || entry.problemId;
    return String(assessmentProblemId) === String(problemId);
  });
  if (!includesProblem) {
    throw new HttpError(400, "Problem is not part of this assessment");
  }

  if (assessment.allowedLanguages?.length > 0 && !assessment.allowedLanguages.includes(language)) {
    throw new HttpError(400, "Language is not allowed for this assessment");
  }
}

function parseOutputJSON(output) {
  if (!output || typeof output !== "string") return null;
  try {
    return JSON.parse(output);
  } catch (err) {
    return null;
  }
}

function sanitizeResultDetails(details = [], testCases = []) {
  return details.map((detail, idx) => {
    const testIndexFromPayload = Number.isInteger(detail.test) ? detail.test - 1 : idx;
    const tc = testCases[testIndexFromPayload];
    const hidden = tc ? !isSampleTestCase(tc) : false;

    if (!hidden) {
      return detail;
    }

    return {
      test: detail.test,
      ok: detail.ok,
      isHidden: true,
      stdout: detail.stdout,
      stderr: detail.stderr
    };
  });
}

function sanitizeSubmissionForStudent(submission, problem) {
  if (!submission || !problem || !Array.isArray(problem.testCases)) {
    return submission;
  }

  const normalized = typeof submission.toObject === "function" ? submission.toObject() : { ...submission };
  const parsedOutput = parseOutputJSON(normalized.output);

  if (parsedOutput && Array.isArray(parsedOutput.details)) {
    parsedOutput.details = sanitizeResultDetails(parsedOutput.details, problem.testCases);
    normalized.output = JSON.stringify(parsedOutput);
  }

  if (normalized.testResult && Array.isArray(normalized.testResult.details)) {
    normalized.testResult = {
      ...normalized.testResult,
      details: sanitizeResultDetails(normalized.testResult.details, problem.testCases)
    };
  }

  return normalized;
}

export async function submitSolution({ problemId, code, language, userId, assessmentId = null, attemptId = null, requestId = null }) {
  await validateAssessmentSubmission({ problemId, language, userId, assessmentId, attemptId });

  const problem = await problemsRepo.findById(problemId);
  if (!problem) {
    return { notFound: true };
  }

  const submissionData = {
    problemId,
    code,
    language,
    userId,
    status: "Pending"
  };

  if (assessmentId) submissionData.assessmentId = assessmentId;
  if (attemptId) submissionData.attemptId = attemptId;

  const submission = await submissionsRepo.create(submissionData);

  const tests = problem.testCases.map((tc) => ({
    inputs: tc.inputs,
    expected: tc.expected,
    isHidden: !isSampleTestCase(tc),
    isSample: isSampleTestCase(tc)
  }));

  const functionName = problem.functionName || "solution";

  const messageBody = {
    schemaVersion: "v2",
    submissionId: submission._id.toString(),
    problemId: problem._id.toString(),
    language,
    code,
    tests: tests,
    functionName: functionName,
    compareMode: problem.compareConfig?.mode || "EXACT",
    requestId: requestId
  };

  if (!validateSubmissionMessage(messageBody)) {
    throw new HttpError(500, "Invalid submission message", { msg: "Internal server error: invalid submission message" });
  }

  await publishSubmissionMessage(messageBody);

  return { submission };
}

export async function getSubmissionById(id, auth = {}) {
  const cacheKey = `submission:${id}`;
  const cached = await getCacheJSON(cacheKey);
  if (cached) {
    if (!canAccessSubmission(cached, auth)) {
      return { forbidden: true };
    }
    if (!isPrivilegedRole(auth.role)) {
      const problem = await problemsRepo.findById(cached.problemId);
      return { cached: true, submission: sanitizeSubmissionForStudent(cached, problem) };
    }
    return { cached: true, submission: cached };
  }

  const submission = await submissionsRepo.findById(id);
  if (!submission) {
    return { notFound: true };
  }

  if (!canAccessSubmission(submission, auth)) {
    return { forbidden: true };
  }

  if (submission.status === "Success" || submission.status === "Fail") {
    await setCacheJSON(cacheKey, submission, 3600);
  }

  if (!isPrivilegedRole(auth.role)) {
    const problem = await problemsRepo.findById(submission.problemId);
    return { submission: sanitizeSubmissionForStudent(submission, problem) };
  }

  return { submission };
}

export async function getMySubmissions(userId, query = {}) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));
  const options = {
    skip: (page - 1) * limit,
    limit: limit
  };
  const submissions = await submissionsRepo.findByUserId(userId, options);
  return { submissions };
}

import mongoose from 'mongoose';

export async function getMyAnalytics(userId) {
  const submissions = await submissionsRepo.findByUserId(userId, { limit: 1000 }); // Max 1000 for realistic analytics
  
  let totalAttempted = 0;
  let totalSolved = 0;
  const tagStats = {};
  const problemDifficultyStats = { Easy: 0, Medium: 0, Hard: 0 };
  const solvedProblemIds = new Set();

  for (const sub of submissions) {
    const pId = sub.problemId?._id?.toString() || sub.problemId?.toString();
    if (!pId) continue;

    totalAttempted++;
    const isSuccess = sub.status === "Success";
    
    if (isSuccess) {
      solvedProblemIds.add(pId);
    }

    // Using the populated problemId object if available
    if (sub.problemId && typeof sub.problemId === 'object' && sub.problemId.tags) {
      const difficulty = sub.problemId.difficulty || 'Medium';
      
      // We only count difficulty for solved problems to get "average solved difficulty"
      // But we can also track attempted difficulty. Let's just track solved for simplicity.
      
      const tags = sub.problemId.tags || [];
      tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = { attempted: 0, solved: 0 };
        }
        tagStats[tag].attempted++;
        if (isSuccess) {
          tagStats[tag].solved++;
        }
      });
    } else {
      // If not fully populated, we would need to fetch it, but findByUserId populates 'title'.
      // To get tags and difficulty, we need to modify findByUserId to populate those, or fetch here.
      // Let's fetch the full problem if tags are missing to be safe, but ideally repo is updated.
      const problem = await problemsRepo.findById(pId);
      if (problem) {
        const difficulty = problem.difficulty || 'Medium';
        if (isSuccess) problemDifficultyStats[difficulty]++;
        
        const tags = problem.tags || [];
        tags.forEach(tag => {
          if (!tagStats[tag]) {
            tagStats[tag] = { attempted: 0, solved: 0 };
          }
          tagStats[tag].attempted++;
          if (isSuccess) {
            tagStats[tag].solved++;
          }
        });
      }
    }
  }

  totalSolved = solvedProblemIds.size;

  // Process tag stats into an array
  const tagsArray = Object.keys(tagStats).map(tag => ({
    tag,
    attempted: tagStats[tag].attempted,
    solved: tagStats[tag].solved,
    successRate: Math.round((tagStats[tag].solved / tagStats[tag].attempted) * 100)
  }));

  // Sort by success rate
  tagsArray.sort((a, b) => b.successRate - a.successRate);

  // Strong areas: high success rate, at least 2 attempts
  const strongAreas = tagsArray.filter(t => t.attempted >= 2 && t.successRate >= 70).slice(0, 3);
  
  // Weak areas: low success rate, at least 2 attempts
  const weakAreas = [...tagsArray].reverse().filter(t => t.attempted >= 2 && t.successRate < 50).slice(0, 3);

  // Determine average difficulty
  let avgDiff = "Medium";
  const { Easy, Medium, Hard } = problemDifficultyStats;
  if (Hard > Medium && Hard > Easy) avgDiff = "Hard";
  else if (Easy > Medium && Easy > Hard) avgDiff = "Easy";

  return {
    totalAttempted,
    totalSolved,
    averageDifficulty: avgDiff,
    strongAreas,
    weakAreas,
    tagStats: tagsArray
  };
}
