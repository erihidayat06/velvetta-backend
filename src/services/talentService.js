import Talent from "../models/Talent.js";
import {
  processImage,
  generateSafeFilename,
  deleteFile,
} from "../utils/imageProcessor.js";
import { sanitizeHTML } from "../utils/sanitize.js";
import path from "path";
import { fileURLToPath } from "url";
import { MAX_TALENT_IMAGES } from "../config/constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function normalizeToJsonArray(input) {
  if (!input) return JSON.stringify([]);

  let raw = "";

  // Gabungkan semua jadi string
  if (Array.isArray(input)) {
    raw = input.join(" ");
  } else if (typeof input === "string") {
    raw = input;
  } else {
    return JSON.stringify([]);
  }

  // Ambil kata saja
  const result = raw
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  return JSON.stringify(result);
}

function extractWordsToArray(input) {
  if (!input) return [];

  // Gabungkan semua jadi 1 string
  let raw = "";

  if (Array.isArray(input)) {
    raw = input.join(" ");
  } else if (typeof input === "string") {
    raw = input;
  } else {
    return [];
  }

  // Ambil kata saja (huruf, angka, spasi)
  const words = raw
    .replace(/[^a-zA-Z0-9\s]/g, " ") // buang simbol
    .split(/\s+/) // pecah spasi
    .map((w) => w.trim())
    .filter(Boolean);

  return words;
}

function normalizeLanguagesFinal(input) {
  if (input === undefined || input === null || input === "") {
    return JSON.stringify([]);
  }

  let value = input;

  // 1️⃣ Kalau STRING → coba parse
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      // CSV fallback
      value = value.split(",").map((v) => v.trim());
    }
  }

  // 2️⃣ Kalau ARRAY tapi isinya PECAHAN JSON
  if (Array.isArray(value)) {
    // contoh: ['["coba"', '"dulu"]']
    if (
      value.length > 0 &&
      typeof value[0] === "string" &&
      value.some(
        (v) => v.includes('["') || v.includes('"]') || v.includes('\\"')
      )
    ) {
      const joined = value.join(",");
      try {
        value = JSON.parse(joined);
      } catch {
        value = value.map((v) =>
          v
            .replace(/^\[\\"?/, "")
            .replace(/\\"?\]$/, "")
            .replace(/^"+|"+$/g, "")
            .trim()
        );
      }
    }
  }

  // 3️⃣ Pastikan ARRAY STRING BERSIH
  if (!Array.isArray(value)) value = [];

  value = value
    .map((v) =>
      typeof v === "string"
        ? v
            .replace(/^\[\\"?/, "")
            .replace(/\\"?\]$/, "")
            .replace(/^"+|"+$/g, "")
            .trim()
        : String(v)
    )
    .filter(Boolean);

  return JSON.stringify(value);
}

class TalentService {
  async getAll() {
    const talents = await Talent.getAll();

    // Get first image for each talent (for list view)
    for (const talent of talents) {
      const images = await Talent.getImages(talent.id);
      talent.image = images.length > 0 ? images[0].image_url : null;
      talent.category = talent.level; // Frontend uses 'category'
    }

    return talents;
  }

  async getById(id) {
    const talent = await Talent.findById(id);
    if (!talent) {
      throw new Error("Talent not found");
    }

    // Get all images with full details (including IDs for removal tracking)
    const images = await Talent.getImages(id);
    talent.images = images.map((img) => ({
      id: img.id,
      imageId: img.id, // Alias for compatibility
      image_url: img.image_url,
      url: img.image_url, // Alias for compatibility
      display_order: img.display_order,
    }));
    talent.category = talent.level; // Frontend uses 'category'

    return talent;
  }

  async create(talentData, imageFiles) {
    // Sanitize HTML description
    if (talentData.description) {
      talentData.description = sanitizeHTML(talentData.description);
    }

    // ✅ NORMALIZE CSV / API FIELDS
    if (talentData.languages !== undefined) {
      talentData.languages = normalizeLanguagesFinal(talentData.languages);
    }

    if (talentData.specialties !== undefined) {
      talentData.specialties = normalizeLanguagesFinal(talentData.specialties);
    }

    const talent = await Talent.create(talentData);

    // Process images
    if (imageFiles && imageFiles.length > 0) {
      const maxImages = Math.min(imageFiles.length, MAX_TALENT_IMAGES);

      for (let i = 0; i < maxImages; i++) {
        const file = imageFiles[i];
        const filename = generateSafeFilename(file.originalname);
        const outputPath = path.join(
          __dirname,
          "../../uploads/talents",
          filename
        );

        await processImage(file.buffer, outputPath, {
          width: 1920,
          height: 1920,
          quality: 90,
        });

        const imageUrl = `/uploads/talents/${filename}`;
        await Talent.addImage(talent.id, imageUrl, i + 1);
      }
    }

    return this.getById(talent.id);
  }

  async update(id, updateData, imageFiles) {
    const existingTalent = await Talent.findById(id);
    if (!existingTalent) {
      throw new Error("Talent not found");
    }

    // Sanitize HTML
    if (updateData.description) {
      updateData.description = sanitizeHTML(updateData.description);
    }

    // 🔥 FINAL NORMALIZATION (INI KUNCI)
    if ("languages" in updateData) {
      updateData.languages = normalizeToJsonArray(updateData.languages);
    }

    if ("specialties" in updateData) {
      updateData.specialties = normalizeToJsonArray(updateData.specialties);
    }

    // Handle removed images
    if (updateData.removedImageIds) {
      let removedImageIds = [];

      if (typeof updateData.removedImageIds === "string") {
        removedImageIds = updateData.removedImageIds
          .replace(/[^0-9,]/g, "")
          .split(",")
          .map((id) => parseInt(id, 10))
          .filter(Boolean);
      } else if (Array.isArray(updateData.removedImageIds)) {
        removedImageIds = updateData.removedImageIds
          .map((id) => parseInt(id, 10))
          .filter(Boolean);
      }

      for (const imageId of removedImageIds) {
        try {
          await this.deleteImage(id, imageId);
        } catch (err) {
          console.error(`Failed to delete image ${imageId}`, err.message);
        }
      }

      delete updateData.removedImageIds;
    }

    // 🚀 UPDATE DB (TANPA STRINGIFY LAGI)
    await Talent.update(id, updateData);

    // Handle new images
    if (imageFiles?.length) {
      const existingImages = await Talent.getImages(id);
      const currentCount = existingImages.length;
      const maxNewImages = MAX_TALENT_IMAGES - currentCount;

      for (let i = 0; i < Math.min(imageFiles.length, maxNewImages); i++) {
        const file = imageFiles[i];
        const filename = generateSafeFilename(file.originalname);
        const outputPath = path.join(
          __dirname,
          "../../uploads/talents",
          filename
        );

        await processImage(file.buffer, outputPath, {
          width: 1920,
          height: 1920,
          quality: 90,
        });

        await Talent.addImage(
          id,
          `/uploads/talents/${filename}`,
          currentCount + i + 1
        );
      }
    }

    return this.getById(id);
  }

  async delete(id) {
    const talent = await Talent.findById(id);
    if (!talent) {
      throw new Error("Talent not found");
    }

    // Delete all images
    const images = await Talent.getImages(id);
    for (const image of images) {
      const imagePath = path.join(__dirname, "../..", image.image_url);
      await deleteFile(imagePath);
    }

    await Talent.delete(id);
    return { message: "Talent deleted successfully" };
  }

  async deleteImage(talentId, imageId) {
    // Convert imageId to number for comparison
    const imageIdNum =
      typeof imageId === "string" ? parseInt(imageId, 10) : imageId;

    const images = await Talent.getImages(talentId);
    const image = images.find(
      (img) => img.id === imageIdNum || String(img.id) === String(imageId)
    );

    if (!image) {
      throw new Error(
        `Image not found with ID: ${imageId} (converted: ${imageIdNum})`
      );
    }

    // Delete file
    const imagePath = path.join(__dirname, "../..", image.image_url);
    await deleteFile(imagePath);

    // Delete from database (use the actual database ID)
    await Talent.deleteImage(image.id);
    return { message: "Image deleted successfully" };
  }
}

export default new TalentService();
