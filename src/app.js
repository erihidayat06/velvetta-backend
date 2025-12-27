import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import { helmetMiddleware, apiLimiter } from "./middleware/security.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import talentRoutes from "./routes/talentRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import homeConfigRoutes from "./routes/homeConfigRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =========================
   STATIC FILES
========================= */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =========================
   SECURITY
========================= */
app.use(helmetMiddleware);
app.use(apiLimiter);

/* =========================
   CORS (DEVELOPMENT + PRODUCTION)
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://velvettaspa.com",
  "https://www.velvettaspa.com",
  "https://cms.velvettaspa.com",
  "https://www.cms.velvettaspa.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests like Postman, curl, SSR
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  optionsSuccessStatus: 204, // untuk preflight legacy browser
};

// // gunakan middleware CORS
// app.use(cors(corsOptions));

// // handle preflight OPTIONS secara global
// app.options("*", cors(corsOptions));

/* =========================
   ROUTES
========================= */
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/talents", talentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/home-config", homeConfigRoutes);

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.message);

  // handle error CORS agar tidak crash
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
