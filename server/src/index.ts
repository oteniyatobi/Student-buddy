import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import plannerRoutes from "./routes/planner.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: "Too many AI requests, please wait a moment." },
});
app.use("/api/ai/", aiLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Smart Study server running on http://localhost:${PORT}`);
});
