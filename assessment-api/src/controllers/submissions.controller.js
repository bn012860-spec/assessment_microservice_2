import * as submissionsService from "../services/submissions.service.js";

export async function submitSolution(req, res, next) {
  const { problemId, code, language, assessmentId, attemptId } = req.body;
  const userId = req.user && req.user._id; // User model uses _id, but middleware might set .id
  const finalUserId = userId || (req.user && req.user.id);
  
  try {
    if (!finalUserId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const result = await submissionsService.submitSolution({ 
      problemId, 
      code, 
      language, 
      userId: finalUserId,
      assessmentId,
      attemptId
    });
    if (result.notFound) {
      return res.status(404).json({ msg: "Problem not found" });
    }
    res.status(202).json(result.submission);
  } catch (err) {
    if (err.status && err.body) {
      return res.status(err.status).json(err.body);
    }
    next(err);
  }
}

export async function getSubmissionById(req, res, next) {
  const { _id } = req.params;
  const userId = req.user && req.user.id;
  const role = req.user && req.user.role;

  try {
    const result = await submissionsService.getSubmissionById(_id, { userId, role });
    if (result.notFound) {
      return res.status(404).json({ msg: "Submission not found" });
    }
    if (result.forbidden) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    res.json(result.submission);
  } catch (err) {
    next(err);
  }
}

export async function getMySubmissions(req, res, next) {
  const userId = req.user && req.user.id;

  try {
    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const result = await submissionsService.getMySubmissions(userId);
    res.json(result.submissions);
  } catch (err) {
    next(err);
  }
}
