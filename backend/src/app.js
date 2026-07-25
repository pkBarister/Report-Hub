const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// --- MIDDLEWARE ---
// Allows your React frontend to talk to this backend (Cross-Origin Resource Sharing)
app.use(cors());

// Allows the app to parse incoming JSON data in request bodies
app.use(express.json());

// --- ROUTES ---
// We prefix our routes with /api to keep things organized
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes); // Add this
app.use("/api/reports", reportRoutes);

// Basic health check route
app.get("/", (req, res) => {
  res.send("Report Hub API is running...");
});

// --- ERROR HANDLING ---
// A global error handler to catch any unhandled errors and prevent the server from crashing
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong on the server!",
    message: err.message,
  });
});

module.exports = app;
