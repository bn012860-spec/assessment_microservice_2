import express from "express";
import mongoose from "mongoose";
import Problem from "../../models/Problem.mjs";
import Submission from "../../models/Submission.mjs";
import Assessment from "../../models/Assessment.mjs";
import User from "../../models/User.mjs";
import { getChannel } from "../config/rabbit.js";
import { getRedis } from "../config/redis.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";

const router = express.Router();

router.get("/system-stats", verifyToken, authorizeRoles("admin", "superadmin"), async (req, res) => {
  try {
    // 1. Metrics
    const [totalProblems, totalSubmissions, totalAssessments, totalUsers] = await Promise.all([
      Problem.countDocuments(),
      Submission.countDocuments(),
      Assessment.countDocuments(),
      User.countDocuments()
    ]);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const submissionsToday = await Submission.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    const acceptedToday = await Submission.countDocuments({
      status: "Success",
      createdAt: { $gte: startOfDay }
    });

    // 2. Queue Monitoring
    let queueLength = 0;
    const channel = getChannel();
    if (channel) {
      try {
        const queueInfo = await channel.checkQueue(process.env.SUBMISSION_QUEUE || "submission_queue");
        queueLength = queueInfo.messageCount;
      } catch (err) {
        console.error("Failed to check queue:", err.message);
      }
    }

    // 3. Judge Stats
    let judgeStats = null;
    let judgeHealth = "offline";
    try {
      // Use internal service name
      const response = await fetch("http://judge-service-go:8081/stats");
      if (response.ok) {
        judgeStats = await response.json();
        judgeHealth = "healthy";
      }
    } catch (err) {
      console.log("Judge stats not available:", err.message);
    }

    // 4. System Health
    const health = {
      api: "healthy",
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      redis: "disconnected",
      rabbitmq: (channel && channel.connection) ? "connected" : "disconnected",
      judge: judgeHealth
    };

    const redis = getRedis();
    if (redis && redis.isOpen) {
      try {
        await redis.ping();
        health.redis = "connected";
      } catch (err) {
        health.redis = "error";
      }
    }

    // 5. Recent Submissions Feed
    const recentSubmissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("problemId", "title")
      .populate("userId", "name email");

    res.json({
      metrics: {
        totalProblems,
        totalSubmissions,
        totalAssessments,
        totalUsers,
        submissionsToday,
        acceptedToday
      },
      queueLength,
      judgeStats,
      health,
      recentSubmissions
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
