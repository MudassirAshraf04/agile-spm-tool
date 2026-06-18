import express from "express";
import {
  getEstimations,
  createEstimation,
  deleteEstimation,
} from "../controllers/estimationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",    protect, getEstimations);
router.post("/",   protect, createEstimation);
router.delete("/:id", protect, deleteEstimation);

export default router;