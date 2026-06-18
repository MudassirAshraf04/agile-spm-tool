import Story from "../models/Story.js";

// GET /api/stories
export const getStories = async (req, res) => {
  try {
    const { status, priority, search, requirementId } = req.query;
    const filter = {};

    if (status      && status   !== "All") filter.status      = status;
    if (priority    && priority !== "All") filter.priority    = priority;
    if (requirementId)                     filter.requirement = requirementId;
    if (search) filter.iWant = { $regex: search, $options: "i" };

    const stories = await Story.find(filter)
      .populate("requirement", "reqId title")
      .populate("assignee",    "name email")
      .populate("sprint",      "name status")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/stories/:id
export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("requirement", "reqId title")
      .populate("assignee",    "name email")
      .populate("sprint",      "name status");
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/stories
export const createStory = async (req, res) => {
  try {
    const { requirement, asA, iWant, soThat, acceptance, points, priority, assignee } = req.body;

    const story = await Story.create({
      requirement: requirement || null,
      asA,
      iWant,
      soThat,
      acceptance,
      points:   Number(points) || 0,
      priority,
      assignee: assignee || null,
    });

    await story.populate("requirement", "reqId title");
    await story.populate("assignee",    "name email");
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/stories/:id
export const updateStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("requirement", "reqId title")
      .populate("assignee",    "name email")
      .populate("sprint",      "name status");

    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/stories/:id/status — Kanban drag-drop
export const updateStoryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const VALID = ["Backlog", "In Sprint", "In Progress", "Done", "Blocked"];
    if (!VALID.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID.join(", ")}` });
    }

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("assignee", "name email");

    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/stories/:id/assignee  ← NEW
export const updateStoryAssignee = async (req, res) => {
  try {
    const { assignee } = req.body;

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { assignee: assignee || null },
      { new: true }
    ).populate("assignee", "name email");

    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/stories/:id
export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json({ message: "Story deleted", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};