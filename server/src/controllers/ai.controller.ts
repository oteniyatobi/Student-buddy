import { Response } from "express";
import { ollama, MODEL } from "../config/ollama.js";
import { prisma } from "../config/db.js";
import { AuthRequest, SummaryData, ChatMessageInput, QuizQuestion } from "../types/index.js";

const SYSTEM_TUTOR =
  "You are an expert AI study tutor for university students. Be clear, concise, and educational. Use analogies where helpful.";

const parseJson = <T>(text: string): T => {
  const match = text.match(/\{[\s\S]*\}/);
  return JSON.parse(match?.[0] ?? text) as T;
};

const parseStoredJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const serializeSummary = (summary: { keyPoints: string }) => ({
  ...summary,
  keyPoints: parseStoredJson<string[]>(summary.keyPoints, []),
});

const serializeQuiz = (quiz: { questions: string }) => ({
  ...quiz,
  questions: parseStoredJson<QuizQuestion[]>(quiz.questions, []),
});

const getMessageText = (message: any): string => {
  const content = message?.content;
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (item && typeof item.text === "string" ? item.text : ""))
      .join("");
  }
  return "";
};

export const summarize = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const note = await prisma.note.findFirst({
      where: { id: noteId as string, userId: req.user!.userId },
    });
    if (!note) { res.status(404).json({ message: "Note not found" }); return; }
    if (!note.content) { res.status(400).json({ message: "Note has no content" }); return; }

    const existing = await prisma.summary.findFirst({
      where: { noteId: noteId as string, userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    if (existing) { res.json({ summary: serializeSummary(existing) }); return; }

    const completion = await ollama.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_TUTOR },
        {
          role: "user",
          content: `Analyze this study material and return ONLY valid JSON with these fields:
- "shortText": a 2-3 sentence overview
- "detailedText": a 2-paragraph detailed explanation
- "keyPoints": an array of exactly 6 key points as strings

Content:
${note.content.slice(0, 6000)}`,
        },
      ],
    });

    const text = getMessageText(completion.choices[0].message);
    const data = parseJson<SummaryData>(text);

    const summary = await prisma.summary.create({
      data: {
        noteId: noteId as string,
        userId: req.user!.userId,
        shortText: data.shortText,
        detailedText: data.detailedText,
        keyPoints: JSON.stringify(data.keyPoints),
      },
    });

    res.json({ summary: serializeSummary(summary) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate summary — is Ollama running?" });
  }
};

export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { noteId } = req.params;
    const count = Math.min(Number(req.body.count) || 5, 10);

    let contentSource = "";
    let title = "Quiz";
    let noteRef: string | undefined;

    if (noteId) {
      const note = await prisma.note.findFirst({
        where: { id: noteId as string, userId: req.user!.userId },
      });
      if (!note) { res.status(404).json({ message: "Note not found" }); return; }
      contentSource = note.content || "";
      title = `Quiz: ${note.title}`;
      noteRef = noteId as string;
    } else if (req.body.topic) {
      contentSource = req.body.topic;
      title = `Quiz: ${req.body.topic}`;
    }

    if (!contentSource) { res.status(400).json({ message: "Provide a noteId or topic" }); return; }

    const isNoteBased = !!noteRef;
    const systemPrompt = isNoteBased
      ? "You are a quiz generator. You ONLY create questions based on the exact text provided. Never use outside knowledge. Every question must come directly from the provided text."
      : "You are a quiz generator. Create accurate multiple-choice questions about the given topic.";

    const userPrompt = isNoteBased
      ? `Read the following text carefully. Create exactly ${count} multiple-choice questions using ONLY information found in this text. Do not add anything from outside this text.

TEXT:
"""
${contentSource.slice(0, 6000)}
"""

Return ONLY a JSON object in this exact format, no explanation:
{"questions":[{"q":"question text","options":["A","B","C","D"],"a":0}]}`
      : `Create exactly ${count} multiple-choice questions about: ${contentSource}

Return ONLY a JSON object in this exact format, no explanation:
{"questions":[{"q":"question text","options":["A","B","C","D"],"a":0}]}`;

    const completion = await ollama.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = getMessageText(completion.choices[0].message);
    const data = parseJson<{ questions: QuizQuestion[] }>(text);

    const quiz = await prisma.quiz.create({
      data: {
        userId: req.user!.userId,
        noteId: noteRef ?? null,
        title,
        questions: JSON.stringify(data.questions),
      },
    });

    res.status(201).json({ quiz: serializeQuiz(quiz) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate quiz — is Ollama running?" });
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

    const completion = await ollama.chat.completions.create({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_TUTOR }, ...history],
    });

    const reply = getMessageText(completion.choices[0].message);

    await prisma.chatMessage.createMany({
      data: [
        { userId: req.user!.userId, role: "user", content: messages[messages.length - 1].content },
        { userId: req.user!.userId, role: "assistant", content: reply },
      ],
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get AI response — is Ollama running?" });
  }
};

export const explain = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { concept } = req.body;
    if (!concept) { res.status(400).json({ message: "Concept is required" }); return; }

    const completion = await ollama.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_TUTOR },
        {
          role: "user",
          content: `Explain "${concept}" in simple terms a university student can understand. Include: a one-sentence definition, a real-world analogy, and a quick example. Keep it under 150 words.`,
        },
      ],
    });

    const explanation = getMessageText(completion.choices[0].message);
    res.json({ explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to explain concept — is Ollama running?" });
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
