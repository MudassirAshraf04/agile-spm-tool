import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    storyId:     { type: String, unique: true },       // e.g. US-1
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: "Requirement", default: null },
    asA:         { type: String, default: "" },
    iWant:       { type: String, required: true },
    soThat:      { type: String, default: "" },
    acceptance:  { type: String, default: "" },
    points:      { type: Number, default: 0 },
    priority:    { type: String, enum: ["High", "Med", "Low"], default: "Med" },
    status:      { type: String, enum: ["Backlog", "In Sprint", "In Progress", "Done", "Blocked"], default: "Backlog" },
    assignee:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sprint:      { type: mongoose.Schema.Types.ObjectId, ref: "Sprint", default: null },
  },
  { timestamps: true }
);

// Auto-generate storyId before saving
storySchema.pre("save", async function (next) {
  if (!this.storyId) {
    const count = await mongoose.model("Story").countDocuments();
    this.storyId = `US-${count + 1}`;
  }
  next();
});

const Story = mongoose.model("Story", storySchema);
export default Story;