import { Response } from "express";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/db.js";
import { AuthRequest } from "../types/index.js";
import { getRouteParam } from "../utils/request.js";

const extractText = async (filePath: string, mimetype: string): Promise<string> => {
  try {
    if (mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text.trim();
    }
    if (
      mimetype === "application/msword" ||
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    }
    if (mimetype === "text/plain") {
      return fs.readFileSync(filePath, "utf-8").trim();
    }
  } catch (e) {
    console.warn("Text extraction failed:", e);
  }
  return "";
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileKind = (mimetype: string): string => {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("image/")) return "img";
  return "doc";
};

export const uploadNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const content = await extractText(file.path, file.mimetype);

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "smart-study/notes",
      resource_type: "raw",
      use_filename: true,
    });

    fs.unlinkSync(file.path);

    const note = await prisma.note.create({
      data: {
        userId: req.user!.userId,
        title: req.body.title || path.parse(file.originalname).name,
        filename: file.originalname,
        fileUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        fileType: getFileKind(file.mimetype),
        content,
        size: formatSize(file.size),
      },
    });

    res.status(201).json({ note });
  } catch (err) {
    if (file?.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    console.error(err);
    res.status(500).json({ message: "File upload failed" });
  }
};

export const listNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, filename: true, fileUrl: true, fileType: true, size: true, createdAt: true },
    });
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

export const getNoteById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const noteId = getRouteParam(req.params.id, res, "note id");
    if (!noteId) return;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: req.user!.userId },
    });
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }
    res.json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch note" });
  }
};

export const createNoteFromText = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body as { title?: string; content: string };
    if (!content?.trim()) {
      res.status(400).json({ message: "Content is required" });
      return;
    }
    const noteTitle =
      title?.trim() ||
      `Lecture — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;

    const note = await prisma.note.create({
      data: {
        userId: req.user!.userId,
        title: noteTitle,
        filename: `${noteTitle}.txt`,
        fileUrl: "",
        fileType: "doc",
        content: content.trim(),
        size: `${(new TextEncoder().encode(content).byteLength / 1024).toFixed(1)} KB`,
      },
    });
    res.status(201).json({ note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save note" });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const noteId = getRouteParam(req.params.id, res, "note id");
    if (!noteId) return;

    const note = await prisma.note.findFirst({
      where: { id: noteId, userId: req.user!.userId },
    });
    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.publicId) {
      await cloudinary.uploader.destroy(note.publicId, { resource_type: "raw" }).catch(() => {});
    }

    await prisma.note.delete({ where: { id: note.id } });
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete note" });
  }
};
