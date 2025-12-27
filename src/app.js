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
   CORS (FINAL & BENAR)
========================= */
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://velvettaspa.com",
        "https://www.velvettaspa.com",
        "https://cms.velvettaspa.com",
        "https://www.cms.velvettaspa.com",
      ]
    : ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin(origin, callback) {
      // allow curl / SSR / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ BLOCKED BY CORS:", origin);
      return callback(null, false); // ⬅️ JANGAN throw Error
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.options("*", cors());

/* =========================
   SECURITY
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
   ERROR HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

export default app;
