import express from "express";
import Problem from "../../models/Problem.mjs";
import Submission from "../../models/Submission.mjs";
import { getChannel } from "../config/rabbit.js";

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const acceptedToday = await Submission.countDocuments({
      status: "SUCCESS",
      createdAt: { $gte: startOfDay }
    });

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

    // Try to get judge stats
    let judgeStats = null;
    try {
      const response = await fetch("http://judge-service-go:8081/stats");
      if (response.ok) {
        judgeStats = await response.json();
      }
    } catch (err) {
      // It's okay if it fails, maybe judge service is not up or port is blocked
      console.log("Judge stats not available:", err.message);
    }

    res.json({
      totalProblems,
      totalSubmissions,
      acceptedToday,
      queueLength,
      judgeStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
