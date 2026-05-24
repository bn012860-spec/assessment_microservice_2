import express from "express";
import { previewWrapper, validateProblem } from "../controllers/preview.controller.js";

const router = express.Router();

router.post("/", previewWrapper);
router.post("/validate", validateProblem);

export default router;
