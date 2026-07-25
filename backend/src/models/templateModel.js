const pool = require('../config/db');

class TemplateModel {
  async create({ title, type, category, description, content, isCustom = true }) {
    const query = `
      INSERT INTO templates (title, type, category, description, content, is_custom)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      title,
      type || 'custom',
      category || 'custom',
      description || '',
      typeof content === 'object' ? JSON.stringify(content) : content,
      isCustom,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findById(id) {
    const query = 'SELECT * FROM templates WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  async findAll() {
    const query = 'SELECT id, title, type, category, description, content, is_custom, created_at FROM templates ORDER BY created_at DESC';
    const { rows } = await pool.query(query);
    return rows;
  }

  async delete(id) {
    const query = 'DELETE FROM templates WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = new TemplateModel();