import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "../config/constants.js";
import { generateSafeFilename } from "../utils/imageProcessor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`
      ),
      false
    );
  }
};

// Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

// Single file upload middleware
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    console.log("Multer upload middleware - fieldName:", fieldName);
    console.log("Request headers:", {
      "content-type": req.headers["content-type"],
      "content-length": req.headers["content-length"],
    });

    const uploadMiddleware = upload.single(fieldName);
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return next(err);
      }

      console.log(
        "Multer processed - file:",
        req.file
          ? {
              fieldname: req.file.fieldname,
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
            }
          : "No file"
      );
      console.log("Multer processed - body:", req.body);

      next();
    });
  };
};

// Multiple files upload middleware
export const uploadMultiple = () => {
  return upload.any();
};

// Error handler
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File size exceeds maximum limit of ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: `Maximum ${req.body.maxCount || 10} files allowed`,
      });
    }
  }

  if (err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};
