import pool from "../config/database.js";

const safeParse = (str) => {
  try {
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
};

class Talent {
  // =========================
  // CREATE
  // =========================
  static async create(talentData) {
    const { name, level, description, age, location, languages, specialties } =
      talentData;

    const [result] = await pool.execute(
      `
      INSERT INTO talents 
      (name, level, description, age, location, languages, specialties, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        name,
        level,
        description,
        age ?? null,
        location ?? null,
        languages, // ⬅️ SUDAH JSON STRING
        specialties, // ⬅️ SUDAH JSON STRING
      ]
    );

    return this.findById(result.insertId);
  }

  // =========================
  // FIND BY ID
  // =========================
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM talents WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!rows[0]) return null;

    return {
      ...rows[0],
      languages: safeParse(rows[0].languages),
      specialties: safeParse(rows[0].specialties),
    };
  }

  // =========================
  // GET ALL
  // =========================
  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT * FROM talents WHERE deleted_at IS NULL ORDER BY created_at DESC`
    );

    return rows.map((row) => ({
      ...row,
      languages: safeParse(row.languages),
      specialties: safeParse(row.specialties),
    }));
  }

  // =========================
  // UPDATE
  // =========================
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value); // ⬅️ TERIMA APA ADANYA
      }
    });

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.execute(
      `
      UPDATE talents 
      SET ${fields.join(", ")}
      WHERE id = ? AND deleted_at IS NULL
      `,
      values
    );

    return this.findById(id);
  }

  // =========================
  // SOFT DELETE
  // =========================
  static async delete(id) {
    await pool.execute(`UPDATE talents SET deleted_at = NOW() WHERE id = ?`, [
      id,
    ]);
    return true;
  }

  // =========================
  // IMAGES
  // =========================
  static async getImages(talentId) {
    const [rows] = await pool.execute(
      `
      SELECT id, talent_id, image_url, display_order, created_at
      FROM talent_images
      WHERE talent_id = ?
      ORDER BY display_order ASC
      `,
      [talentId]
    );
    return rows;
  }

  static async addImage(talentId, imageUrl, displayOrder) {
    const [result] = await pool.execute(
      `
      INSERT INTO talent_images 
      (talent_id, image_url, display_order, created_at)
      VALUES (?, ?, ?, NOW())
      `,
      [talentId, imageUrl, displayOrder]
    );
    return result.insertId;
  }

  static async deleteImage(imageId) {
    await pool.execute(`DELETE FROM talent_images WHERE id = ?`, [imageId]);
    return true;
  }

  static async updateImageOrder(talentId, imageOrders) {
    for (const { id, display_order } of imageOrders) {
      await pool.execute(
        `
        UPDATE talent_images 
        SET display_order = ?
        WHERE id = ? AND talent_id = ?
        `,
        [display_order, id, talentId]
      );
    }
    return true;
  }
}

export default Talent;
