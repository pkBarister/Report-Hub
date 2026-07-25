const WorkspaceModel = require('../models/workspaceModel');

exports.createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    // req.user.id comes from the authMiddleware
    const workspace = await WorkspaceModel.create({
      writer_id: req.user.id,
      name,
      description
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: "Failed to create workspace" });
  }
};

exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await WorkspaceModel.findByWriter(req.user.id);
    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};