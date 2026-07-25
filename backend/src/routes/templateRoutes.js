const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { documentUpload } = require('../middleware/uploadMiddleware');

// Get all templates
router.get('/', templateController.getAllTemplates);

// Upload a document (.docx, .pdf, .txt, .md) to create a new template
router.post('/upload', documentUpload.single('document'), templateController.uploadTemplateDocument);

// Delete a custom template
router.delete('/:id', templateController.deleteTemplate);

module.exports = router;
