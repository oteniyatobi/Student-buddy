import { Response } from "express";
import { prisma } from "../config/db.js";
import { AuthRequest } from "../types/index.js";

const XP_PER_CORRECT = 20;

export const listQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { attempts: true } },
        note: { select: { title: true } },
      },
    });
    res.json({ quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quizzes" });
  }
};

export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { attempts: { orderBy: { completedAt: "desc" }, take: 5 } },
    });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

export const saveAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score, total } = req.body;
    const quiz = await prisma.quiz.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    const attempt = await prisma.quizAttempt.create({
      data: { quizId: quiz.id, userId: req.user!.userId, score, total },
    });

    const xpEarned = score * XP_PER_CORRECT;
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { xp: { increment: xpEarned } },
    });

    res.status(201).json({ attempt, xpEarned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save attempt" });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    await prisma.quiz.delete({ where: { id: quiz.id } });
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete quiz" });
  }
};
