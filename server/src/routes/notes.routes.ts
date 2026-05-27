import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { uploadNote, listNotes, getNoteById, deleteNote, createNoteFromText } from "../controllers/notes.controller.js";

const router = Router();

router.use(authenticate);

router.post("/upload", upload.single("file"), uploadNote);
router.post("/text", createNoteFromText);
router.get("/", listNotes);
router.get("/:id", getNoteById);
router.delete("/:id", deleteNote);

export default router;
