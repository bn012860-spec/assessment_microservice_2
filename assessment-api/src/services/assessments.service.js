import * as assessmentsRepo from "../repositories/assessments.repo.js";
import * as attemptsRepo from "../repositories/assessmentAttempts.repo.js";
import Submission from "../../models/Submission.mjs";
import { HttpError } from "../utils/httpError.js";

export async function listAssessments(query = {}, user) {
  const filter = {};
  
  // If student, only show Published or Completed assessments
  if (user.role === 'student') {
    filter.status = { $in: ['Published', 'Completed'] };
  } else if (user.role === 'faculty') {
    // Faculty sees their own assessments or all if they are admin
    // For now, let's just show all to faculty/admin for simplicity
  }

  return assessmentsRepo.findAll(filter);
}

export async function getAssessmentById(id, user) {
  const assessment = await assessmentsRepo.findById(id);
  if (!assessment) return null;

  // Student can only see if it's not Draft
  if (user.role === 'student' && assessment.status === 'Draft') {
    return null;
  }

  return assessment;
}

export async function createAssessment(payload, userId) {
  validateAssessmentPayload(payload);
  const data = {
    ...payload,
    createdBy: userId
  };
  return assessmentsRepo.create(data);
}

export async function updateAssessment(id, payload) {
  validateAssessmentPayload(payload);
  return assessmentsRepo.updateById(id, payload);
}

export async function deleteAssessment(id) {
  return assessmentsRepo.deleteById(id);
}

export async function startAssessment(assessmentId, userId) {
  const assessment = await assessmentsRepo.findById(assessmentId);
  if (!assessment) throw new HttpError(404, "Assessment not found");
  if (assessment.status !== 'Published') throw new HttpError(400, "Assessment is not active");

  const now = new Date();
  if (now < assessment.startTime) throw new HttpError(400, "Assessment has not started yet");
  if (now > assessment.endTime) throw new HttpError(400, "Assessment has already ended");

  // Check if already started
  let attempt = await attemptsRepo.findOne({ assessmentId, studentId: userId });
  if (attempt) return attempt;

  attempt = await attemptsRepo.create({
    assessmentId,
    studentId: userId,
    startedAt: now,
    status: 'Active'
  });

  return attempt;
}

export async function getAssessmentAttemptById(attemptId, user) {
  await recalculateAttemptScore(attemptId);
  const attempt = await attemptsRepo.findById(attemptId);
  if (!attempt) return null;

  // Check permission
  const studentId = attempt.studentId._id || attempt.studentId;
  if (user.role === 'student' && String(studentId) !== String(user._id)) {
    throw new HttpError(403, "Forbidden");
  }

  return attempt;
}

export async function recalculateAttemptScore(attemptId) {
  const attempt = await attemptsRepo.findById(attemptId);
  if (!attempt) return;

  const assessment = await assessmentsRepo.findById(attempt.assessmentId);
  if (!assessment) return;

  // Find all successful submissions for this attempt
  const submissions = await Submission.find({
    attemptId: attempt._id,
    status: 'Success'
  });

  // Calculate score: for each problem in assessment, if there is a successful submission, add maxScore
  let totalScore = 0;
  const solvedProblemIds = new Set(submissions.map(s => String(s.problemId)));

  for (const p of assessment.problems) {
    if (solvedProblemIds.has(String(p.problemId._id))) {
      totalScore += p.maxScore;
    }
  }

  if (attempt.score !== totalScore) {
    await attemptsRepo.updateById(attemptId, { score: totalScore });
  }
}

export async function listAssessmentAttempts(assessmentId, user) {
  // Only faculty/admin can list all attempts for an assessment
  if (user.role === 'student') {
    throw new HttpError(403, "Forbidden");
  }
  return attemptsRepo.findAll({ assessmentId });
}

export async function submitAssessment(attemptId, user) {
  const attempt = await attemptsRepo.findById(attemptId);
  if (!attempt) throw new HttpError(404, "Attempt not found");

  // Permission check
  const studentId = attempt.studentId._id || attempt.studentId;
  if (user.role === 'student' && String(studentId) !== String(user._id)) {
    throw new HttpError(403, "Forbidden");
  }

  if (attempt.status !== 'Active') {
    return attempt; // Already submitted
  }

  await recalculateAttemptScore(attemptId);
  
  return attemptsRepo.updateById(attemptId, {
    status: 'Submitted',
    submittedAt: new Date()
  });
}

export async function getAttemptSubmissions(attemptId, user) {
  const attempt = await attemptsRepo.findById(attemptId);
  if (!attempt) throw new HttpError(404, "Attempt not found");

  // Permission check: Faculty/Admin or the Student who owns the attempt
  const studentId = attempt.studentId._id || attempt.studentId;
  if (user.role === 'student' && String(studentId) !== String(user._id)) {
    throw new HttpError(403, "Forbidden");
  }

  return Submission.find({ attemptId }).sort({ createdAt: -1 }).populate('problemId', 'title');
}

function validateAssessmentPayload(payload) {
  const errors = [];
  if (!payload.title) errors.push("Title is required");
  if (!payload.startTime) errors.push("Start time is required");
  if (!payload.endTime) errors.push("End time is required");
  if (!payload.durationMinutes) errors.push("Duration is required");
  if (payload.startTime && payload.endTime && new Date(payload.startTime) >= new Date(payload.endTime)) {
    errors.push("End time must be after start time");
  }
  if (!Array.isArray(payload.problems) || payload.problems.length === 0) {
    errors.push("At least one problem is required");
  }

  if (errors.length > 0) {
    throw new HttpError(400, "Validation failed", { errors });
  }
}
