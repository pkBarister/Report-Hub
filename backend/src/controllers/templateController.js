const TemplateModel = require('../models/templateModel');
const DocumentParser = require('../services/documentParser');
const fs = require('fs');

// 1. Upload a document (.docx, .pdf, .txt, .md) and add it as a template
exports.uploadTemplateDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file uploaded.' });
    }

    const { title, category, description } = req.body;
    const originalName = req.file.originalname;
    const filePath = req.file.path;

    // Parse text and HTML content from document
    const parsedContent = await DocumentParser.parseDocument(filePath, originalName);

    // Save as new template in DB
    const templateTitle = title && title.trim() ? title.trim() : originalName.replace(/\.[^/.]+$/, '');
    const templateCategory = category && category.trim() ? category.trim() : 'custom';
    const templateDescription = description && description.trim() ? description.trim() : `Uploaded template from ${originalName}`;

    const newTemplate = await TemplateModel.create({
      title: templateTitle,
      type: 'uploaded_document',
      category: templateCategory,
      description: templateDescription,
      content: parsedContent,
      isCustom: true,
    });

    // Cleanup temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(201).json({
      message: 'Template created successfully from document',
      template: newTemplate,
    });
  } catch (error) {
    console.error('Upload Template Document Error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message || 'Failed to parse and save document template' });
  }
};

// 2. Get all templates (including uploaded custom ones)
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await TemplateModel.findAll();
    res.status(200).json(templates);
  } catch (error) {
    console.error('Get All Templates Error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// 3. Delete a custom template by ID
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TemplateModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.status(200).json({ message: 'Template deleted successfully', deleted });
  } catch (error) {
    console.error('Delete Template Error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
