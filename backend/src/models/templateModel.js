const pool = require('../config/db');

class TemplateModel {
  async findById(id) {
    const query = 'SELECT * FROM templates WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async findAll() {
    const query = 'SELECT id, title, type, category FROM templates';
    const { rows } = await pool.query(query);
    return rows;
  }
}
module.exports = new TemplateModel();