import pool from '../config/database.js';

class HomeConfig {
  static async get() {
    const [rows] = await pool.execute(
      `SELECT * FROM home_config WHERE id = 1`
    );
    return rows[0] || null;
  }

  static async createOrUpdate(configData) {
    const { featured_talent_ids, carousel_desktop_images, carousel_mobile_images } = configData;
    
    const featuredIdsJson = featured_talent_ids ? JSON.stringify(featured_talent_ids) : null;
    const desktopImagesJson = carousel_desktop_images ? JSON.stringify(carousel_desktop_images) : null;
    const mobileImagesJson = carousel_mobile_images ? JSON.stringify(carousel_mobile_images) : null;

    // Check if config exists
    const existing = await this.get();
    
    if (existing) {
      await pool.execute(
        `UPDATE home_config 
         SET featured_talent_ids = ?, carousel_desktop_images = ?, carousel_mobile_images = ?, updated_at = NOW()
         WHERE id = 1`,
        [featuredIdsJson, desktopImagesJson, mobileImagesJson]
      );
    } else {
      await pool.execute(
        `INSERT INTO home_config (id, featured_talent_ids, carousel_desktop_images, carousel_mobile_images, created_at, updated_at)
         VALUES (1, ?, ?, ?, NOW(), NOW())`,
        [featuredIdsJson, desktopImagesJson, mobileImagesJson]
      );
    }

    return this.get();
  }

  static async getFormatted() {
    const config = await this.get();
    if (!config) {
      return {
        featuredTalents: [],
        carouselDesktopImages: [],
        carouselMobileImages: []
      };
    }

    // Helper function to safely parse JSON
    const safeParseJSON = (value, defaultValue = []) => {
      if (!value) return defaultValue;
      
      // If already an array/object, return as is
      if (typeof value === 'object') {
        return value;
      }
      
      // If it's a string, try to parse it
      if (typeof value === 'string') {
        // Trim whitespace
        const trimmed = value.trim();
        
        // If empty after trim, return default
        if (!trimmed) return defaultValue;
        
        try {
          const parsed = JSON.parse(trimmed);
          return parsed;
        } catch (error) {
          console.error('Error parsing JSON in getFormatted:', {
            error: error.message,
            valueType: typeof value,
            valueLength: value.length,
            valuePreview: value.substring(0, 100),
            position: error.message.match(/position (\d+)/)?.[1]
          });
          // Return default instead of throwing
          return defaultValue;
        }
      }
      
      return defaultValue;
    };

    return {
      featuredTalents: safeParseJSON(config.featured_talent_ids, []),
      carouselDesktopImages: safeParseJSON(config.carousel_desktop_images, []),
      carouselMobileImages: safeParseJSON(config.carousel_mobile_images, [])
    };
  }
}

export default HomeConfig;

