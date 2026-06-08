import Question from "../../models/Question.mjs";

export async function findAll(filter = {}, options = {}) {
  return Question.find(filter, null, options);
}

export async function count(filter = {}) {
  return Question.countDocuments(filter);
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
