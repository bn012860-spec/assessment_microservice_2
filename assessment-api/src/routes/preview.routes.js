import express from "express";
import { previewWrapper, validateProblem } from "../controllers/preview.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), previewWrapper);
router.post("/validate", verifyToken, authorizeRoles("admin", "faculty", "superadmin"), validateProblem);

export default router;
