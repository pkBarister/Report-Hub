const ReportModel = require("../models/reportModel");
const AIService = require("../services/aiService");
const PPTXService = require("../services/pptxService");
const fs = require("fs");

// 1. Create a new report from a template
exports.createReport = async (req, res) => {
  try {
    const { templateId, title, reportType, templateContent, workspaceId } = req.body;
    const userId = req.user ? req.user.id : null;

    const newReport = await ReportModel.create({
      userId,
      workspaceId,
      templateId,
      title: title || "New Internship Report",
      reportType: reportType || "internship_report",
      templateContent,
    });

    res.status(201).json(newReport);
  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({ error: "Failed to create report" });
  }
};

// 2. Get all reports for the logged-in user
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await ReportModel.getByUserId(userId);
    res.status(200).json(reports);
  } catch (error) {
    console.error("Get User Reports Error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// 3. Trigger AI Style Transfer (Swap template content with student notes)
exports.generateAIReport = async (req, res) => {
  try {
    const { reportId, userNotes, templateContent } = req.body;

    let baseContent = templateContent;
    let report = null;

    if (reportId) {
      report = await ReportModel.getById(reportId);
      if (report) {
        baseContent = report.original_content || report.current_content;
      }
    }

    if (!baseContent) {
      return res.status(400).json({ error: "Template content or reportId is required" });
    }

    // AI Style Transfer
    const transformedContent = await AIService.styleTransfer(baseContent, userNotes);

    // Save update if report exists
    let updatedReport = report;
    if (reportId && report) {
      updatedReport = await ReportModel.updateContent(reportId, transformedContent);
    }

    res.status(200).json({
      message: "Report transformed successfully",
      transformedContent,
      report: updatedReport,
    });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message || "AI generation failed" });
  }
};

// 4. Upload Audio & Convert to Report
exports.uploadAudioReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const { workspaceId, reportType } = req.body;
    const userId = req.user ? req.user.id : null;
    const filePath = req.file.path;

    // AI processes the audio into structured Tiptap JSON
    const reportContent = await AIService.processAudioToReport(filePath);

    // Save to DB if DB is configured
    let reportId = null;
    try {
      reportId = await ReportModel.createFromAudio(
        userId,
        workspaceId || null,
        reportType || "internship_report",
        reportContent,
        req.file.path
      );
    } catch (dbErr) {
      console.warn("DB save skipped for audio report:", dbErr.message);
    }

    // Clean up local temp audio file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(201).json({
      message: "Report generated from audio successfully",
      reportId,
      content: reportContent,
    });
  } catch (error) {
    console.error("Audio Processing Error:", error);
    res.status(500).json({ error: "Failed to process audio report" });
  }
};

// 5. Convert & Export Report to PowerPoint Presentation (.pptx)
exports.exportPowerPoint = async (req, res) => {
  try {
    const { reportId, title, content } = req.body;

    let docContent = content;
    let reportTitle = title || "Internship Report Presentation";

    if (reportId) {
      const report = await ReportModel.getById(reportId);
      if (report) {
        docContent = report.current_content || report.original_content;
        reportTitle = report.title || reportTitle;
      }
    }

    if (!docContent) {
      return res.status(400).json({ error: "Report content or valid reportId is required for PowerPoint export." });
    }

    const pptxBuffer = await PPTXService.generatePresentation(docContent, reportTitle);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(reportTitle)}.pptx"`);
    res.send(pptxBuffer);
  } catch (error) {
    console.error("PowerPoint Export Error:", error);
    res.status(500).json({ error: "Failed to generate PowerPoint presentation" });
  }
};
