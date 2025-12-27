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
  origin(origin, callback) {
    if (!origin) return callback(null, true); // SSR, Postman, curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // otomatis handle preflight

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
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
