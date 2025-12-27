import talentService from "../services/talentService.js";

class TalentController {
  async getAll(req, res) {
    try {
      const talents = await talentService.getAll();
      res.json({
        success: true,
        data: talents,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const talent = await talentService.getById(req.params.id);
      res.json({
        success: true,
        data: talent,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const data = { ...req.body };

      // Helper function untuk konversi string ke array (sama seperti update)
      const parseToArray = (value) => {
        if (Array.isArray(value)) return value;
        if (!value) return [];
        if (typeof value === "string") {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {
            // Jika gagal parse JSON, anggap CSV
            return value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0);
          }
        }
        return [];
      };

      data.languages = parseToArray(data.languages);
      data.specialties = parseToArray(data.specialties);

      // Log untuk debugging
      console.log("Talent create request:", {
        bodyKeys: Object.keys(data),
        languages: data.languages,
        specialties: data.specialties,
        filesCount: req.files?.length || 0,
      });

      const talent = await talentService.create(data, req.files);

      res.status(201).json({
        success: true,
        message: "Talent created successfully",
        data: talent,
      });
    } catch (error) {
      console.error("Talent create error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const data = { ...req.body };

      // Helper function untuk konversi string ke array
      const parseToArray = (value) => {
        if (Array.isArray(value)) return value;
        if (!value) return [];
        if (typeof value === "string") {
          try {
            // coba parse JSON
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) return parsed;
          } catch (e) {
            // jika gagal, anggap CSV
            return value
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v.length > 0);
          }
        }
        return [];
      };

      data.languages = parseToArray(data.languages);
      data.specialties = parseToArray(data.specialties);

      // Log untuk debugging
      console.log("Talent update request:", {
        talentId: req.params.id,
        bodyKeys: Object.keys(data),
        hasRemovedImageIds: !!data.removedImageIds,
        removedImageIds: data.removedImageIds,
        removedImageIdsType: typeof data.removedImageIds,
        filesCount: req.files?.length || 0,
      });

      const talent = await talentService.update(req.params.id, data, req.files);

      res.json({
        success: true,
        message: "Talent updated successfully",
        data: talent,
      });
    } catch (error) {
      console.error("Talent update error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      await talentService.delete(req.params.id);
      res.json({
        success: true,
        message: "Talent deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteImage(req, res) {
    try {
      await talentService.deleteImage(req.params.talentId, req.params.imageId);
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new TalentController();
