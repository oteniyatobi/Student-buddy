import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  summarize,
  generateQuiz,
  chat,
  explain,
  getChatHistory,
  clearChatHistory,
} from "../controllers/ai.controller.js";

const router = Router();

router.use(authenticate);

router.post("/summarize/:noteId", summarize);
router.post("/quiz/:noteId?", generateQuiz);
router.post("/chat", chat);
router.post("/explain", explain);
router.get("/chat/history", getChatHistory);
router.delete("/chat/history", clearChatHistory);

export default router;
