import talentService from '../services/talentService.js';

class TalentController {
  async getAll(req, res) {
    try {
      const talents = await talentService.getAll();
      res.json({
        success: true,
        data: talents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const talent = await talentService.getById(req.params.id);
      res.json({
        success: true,
        data: talent
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const talent = await talentService.create(req.body, req.files);
      res.status(201).json({
        success: true,
        message: 'Talent created successfully',
        data: talent
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      // Parse JSON strings from FormData (similar to homeConfig)
      if (req.body.languages && typeof req.body.languages === 'string') {
        try {
          req.body.languages = JSON.parse(req.body.languages);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          req.body.languages = req.body.languages.split(',').map(l => l.trim()).filter(l => l.length > 0);
        }
      }
      
      if (req.body.specialties && typeof req.body.specialties === 'string') {
        try {
          req.body.specialties = JSON.parse(req.body.specialties);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          req.body.specialties = req.body.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
      }
      
      // Log incoming data for debugging
      console.log('Talent update request:', {
        talentId: req.params.id,
        bodyKeys: Object.keys(req.body),
        hasRemovedImageIds: !!req.body.removedImageIds,
        removedImageIds: req.body.removedImageIds,
        removedImageIdsType: typeof req.body.removedImageIds,
        filesCount: req.files?.length || 0
      });
      
      const talent = await talentService.update(req.params.id, req.body, req.files);
      res.json({
        success: true,
        message: 'Talent updated successfully',
        data: talent
      });
    } catch (error) {
      console.error('Talent update error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await talentService.delete(req.params.id);
      res.json({
        success: true,
        message: 'Talent deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteImage(req, res) {
    try {
      await talentService.deleteImage(req.params.talentId, req.params.imageId);
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new TalentController();

