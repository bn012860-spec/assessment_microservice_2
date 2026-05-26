import express from "express";
import mongoose from "mongoose";
import { getRedis } from "../config/redis.js";
import { getChannel } from "../config/rabbit.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date(),
    services: {
      mongodb: "unknown",
      redis: "unknown",
      rabbitmq: "unknown"
    }
  };

  try {
    // Check MongoDB
    if (mongoose.connection.readyState === 1) {
      health.services.mongodb = "connected";
    } else {
      health.services.mongodb = "disconnected";
      health.status = "unhealthy";
    }

    // Check Redis
    const redis = getRedis();
    if (redis && redis.isOpen) {
      try {
        await redis.ping();
        health.services.redis = "connected";
      } catch (err) {
        health.services.redis = "error";
        health.status = "unhealthy";
      }
    } else {
      health.services.redis = "disconnected";
      health.status = "unhealthy";
    }

    // Check RabbitMQ
    const channel = getChannel();
    if (channel && channel.connection) {
       health.services.rabbitmq = "connected";
    } else {
      health.services.rabbitmq = "disconnected";
      health.status = "unhealthy";
    }

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
