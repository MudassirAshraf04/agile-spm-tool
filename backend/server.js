import express  from "express";
import cors     from "cors";
import dotenv   from "dotenv";
import connectDB from "./config/db.js";

import authRoutes         from "./routes/authRoutes.js";
import requirementRoutes  from "./routes/requirementRoutes.js";
import storyRoutes        from "./routes/storyRoutes.js";
import sprintRoutes       from "./routes/sprintRoutes.js";
import estimationRoutes   from "./routes/estimationRoutes.js";
import userRoutes         from "./routes/userRoutes.js";        // ← NEW

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth",         authRoutes);
app.use("/api/requirements", requirementRoutes);
app.use("/api/stories",      storyRoutes);
app.use("/api/sprints",      sprintRoutes);
app.use("/api/estimations",  estimationRoutes);
app.use("/api/users",        userRoutes);           // ← NEW

app.get("/api/health", (req, res) => {
  res.json({ status: "AgileCase API is running", time: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`✅  Server running on port ${PORT}`)
);

process.on("SIGTERM", () => server.close());
process.on("SIGINT",  () => server.close());

export default app;