import Question from "../../models/Question.mjs";

export async function findAll(filter = {}, options = {}) {
  return Question.find(filter, null, options);
}

export async function count(filter = {}) {
  return Question.countDocuments(filter);
}

export async function distinctTags(filter = {}) {
  return Question.distinct('tags', filter);
}

export async function sample(filter = {}, size = 1) {
  // Use aggregation $sample for efficient random selection
  const s = Math.max(0, Number(size) || 0);
  if (s <= 0) return [];
  return Question.aggregate([
    { $match: filter },
    { $sample: { size: s } }
  ]);
}

export async function findById(id) {
  return Question.findById(id);
}

export async function create(data) {
  const q = new Question(data);
  return q.save();
}

export async function updateById(id, data) {
  return Question.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteById(id) {
  return Question.findByIdAndDelete(id);
}
