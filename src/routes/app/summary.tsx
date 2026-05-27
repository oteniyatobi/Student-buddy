import { useEffect, useState } from "react";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Download, Sparkles, Check, ChevronDown, FileText } from "lucide-react";
import { aiService, type Summary } from "@/services/aiService";
import { notesService } from "@/services/notesService";
import { toast } from "sonner";

export const Route = createFileRoute("/app/summary")({ component: Summary });

const TABS = ["Short Summary", "Detailed Summary", "Key Points"] as const;

function Summary() {
  const location = useLocation();
  const noteId = (location.state as { noteId?: string } | null)?.noteId;

  const [tab, setTab] = useState<(typeof TABS)[number]>("Short Summary");
  const [copied, setCopied] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(noteId);

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: notesService.list,
  });

  const { data: summaryData, isLoading, error } = useQuery({
    queryKey: ["summary", selectedNoteId],
    queryFn: () => aiService.summarize(selectedNoteId!),
    enabled: !!selectedNoteId,
    staleTime: Infinity,
  });

  const keyPoints: string[] = summaryData
    ? Array.isArray(summaryData.keyPoints)
      ? (summaryData.keyPoints as string[])
      : []
    : [];

  const content =
    tab === "Short Summary"
      ? summaryData?.shortText ?? ""
      : tab === "Detailed Summary"
      ? summaryData?.detailedText ?? ""
      : "";

  const currentNote = notes.find((n) => n.id === selectedNoteId);

  const handleCopy = () => {
    navigator.clipboard?.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleDownload = () => {
    if (!content && keyPoints.length === 0) return;
    const text =
      tab === "Key Points"
        ? keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")
        : content;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `summary-${tab.toLowerCase().replace(/ /g, "-")}.txt`;
    a.click();
  };

  if (notes.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">No notes yet</h2>
        <p className="text-sm text-muted-foreground">Upload a note first to generate an AI summary.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-0.5 text-[11px] text-primary">
            <Sparkles className="h-3 w-3" /> AI Generated
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {currentNote ? currentNote.title : "AI Summary"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentNote ? `From "${currentNote.filename}"` : "Select a note to generate a summary"}
          </p>
        </div>
        <div className="flex gap-2">
          {notes.length > 0 && (
            <select
              value={selectedNoteId ?? ""}
              onChange={(e) => setSelectedNoteId(e.target.value || undefined)}
              className="rounded-xl border border-border bg-card/50 px-3 py-2 text-xs outline-none focus:border-primary"
            >
              <option value="">Select a note…</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          )}
          <button
            onClick={handleCopy}
            disabled={!content}
            className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-2 text-xs hover:bg-accent/40 disabled:opacity-40"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!summaryData}
            className="inline-flex items-center gap-1.5 rounded-xl gradient-bg px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="inline-flex flex-wrap gap-1 rounded-2xl glass p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-xl px-3 py-1.5 text-sm transition-colors ${tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab === t && (
              <motion.span
                layoutId="sum-pill"
                className="absolute inset-0 rounded-xl gradient-bg"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>

      {!selectedNoteId ? (
        <div className="rounded-2xl glass p-10 text-center text-sm text-muted-foreground">
          Select a note above to generate an AI summary.
        </div>
      ) : (
        <div className="rounded-2xl glass p-6 md:p-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-3.5 skeleton-shimmer rounded-md" style={{ width: `${95 - i * 8}%` }} />
                ))}
                <p className="mt-4 text-center text-xs text-muted-foreground">Generating AI summary…</p>
              </motion.div>
            ) : error ? (
              <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-rose-400">
                Failed to generate summary. Please try again.
              </motion.p>
            ) : tab === "Key Points" ? (
              <motion.ul key="kp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {keyPoints.map((p, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="overflow-hidden rounded-xl border border-border/50 bg-card/40"
                  >
                    <button
                      onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-accent/40"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-md gradient-bg text-[11px] font-semibold text-white">{i + 1}</span>
                        {p}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openIdx === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-border/40 px-4 py-3 text-xs text-muted-foreground"
                        >
                          {p}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.p key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm leading-relaxed md:text-base">
                {content.split(" ").map((w, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.01, duration: 0.15 }}
                  >
                    {w}{" "}
                  </motion.span>
                ))}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
