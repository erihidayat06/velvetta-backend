import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

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
   CORS (DEV + PROD)
========================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

/* =========================
   SECURITY (FIRST)
========================= */
app.use(helmetMiddleware);
app.use(apiLimiter);

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
