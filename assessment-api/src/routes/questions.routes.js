import express from "express";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";
import { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, getTags } from "../controllers/questions.controller.js";

const router = express.Router();

// Only faculty/admin/superadmin can manage question bank
router.get("/", verifyToken, authorizeRoles("faculty", "admin", "superadmin"), listQuestions);
router.get("/tags", verifyToken, authorizeRoles("faculty", "admin", "superadmin"), getTags);
router.get("/:_id", verifyToken, authorizeRoles("faculty", "admin", "superadmin"), getQuestion);
router.post("/", verifyToken, authorizeRoles("faculty", "admin", "superadmin"), createQuestion);
router.put("/:_id", verifyToken, authorizeRoles("faculty", "admin", "superadmin"), updateQuestion);
router.delete("/:_id", verifyToken, authorizeRoles("faculty", "admin", "superadmin"), deleteQuestion);

export default router;
