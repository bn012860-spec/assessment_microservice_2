import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";
import {
  listAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  startAssessment,
  submitAssessment,
  getAssessmentAttemptById,
  listAssessmentAttempts,
  getAttemptSubmissions
} from "../controllers/assessments.controller.js";

const router = express.Router();

router.get("/", verifyToken, listAssessments);
router.get("/:_id", verifyToken, getAssessmentById);
router.post("/", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), createAssessment);
router.put("/:_id", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), updateAssessment);
router.delete("/:_id", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), deleteAssessment);

router.post("/:_id/start", verifyToken, authorizeRoles("student"), startAssessment);
router.post("/attempts/:attemptId/submit", verifyToken, authorizeRoles("student"), submitAssessment);
router.get("/:_id/attempts", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), listAssessmentAttempts);
router.get("/attempts/:attemptId", verifyToken, getAssessmentAttemptById);
router.get("/attempts/:attemptId/submissions", verifyToken, getAttemptSubmissions);

export default router;
