const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Writers can create/manage workspaces
router.post('/', protect, authorize('writer'), workspaceController.createWorkspace);
router.get('/', protect, authorize('writer'), workspaceController.getWorkspaces);

module.exports = router;