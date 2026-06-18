import Sprint from "../models/Sprint.js";
import Story  from "../models/Story.js";

// GET /api/sprints
export const getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .populate("stories", "storyId iWant points status assignee")
      .sort({ createdAt: 1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sprints/:id
export const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate({
      path: "stories",
      populate: { path: "assignee", select: "name" },
    });
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sprints
export const createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, goal, capacity } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: "endDate must be after startDate" });
    }

    const sprint = await Sprint.create({ name, startDate, endDate, goal, capacity });
    res.status(201).json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sprints/:id
export const updateSprint = async (req, res) => {
  try {
    // Only one Active sprint at a time
    if (req.body.status === "Active") {
      await Sprint.updateMany(
        { _id: { $ne: req.params.id }, status: "Active" },
        { status: "Planned" }
      );
    }

    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("stories", "storyId iWant points status");

    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/sprints/:id/stories — add a story to sprint
export const addStoryToSprint = async (req, res) => {
  try {
    const { storyId } = req.body;

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (!sprint.stories.map(String).includes(String(storyId))) {
      sprint.stories.push(storyId);
      await sprint.save();
      await Story.findByIdAndUpdate(storyId, {
        sprint: sprint._id,
        status: "In Sprint",
      });
    }

    const populated = await sprint.populate("stories", "storyId iWant points status");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sprints/:id/stories/:storyId — remove story from sprint  ← NEW
export const removeStoryFromSprint = async (req, res) => {
  try {
    const { id: sprintId, storyId } = req.params;

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    sprint.stories = sprint.stories.filter(
      (s) => String(s) !== String(storyId)
    );
    await sprint.save();

    // Reset story back to Backlog
    await Story.findByIdAndUpdate(storyId, {
      sprint: null,
      status: "Backlog",
    });

    const populated = await sprint.populate("stories", "storyId iWant points status");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sprints/:id/stats  ← NEW
export const getSprintStats = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate("stories", "points status");
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    const totalPoints     = sprint.stories.reduce((s, st) => s + (st.points || 0), 0);
    const donePoints      = sprint.stories.filter((st) => st.status === "Done")
                                          .reduce((s, st) => s + (st.points || 0), 0);
    const remainingPoints = totalPoints - donePoints;

    const byStatus = sprint.stories.reduce((acc, st) => {
      acc[st.status] = (acc[st.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      sprintId: sprint._id,
      name: sprint.name,
      capacity: sprint.capacity,
      totalPoints,
      donePoints,
      remainingPoints,
      velocity: donePoints,
      byStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/sprints/:id
export const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    // Reset all stories in this sprint back to Backlog
    if (sprint.stories.length > 0) {
      await Story.updateMany(
        { _id: { $in: sprint.stories } },
        { sprint: null, status: "Backlog" }
      );
    }

    await sprint.deleteOne();
    res.json({ message: "Sprint deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};