import express from "express";
import {
  getSprints,
  getSprintById,
  createSprint,
  updateSprint,
  addStoryToSprint,
  removeStoryFromSprint,
  getSprintStats,
  deleteSprint,
} from "../controllers/sprintController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",                        protect, getSprints);
router.get("/:id",                     protect, getSprintById);
router.post("/",                       protect, createSprint);
router.put("/:id",                     protect, updateSprint);
router.post("/:id/stories",            protect, addStoryToSprint);
router.delete("/:id/stories/:storyId", protect, removeStoryFromSprint);  // ← NEW
router.get("/:id/stats",               protect, getSprintStats);          // ← NEW
router.delete("/:id",                  protect, deleteSprint);

export default router;