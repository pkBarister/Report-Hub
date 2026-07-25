const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { imageUpload } = require("../middleware/uploadMiddleware");

// Create & List reports
router.post("/", protect, reportController.createReport);
router.get("/me", protect, reportController.getUserReports);

// AI Style Transfer (Swap template content with student notes)
router.post("/generate", reportController.generateAIReport);
router.post("/:id/generate", reportController.generateAIReport);

// Audio Minute / Voice Note Upload
router.post("/audio", upload.single("audio"), reportController.uploadAudioReport);

// Activity Image / Photo Upload & Vision AI Report Generation
router.post("/image", imageUpload.single("image"), reportController.uploadImageReport);

// PowerPoint Export (.pptx)
router.post("/export/pptx", reportController.exportPowerPoint);

module.exports = router;
