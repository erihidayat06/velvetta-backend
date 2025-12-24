export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

export const TALENT_LEVELS = {
  PREMIUM: 'Premium',
  ELITE: 'Elite',
  VIP: 'VIP'
};

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB

export const MAX_TALENT_IMAGES = 30;

export const FEATURED_TALENTS_COUNT = 4;

