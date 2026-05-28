import { useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, Image as ImageIcon, X, Sparkles, Brain, FileType2 } from "lucide-react";
import { notesService, type Note } from "@/services/notesService";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notes")({ component: NotesUpload });

function NotesUpload() {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: notesService.list,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => notesService.upload(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("File uploaded successfully");
    },
    onError: () => toast.error("Upload failed. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: notesService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      toast.success("File deleted");
    },
    onError: () => toast.error("Failed to delete file"),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => uploadMutation.mutate(f));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload notes</h1>
        <p className="text-sm text-muted-foreground">Drop PDFs, docs or text files. Your AI organizes everything automatically.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        animate={{ scale: drag ? 1.01 : 1 }}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-10 text-center transition-colors ${
          drag ? "border-primary bg-primary/5" : "border-border bg-card/40"
        }`}
      >
        <motion.div
          animate={{ y: drag ? -4 : 0 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-bg shadow-xl shadow-primary/30"
        >
          <UploadCloud className="h-7 w-7 text-white" />
        </motion.div>
        <h3 className="mt-4 text-lg font-semibold">Drag & drop your files here</h3>
        <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX, DOC, TXT — up to 50MB each</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-bg px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-60"
        >
          {uploadMutation.isPending ? "Uploading…" : "Browse files"}
        </button>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_60%)] opacity-50" />
      </motion.div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Your files</h2>
          <span className="text-xs text-muted-foreground">{notes.length} files</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl skeleton-shimmer" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
            No files yet. Upload your first note above!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {notes.map((f) => (
                <NoteCard
                  key={f.id}
                  note={f}
                  onDelete={() => deleteMutation.mutate(f.id)}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onDelete, deleting }: { note: Note; onDelete: () => void; deleting: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group relative overflow-hidden rounded-2xl glass p-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl gradient-bg text-white shadow-lg shadow-primary/30">
          {note.fileType === "pdf" ? <FileText className="h-5 w-5" /> : note.fileType === "img" ? <ImageIcon className="h-5 w-5" /> : <FileType2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{note.title}</p>
          <p className="text-xs text-muted-foreground">{note.size}</p>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full w-full gradient-bg" />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Ready</span>
        <span>100%</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          to="/app/summary"
          state={{ noteId: note.id } as Record<string, unknown>}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg gradient-bg px-3 py-1.5 text-xs font-medium text-white"
        >
          <Sparkles className="h-3.5 w-3.5" /> Summary
        </Link>
        <Link
          to="/app/quiz"
          state={{ noteId: note.id } as Record<string, unknown>}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg glass px-3 py-1.5 text-xs font-medium"
        >
          <Brain className="h-3.5 w-3.5" /> Quiz
        </Link>
      </div>
    </motion.div>
  );
}
