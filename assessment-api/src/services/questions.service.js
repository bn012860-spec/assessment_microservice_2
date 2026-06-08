import * as questionsRepo from "../repositories/questions.repo.js";
import { HttpError } from "../utils/httpError.js";

function parsePagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));
  return { limit, skip: (page - 1) * limit };
}

function buildFilter(query = {}, user = null) {
  const filter = {};
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.tag) {
    const tags = Array.isArray(query.tag) ? query.tag : String(query.tag).split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length) filter.tags = { $in: tags };
  }
  if (query.search) filter.title = { $regex: query.search, $options: 'i' };
  if (query.collegeId) filter.collegeId = query.collegeId;

  // Visibility: faculty/admin should see their college & private authored questions
  if (user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'faculty')) {
    // no extra filter
  } else {
    // for non-privileged users, only Public questions
    filter.visibility = 'Public';
  }

  return filter;
}

export async function listQuestions(query = {}, user = null) {
  const filter = buildFilter(query, user);
  const options = parsePagination(query);
  const [questions, total] = await Promise.all([
    questionsRepo.findAll(filter, options),
    questionsRepo.count(filter)
  ]);

  const page = Math.max(1, Number(query.page || 1));
  const totalPages = Math.max(1, Math.ceil(total / options.limit));

  return { questions, total, page, totalPages };
}

export async function getQuestionById(id, user = null) {
  const q = await questionsRepo.findById(id);
  if (!q) return null;

  if (q.visibility === 'Public') return q;
  if (!user) return null;
  if (user.role === 'superadmin' || user.role === 'admin') return q;
  if (user.role === 'faculty' && String(q.collegeId) === String(user.collegeId)) return q;
  if (String(q.author) === String(user._id)) return q;

  return null;
}

export async function createQuestion(payload, user) {
  if (!user) throw new HttpError(401, 'Unauthorized');
  const data = { ...payload };
  data.author = user._id;
  if (!data.collegeId && user.collegeId) data.collegeId = user.collegeId;

  // Basic validation
  if (!data.title || typeof data.title !== 'string') throw new HttpError(400, 'Title is required');
  return questionsRepo.create(data);
}

export async function updateQuestion(id, payload, user) {
  const q = await questionsRepo.findById(id);
  if (!q) throw new HttpError(404, 'Question not found');

  // Only author or admin/faculty can update
  if (String(q.author) !== String(user._id) && !(user.role === 'admin' || user.role === 'superadmin' || user.role === 'faculty')) {
    throw new HttpError(403, 'Forbidden');
  }

  return questionsRepo.updateById(id, payload);
}

export async function deleteQuestion(id, user) {
  const q = await questionsRepo.findById(id);
  if (!q) throw new HttpError(404, 'Question not found');
  if (String(q.author) !== String(user._id) && !(user.role === 'admin' || user.role === 'superadmin')) {
    throw new HttpError(403, 'Forbidden');
  }
  return questionsRepo.deleteById(id);
}
