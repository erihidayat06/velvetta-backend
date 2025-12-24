import homeConfigService from '../services/homeConfigService.js';

class HomeConfigController {
  async get(req, res) {
    try {
      const config = await homeConfigService.get();
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error getting home config:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get home configuration',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async update(req, res) {
    try {
      const desktopFiles = req.files?.desktopImages || [];
      const mobileFiles = req.files?.mobileImages || [];
      
      // Parse featuredTalentIds if it's a string
      if (req.body.featuredTalentIds && typeof req.body.featuredTalentIds === 'string') {
        try {
          req.body.featuredTalentIds = JSON.parse(req.body.featuredTalentIds);
        } catch (e) {
          // If parsing fails, treat as comma-separated string
          req.body.featuredTalentIds = req.body.featuredTalentIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        }
      }
      
      // Parse remaining images if they're strings (from FormData)
      if (req.body.remainingDesktopImages && typeof req.body.remainingDesktopImages === 'string') {
        try {
          req.body.remainingDesktopImages = JSON.parse(req.body.remainingDesktopImages);
        } catch (e) {
          req.body.remainingDesktopImages = [];
        }
      }
      
      if (req.body.remainingMobileImages && typeof req.body.remainingMobileImages === 'string') {
        try {
          req.body.remainingMobileImages = JSON.parse(req.body.remainingMobileImages);
        } catch (e) {
          req.body.remainingMobileImages = [];
        }
      }
      
      const config = await homeConfigService.update(
        req.body,
        desktopFiles,
        mobileFiles
      );
      
      res.json({
        success: true,
        message: 'Home configuration updated successfully',
        data: config
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new HomeConfigController();

