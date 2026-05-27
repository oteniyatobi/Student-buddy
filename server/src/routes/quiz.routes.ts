import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { listQuizzes, getQuizById, saveAttempt, deleteQuiz } from "../controllers/quiz.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listQuizzes);
router.get("/:id", getQuizById);
router.post("/:id/attempt", saveAttempt);
router.delete("/:id", deleteQuiz);

export default router;
