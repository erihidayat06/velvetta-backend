import pool from '../config/database.js';

class Blog {
  static async create(blogData) {
    const { title, description, content, thumbnail } = blogData;
    
    const [result] = await pool.execute(
      `INSERT INTO blogs (title, description, content, thumbnail, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [title, description, content, thumbnail || null]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM blogs WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  static async getAll(limit = null) {
    let query = `SELECT * FROM blogs WHERE deleted_at IS NULL ORDER BY date DESC, created_at DESC`;
    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`;
    }
    const [rows] = await pool.execute(query);
    return rows;
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
      `UPDATE blogs SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE blogs SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Blog;

