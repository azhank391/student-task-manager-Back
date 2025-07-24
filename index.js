const express = require('express');
require('dotenv').config(); // Load env vars first
require('./config/db'); // Your Sequelize/MySQL connection

const app = express();
const cors = require('cors');

// ✅ Allow both local dev & deployed frontend
const allowedOrigins = [
  "http://localhost:5173", // Local Vite frontend
  "https://student-task-manager-front.vercel.app" // Replace with your live Vercel URL later
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json()); // Parse JSON

// ✅ Routes
const auth = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');

app.use("/api", auth);
app.use("/api", taskRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("✅ Student Task Manager Backend is Live!");
});

// ✅ Railway gives a dynamic PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT,"0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
