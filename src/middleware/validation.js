import Joi from "joi";

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req.body = value;
    next();
  };
};

// Validation schemas
export const schemas = {
  // User schemas
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().trim().lowercase().required(),
    phone: Joi.string()
      .trim()
      .pattern(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      )
      .required(),
    password: Joi.string().min(8).max(100).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().trim().lowercase().required(),
    password: Joi.string().required(),
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(100).required(),
  }),

  updateUserVvip: Joi.object({
    vvip: Joi.boolean().required(),
  }),

  // Product schemas
  createProduct: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    price: Joi.number().positive().precision(2).required(),
    description: Joi.string().trim().max(2000).allow("").optional(),
  }),

  updateProduct: Joi.object({
    name: Joi.string().trim().min(1).max(200).optional(),
    price: Joi.number().positive().precision(2).optional(),
    description: Joi.string().trim().max(2000).allow("").optional(),
  }),

  // Talent schemas
  createTalent: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    level: Joi.string().valid("Premium", "Elite", "VIP").required(),
    description: Joi.string().trim().required(),
    age: Joi.string().trim().max(50).optional(),
    location: Joi.string().trim().max(200).optional(),

    // Bisa array atau string
    languages: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().max(50)),
        Joi.string().trim() // string CSV, nanti di controller split(",")
      )
      .optional(),

    specialties: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().max(100)),
        Joi.string().trim() // string CSV
      )
      .optional(),
  }),

  updateTalent: Joi.object({
    name: Joi.string().trim().min(1).max(200).optional(),
    level: Joi.string().valid("Premium", "Elite", "VIP").optional(),
    description: Joi.string().trim().optional(),
    age: Joi.string().trim().max(50).optional(),
    location: Joi.string().trim().max(200).optional(),
    languages: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().max(50)),
        Joi.string().trim() // string CSV, nanti di controller split(",")
      )
      .optional(),

    specialties: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().trim().max(100)),
        Joi.string().trim() // string CSV
      )
      .optional(),
    removedImageIds: Joi.alternatives()
      .try(
        Joi.string(), // JSON string from FormData
        Joi.array().items(Joi.number().integer().positive())
      )
      .optional(),
  }),

  // Blog schemas
  createBlog: Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(500).required(),
    content: Joi.string().trim().required(),
  }),

  updateBlog: Joi.object({
    title: Joi.string().trim().min(1).max(200).optional(),
    description: Joi.string().trim().max(500).optional(),
    content: Joi.string().trim().optional(),
  }),

  // Home config schemas
  updateHomeConfig: Joi.object({
    featuredTalentIds: Joi.alternatives()
      .try(
        Joi.string(), // JSON string from FormData
        Joi.array().items(Joi.number().integer().positive()).length(4)
      )
      .required(),
    remainingDesktopImages: Joi.alternatives()
      .try(
        Joi.string(), // JSON string from FormData
        Joi.array().items(Joi.string())
      )
      .optional(),
    remainingMobileImages: Joi.alternatives()
      .try(
        Joi.string(), // JSON string from FormData
        Joi.array().items(Joi.string())
      )
      .optional(),
  }),
};
