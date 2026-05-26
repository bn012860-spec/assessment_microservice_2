import Assessment from "../../models/Assessment.mjs";

export async function findAll(filter = {}, options = {}) {
  return Assessment.find(filter, null, options).populate("createdBy", "name email");
}

export async function findById(id) {
  return Assessment.findById(id).populate("createdBy", "name email").populate("problems.problemId", "title difficulty");
}

export async function create(data) {
  const assessment = new Assessment(data);
  return assessment.save();
}

export async function updateById(id, data) {
  return Assessment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteById(id) {
  return Assessment.findByIdAndDelete(id);
}
