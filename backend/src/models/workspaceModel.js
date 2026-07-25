const pool = require('../config/db');

class WorkspaceModel {
  async create({ writer_id, name, description }) {
    const query = `
      INSERT INTO workspaces (writer_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [writer_id, name, description]);
    return rows[0];
  }

  async findByWriter(writer_id) {
    const query = 'SELECT * FROM workspaces WHERE writer_id = $1';
    const { rows } = await pool.query(query, [writer_id]);
    return rows;
  }
}
module.exports = new WorkspaceModel();