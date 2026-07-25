const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const reportRoutes = require("./routes/reportRoutes");

const templateRoutes = require("./routes/templateRoutes");

const path = require("path");

const app = express();

// Serve uploaded images and files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// --- MIDDLEWARE ---
// Allow Angular frontend (port 4200) and any configured origin to call this API
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:4200',
  'http://localhost:3000',
];
app.use(cors({
  origin: true,
  credentials: true,
}));

// Allows the app to parse incoming JSON data in request bodies
app.use(express.json());

// --- ROUTES ---
// We prefix our routes with /api to keep things organized
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes); // Add this
app.use("/api/reports", reportRoutes);
app.use("/api/templates", templateRoutes);

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
