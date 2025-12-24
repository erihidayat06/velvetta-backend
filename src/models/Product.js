import pool from '../config/database.js';

class Product {
  static async create(productData) {
    const { name, price, description, image } = productData;
    
    const [result] = await pool.execute(
      `INSERT INTO products (name, price, description, image, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, price, description || '', image]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
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
      `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE products SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
    return true;
  }
}

export default Product;

