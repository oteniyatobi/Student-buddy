import { Response } from "express";
import { anthropic } from "../config/anthropic.js";
import { prisma } from "../config/db.js";
import { AuthRequest, SummaryData, ChatMessageInput, QuizQuestion } from "../types/index.js";

const SYSTEM_TUTOR =
  "You are an expert AI study tutor for university students. Be clear, concise, and educational. Use analogies where helpful.";

const parseJson = <T>(text: string): T => {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match?.[0] ?? text) as T;
};

export const summarize = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: req.user!.userId },
    });
    if (!note) { res.status(404).json({ message: "Note not found" }); return; }
    if (!note.content) { res.status(400).json({ message: "Note has no extractable text content" }); return; }

    const existing = await prisma.summary.findFirst({
      where: { noteId, userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    if (existing) { res.json({ summary: existing }); return; }

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 1024,
      system: SYSTEM_TUTOR,
      messages: [
        {
          role: "user",
          content: `Analyze this study material and return ONLY valid JSON with these fields:
- "shortText": a 2-3 sentence overview
- "detailedText": a 2-paragraph detailed explanation
- "keyPoints": an array of exactly 6 key points as strings

Content:
${note.content.slice(0, 8000)}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const data = parseJson<SummaryData>(text);

    const summary = await prisma.summary.create({
      data: {
        noteId,
        userId: req.user!.userId,
        shortText: data.shortText,
        detailedText: data.detailedText,
        keyPoints: data.keyPoints,
      },
    });

    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate summary" });
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const count = Math.min(Number(req.body.count) || 5, 15);

    let contentSource = "";
    let title = "Mixed Subjects Quiz";
    let noteRef: string | undefined;

    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId: req.user!.userId },
      });
      if (!note) { res.status(404).json({ message: "Note not found" }); return; }
      contentSource = note.content || "";
      title = `Quiz: ${note.title}`;
      noteRef = noteId;
    } else if (req.body.topic) {
      contentSource = `Topic: ${req.body.topic}`;
      title = `Quiz: ${req.body.topic}`;
    }

    if (!contentSource) { res.status(400).json({ message: "Provide a noteId or topic" }); return; }

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2048,
      system: SYSTEM_TUTOR,
      messages: [
        {
          role: "user",
          content: `Generate exactly ${count} multiple-choice questions from this material. Return ONLY valid JSON with a "questions" array. Each item must have: "q" (question string), "options" (array of 4 strings), "a" (index 0-3 of the correct answer).

Material:
${contentSource.slice(0, 8000)}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const data = parseJson<{ questions: QuizQuestion[] }>(text);

    const quiz = await prisma.quiz.create({
      data: {
        userId: req.user!.userId,
        noteId: noteRef ?? null,
        title,
        questions: data.questions as object[],
      },
    });

    res.status(201).json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { messages } = req.body as { messages: ChatMessageInput[] };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: "Messages array is required" });
      return;
    }

    const history = messages.slice(-20).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 800,
      system: SYSTEM_TUTOR,
      messages: history,
    });

    const reply = message.content[0].type === "text" ? message.content[0].text : "";

    await prisma.chatMessage.createMany({
      data: [
        { userId: req.user!.userId, role: "user", content: messages[messages.length - 1].content },
        { userId: req.user!.userId, role: "assistant", content: reply },
      ],
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get AI response" });
  }
};

export const explain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { concept } = req.body;
    if (!concept) { res.status(400).json({ message: "Concept is required" }); return; }

    const message = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 300,
      system: SYSTEM_TUTOR,
      messages: [
        {
          role: "user",
          content: `Explain "${concept}" in simple terms a university student can understand. Include: a one-sentence definition, a real-world analogy, and a quick example. Keep it under 150 words.`,
        },
      ],
    });

    const explanation = message.content[0].type === "text" ? message.content[0].text : "";
    res.json({ explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to explain concept" });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chat history" });
  }
};

export const clearChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.chatMessage.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ message: "Chat history cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to clear chat history" });
  }
};
