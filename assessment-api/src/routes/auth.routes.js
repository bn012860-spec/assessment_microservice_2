import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";

const router = express.Router();

// Public registration is disabled for college deployment
// Only superadmins can use the direct register endpoint if needed
router.post("/register", verifyToken, authorizeRoles("superadmin"), register);
router.post("/login", login);

export default router;
