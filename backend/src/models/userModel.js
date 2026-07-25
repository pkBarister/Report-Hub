const pool = require("../config/db");

class UserModel {
  async create({ email, password, fullName, role }) {
    const query = `
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, role;
    `;
    // Note: The controller will handle hashing the password before passing it here
    const values = [email, password, fullName, role || "user"];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  async findById(id) {
    const query = "SELECT id, email, full_name, role FROM users WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = new UserModel();
