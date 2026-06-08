import Submission from "../../models/Submission.mjs";

export async function create(data) {
  const submission = new Submission(data);
  return submission.save();
}

export async function findById(id) {
  return Submission.findById(id);
}

export async function findByUserId(userId, options = {}) {
  return Submission.find({ userId }, null, options)
    .select("_id problemId language status score attemptId assessmentId createdAt updatedAt")
    .populate("problemId", "title")
    .sort({ createdAt: -1 });
}
