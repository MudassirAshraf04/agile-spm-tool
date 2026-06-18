import express from "express";
import {
  getRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} from "../controllers/requirementController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",    protect, getRequirements);
router.get("/:id", protect, getRequirementById);
router.post("/",   protect, createRequirement);
router.put("/:id", protect, updateRequirement);
router.delete("/:id", protect, deleteRequirement);

export default router;