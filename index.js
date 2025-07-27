const express = require("express");
require("dotenv").config(); // Load env vars
require("./config/db"); // MySQL connection
const cors = require("cors");

const app = express();
const { pool, testConnection } = require("./config/db");
// ✅ Allow both local + deployed frontend
const allowedOrigins = [
  "https://student-task-manager-front.vercel.app", // Update with your frontend URL later
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ✅ Quick health check route
app.get("/", (req, res) => {
  res.send("✅ Student Task Manager Backend is Live!");
});

// ✅ Routes
const auth = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const adminRoutes = require("./routes/admin");
app.use("/api", auth);
app.use("/api", taskRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Always bind Railway’s dynamic port
const PORT = process.env.PORT || 3000;

// ✅ Add better startup logging
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Starting backend...");
  console.log(`✅ Server running on port ${PORT}`);
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

