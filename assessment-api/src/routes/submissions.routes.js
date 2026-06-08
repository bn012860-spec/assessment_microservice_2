import express from "express";
import { validate } from "../../middleware/validator.mjs";
import { verifyToken } from "../middleware/auth.mjs";
import {
  submitSolution,
  getSubmissionById,
  getMySubmissions,
  getMyAnalytics
} from "../controllers/submissions.controller.js";

const router = express.Router();

router.post("/", verifyToken, validate("submission"), submitSolution);
router.get("/my", verifyToken, getMySubmissions);
router.get("/analytics/my", verifyToken, getMyAnalytics);
router.get("/:_id", verifyToken, getSubmissionById);

export default router;
