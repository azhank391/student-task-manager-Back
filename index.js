const express = require('express');
require('./config/db'); // This will trigger the connection test
require('dotenv').config(); // Load environment variables from .env file
const app = express();
const cors = require('cors');
// Importing the auth routes
const auth = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('../Back End/routes/admin')
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors({
    origin: "http://localhost:5173",
})); // Enable CORS for all routes
app.use("/api",auth)
app.use("/api",taskRoutes)
app.use("/api/admin",adminRoutes)
//start the server
//show in the terminal that mysql is connected
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});