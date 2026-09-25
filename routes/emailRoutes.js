import express from "express";

import {
  findLeadEmail,
  verifyLeadEmail,
  sendLeadEmail,
  getEmailHistory,
  getEmailStats,
} from "../controllers/emailController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Find email
router.post("/find", authMiddleware, findLeadEmail);

// Verify email
router.post("/verify", authMiddleware, verifyLeadEmail);

// Send email
router.post("/send", authMiddleware, sendLeadEmail);

// Email history
router.get("/", authMiddleware, getEmailHistory);

// Email statistics
router.get("/stats", authMiddleware, getEmailStats);

export default router;