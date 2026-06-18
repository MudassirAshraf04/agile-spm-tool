import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },         // e.g. Sprint 1
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    goal:      { type: String, default: "" },
    status:    { type: String, enum: ["Planned", "Active", "Completed"], default: "Planned" },
    capacity:  { type: Number, default: 32 },            // story points
    stories:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
  },
  { timestamps: true }
);

// Virtual: total story points in sprint
sprintSchema.virtual("totalPoints").get(function () {
  return this.stories.length;
});

const Sprint = mongoose.model("Sprint", sprintSchema);
export default Sprint;