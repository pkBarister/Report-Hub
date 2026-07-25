const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected route (User must be logged in to see their own profile)
router.get("/me", protect, authController.getMe);

module.exports = router;
