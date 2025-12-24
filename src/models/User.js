import pool from '../config/database.js';

class User {
  static async create(userData) {
    const { name, email, phone, password, role = 'user', vvip = false } = userData;
    
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password, role, vvip, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, phone, password, role, vvip]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, vvip, created_at, updated_at
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );
    return rows[0] || null;
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return this.findById(id);
  }

  static async updatePassword(id, hashedPassword) {
    await pool.execute(
      `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [hashedPassword, id]
    );
    return this.findById(id);
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, vvip, created_at, updated_at
       FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    return rows;
  }
}

export default User;

