import mongoose from "mongoose";

const estimationSchema = new mongoose.Schema(
  {
    story:    { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    method:   { type: String, enum: ["planning_poker", "tshirt", "analogy", "proxy", "pert"], required: true },
    result:   { type: Number, required: true },          // final story points or hours
    details:  { type: mongoose.Schema.Types.Mixed },     // method-specific data (O, M, P for PERT etc.)
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Estimation = mongoose.model("Estimation", estimationSchema);
export default Estimation;