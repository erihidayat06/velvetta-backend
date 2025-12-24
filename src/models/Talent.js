import pool from '../config/database.js';

class Talent {
  static async create(talentData) {
    const { name, level, description, age, location, languages, specialties } = talentData;
    
    const languagesJson = languages ? JSON.stringify(languages) : null;
    const specialtiesJson = specialties ? JSON.stringify(specialties) : null;
    
    const [result] = await pool.execute(
      `INSERT INTO talents (name, level, description, age, location, languages, specialties, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, level, description, age || null, location || null, languagesJson, specialtiesJson]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM talents WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    
    if (rows[0]) {
      rows[0].languages = rows[0].languages ? JSON.parse(rows[0].languages) : [];
      rows[0].specialties = rows[0].specialties ? JSON.parse(rows[0].specialties) : [];
    }
    
    return rows[0] || null;
  }

  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT * FROM talents WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );
    
    return rows.map(row => ({
      ...row,
      languages: row.languages ? JSON.parse(row.languages) : [],
      specialties: row.specialties ? JSON.parse(row.specialties) : []
    }));
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'languages' || key === 'specialties') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    await pool.execute(
      `UPDATE talents SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute(
      `UPDATE talents SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );
    return true;
  }

  static async getImages(talentId) {
    const [rows] = await pool.execute(
      `SELECT id, talent_id, image_url, display_order, created_at
       FROM talent_images WHERE talent_id = ? ORDER BY display_order ASC`,
      [talentId]
    );
    return rows;
  }

  static async addImage(talentId, imageUrl, displayOrder) {
    const [result] = await pool.execute(
      `INSERT INTO talent_images (talent_id, image_url, display_order, created_at)
       VALUES (?, ?, ?, NOW())`,
      [talentId, imageUrl, displayOrder]
    );
    return result.insertId;
  }

  static async deleteImage(imageId) {
    await pool.execute(
      `DELETE FROM talent_images WHERE id = ?`,
      [imageId]
    );
    return true;
  }

  static async updateImageOrder(talentId, imageOrders) {
    // imageOrders: [{ id, display_order }]
    for (const { id, display_order } of imageOrders) {
      await pool.execute(
        `UPDATE talent_images SET display_order = ? WHERE id = ? AND talent_id = ?`,
        [display_order, id, talentId]
      );
    }
    return true;
  }
}

export default Talent;

