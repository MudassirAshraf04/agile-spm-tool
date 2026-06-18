import Estimation from "../models/Estimation.js";

// GET /api/estimations
export const getEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.find()
      .populate("story",     "storyId iWant")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(estimations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/estimations  — save an estimation result
export const createEstimation = async (req, res) => {
  try {
    const { story, method, result, details } = req.body;

    const estimation = await Estimation.create({
      story:     story || null,
      method,
      result:    Number(result),
      details,
      createdBy: req.user._id,
    });

    res.status(201).json(estimation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/estimations/:id
export const deleteEstimation = async (req, res) => {
  try {
    await Estimation.findByIdAndDelete(req.params.id);
    res.json({ message: "Estimation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};