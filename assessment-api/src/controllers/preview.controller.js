import { buildPreview, validateProblemDefinition } from "../services/preview.service.js";

export async function previewWrapper(req, res, next) {
  try {
    const result = await buildPreview(req.body || {});
    return res.json(result);
  } catch (err) {
    if (err.status && err.body) {
      return res.status(err.status).json(err.body);
    }
    next(err);
  }
}

export async function validateProblem(req, res, next) {
  try {
    const result = await validateProblemDefinition(req.body || {});
    return res.json(result);
  } catch (err) {
    next(err);
  }
}
