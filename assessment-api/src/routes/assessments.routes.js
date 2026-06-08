import express from "express";
import { verifyToken, optionalVerifyToken, authorizeRoles } from "../middleware/auth.mjs";
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
  getAttemptSubmissions,
  getAssessmentAttendance,
  logAntiCheatingEvent
} from "../controllers/assessments.controller.js";

const router = express.Router();

router.get("/", optionalVerifyToken, listAssessments);
router.get("/:_id", verifyToken, getAssessmentById);
router.post("/", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), createAssessment);
router.put("/:_id", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), updateAssessment);
router.delete("/:_id", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), deleteAssessment);

router.post("/:_id/start", verifyToken, authorizeRoles("student"), startAssessment);
router.post("/attempts/:attemptId/submit", verifyToken, authorizeRoles("student", "admin", "faculty", "superadmin"), submitAssessment);
router.post("/attempts/:attemptId/log-event", verifyToken, authorizeRoles("student"), logAntiCheatingEvent);
router.get("/:_id/attempts", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), listAssessmentAttempts);
router.get("/:_id/attendance", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), getAssessmentAttendance);
router.get("/attempts/:attemptId", verifyToken, getAssessmentAttemptById);
router.get("/attempts/:attemptId/submissions", verifyToken, getAttemptSubmissions);

export default router;
