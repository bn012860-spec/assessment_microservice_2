import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";

const router = express.Router();

// Public registration is disabled for college deployment
// Only superadmins can use the direct register endpoint if needed
router.post("/register", verifyToken, authorizeRoles("superadmin"), register);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);


export default router;
