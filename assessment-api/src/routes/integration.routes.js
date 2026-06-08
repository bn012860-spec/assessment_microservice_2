import express from "express";
import { verifyService, verifyIntegrationStudent } from "../middleware/integration.mjs";
import { validate } from "../../middleware/validator.mjs";
import {
  startAssessment,
  getAssessmentById,
  createAssessment,
  listAssessmentAttempts
} from "../controllers/assessments.controller.js";
import {
  submitSolution,
  getSubmissionById
} from "../controllers/submissions.controller.js";

const router = express.Router();

// All integration routes require the service key
router.use(verifyService);

router.post("/assessments", createAssessment);

// Most integration routes also require a student JWT
router.get("/assessments/:_id", verifyIntegrationStudent, getAssessmentById);
router.post("/assessments/:_id/start", verifyIntegrationStudent, startAssessment);

router.post("/submissions", verifyIntegrationStudent, validate("submission"), submitSolution);
router.get("/submissions/:_id", verifyIntegrationStudent, getSubmissionById);

// Results might be requested by the service on behalf of the admin, 
// so maybe it only needs verifyService? 
// Or maybe it needs a teacher/admin JWT?
// For now, let's keep it consistent with verifyIntegrationStudent if that's how it's used.
// But results for an assessment might be better served with just verifyService if it's a backend-to-backend call.
router.get("/results/:_id", listAssessmentAttempts); 

export default router;
