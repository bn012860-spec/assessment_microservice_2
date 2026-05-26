import * as assessmentsService from "../services/assessments.service.js";

export async function listAssessments(req, res, next) {
  try {
    const assessments = await assessmentsService.listAssessments(req.query, req.user);
    res.json(assessments);
  } catch (err) {
    next(err);
  }
}

export async function getAssessmentById(req, res, next) {
  try {
    const assessment = await assessmentsService.getAssessmentById(req.params._id, req.user);
    if (!assessment) return res.status(404).json({ msg: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function createAssessment(req, res, next) {
  try {
    const assessment = await assessmentsService.createAssessment(req.body, req.user._id);
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function updateAssessment(req, res, next) {
  try {
    const assessment = await assessmentsService.updateAssessment(req.params._id, req.body);
    if (!assessment) return res.status(404).json({ msg: "Assessment not found" });
    res.json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function deleteAssessment(req, res, next) {
  try {
    await assessmentsService.deleteAssessment(req.params._id);
    res.json({ msg: "Assessment deleted" });
  } catch (err) {
    next(err);
  }
}

export async function startAssessment(req, res, next) {
  try {
    const attempt = await assessmentsService.startAssessment(req.params._id, req.user._id);
    res.json(attempt);
  } catch (err) {
    next(err);
  }
}

export async function getAssessmentAttemptById(req, res, next) {
  try {
    const attempt = await assessmentsService.getAssessmentAttemptById(req.params.attemptId, req.user);
    if (!attempt) return res.status(404).json({ msg: "Attempt not found" });
    res.json(attempt);
  } catch (err) {
    next(err);
  }
}

export async function listAssessmentAttempts(req, res, next) {
  try {
    const attempts = await assessmentsService.listAssessmentAttempts(req.params._id, req.user);
    res.json(attempts);
  } catch (err) {
    next(err);
  }
}

export async function getAttemptSubmissions(req, res, next) {
  try {
    const submissions = await assessmentsService.getAttemptSubmissions(req.params.attemptId, req.user);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}
