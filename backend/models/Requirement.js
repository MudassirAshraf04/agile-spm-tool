import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema(
  {
    reqId:       { type: String, unique: true },       // e.g. REQ-1
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    priority:    { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    category:    { type: String, enum: ["Functional", "Non-Functional", "Business", "Technical"], default: "Functional" },
    stakeholder: { type: String, default: "" },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Auto-generate reqId before saving
requirementSchema.pre("save", async function (next) {
  if (!this.reqId) {
    const count = await mongoose.model("Requirement").countDocuments();
    this.reqId = `REQ-${count + 1}`;
  }
  next();
});

const Requirement = mongoose.model("Requirement", requirementSchema);
export default Requirement;