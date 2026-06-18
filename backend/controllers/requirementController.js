import Requirement from "../models/Requirement.js";

// GET /api/requirements
export const getRequirements = async (req, res) => {
  try {
    const { priority, category, search } = req.query;
    const filter = {};

    if (priority && priority !== "All") filter.priority = priority;
    if (category && category !== "All") filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const requirements = await Requirement.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/requirements/:id
export const getRequirementById = async (req, res) => {
  try {
    const req_ = await Requirement.findById(req.params.id).populate("createdBy", "name email");
    if (!req_) return res.status(404).json({ message: "Requirement not found" });
    res.json(req_);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/requirements
export const createRequirement = async (req, res) => {
  try {
    const { title, description, priority, category, stakeholder } = req.body;

    const requirement = await Requirement.create({
      title,
      description,
      priority,
      category,
      stakeholder,
      createdBy: req.user._id,
    });

    res.status(201).json(requirement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/requirements/:id
export const updateRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });
    res.json(requirement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/requirements/:id
export const deleteRequirement = async (req, res) => {
  try {
    const requirement = await Requirement.findByIdAndDelete(req.params.id);
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });
    res.json({ message: "Requirement deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};