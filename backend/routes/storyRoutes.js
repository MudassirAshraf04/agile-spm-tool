import express from "express";
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  updateStoryStatus,
  updateStoryAssignee,
  deleteStory,
} from "../controllers/storyController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",               protect, getStories);
router.get("/:id",            protect, getStoryById);
router.post("/",              protect, createStory);
router.put("/:id",            protect, updateStory);
router.patch("/:id/status",   protect, updateStoryStatus);
router.patch("/:id/assignee", protect, updateStoryAssignee);  // ← NEW
router.delete("/:id",         protect, deleteStory);

export default router;