import express from "express";
import {
  searchLeads,
  getLeads,
  getSavedLeads,
  toggleSaveLead,
  getLeadStats,
} from "../controllers/leadController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/search", protect, searchLeads);
router.get("/", protect, getLeads);
router.get("/saved", protect, getSavedLeads);
router.post("/:id/save", protect, toggleSaveLead);
router.get("/stats", protect, getLeadStats);

export default router;