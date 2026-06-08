import * as questionsService from "../services/questions.service.js";

export async function listQuestions(req, res, next) {
  try {
    const qs = await questionsService.listQuestions(req.query, req.user);
    res.json(qs);
  } catch (err) {
    next(err);
  }
}

export async function getQuestion(req, res, next) {
  try {
    const q = await questionsService.getQuestionById(req.params._id, req.user);
    if (!q) return res.status(404).json({ msg: 'Question not found' });
    res.json(q);
  } catch (err) {
    next(err);
  }
}

export async function createQuestion(req, res, next) {
  try {
    const q = await questionsService.createQuestion(req.body, req.user);
    res.status(201).json(q);
  } catch (err) {
    next(err);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const q = await questionsService.updateQuestion(req.params._id, req.body, req.user);
    res.json(q);
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    await questionsService.deleteQuestion(req.params._id, req.user);
    res.json({ msg: 'Question deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getTags(req, res, next) {
  try {
    const tags = await questionsService.listTags(req.query, req.user);
    res.json(tags);
  } catch (err) {
    next(err);
  }
}
