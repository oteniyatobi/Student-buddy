import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Square, Sparkles, Brain, Copy, Check,
  FileText, Clock, ChevronRight, AlertCircle,
} from "lucide-react";
import { notesService } from "@/services/notesService";
import { toast } from "sonner";

export const Route = createFileRoute("/app/record")({ component: RecordClass });

type Phase = "idle" | "recording" | "saving" | "done";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function RecordClass() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState("");
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array(32).fill(0));
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalTextRef = useRef("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => stopAll();
  }, []);

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    recognitionRef.current?.stop();
  };

  const animateLevels = (analyser: AnalyserNode) => {
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const bars = Array.from({ length: 32 }, (_, i) => {
        const idx = Math.floor((i / 32) * data.length);
        return data[idx] / 255;
      });
      setLevels(bars);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  };

  const startRecording = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition is not supported in this browser. Try Chrome or Edge."); return; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      src.connect(analyser);
      analyserRef.current = analyser;

      const recognition = new SR();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
      finalTextRef.current = "";

      recognition.onresult = (event) => {
        let interim = "";
        let newFinal = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinal += t + " ";
          } else {
            interim += t;
          }
        }
        if (newFinal) {
          finalTextRef.current += newFinal;
          setFinalText(finalTextRef.current);
        }
        setInterimText(interim);
      };

      recognition.onerror = (e) => {
        if (e.error !== "no-speech" && e.error !== "aborted") {
          toast.error(`Recognition error: ${e.error}`);
        }
      };

      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          try { recognition.start(); } catch {}
        }
      };

      recognition.start();
      setPhase("recording");
      setFinalText("");
      setInterimText("");
      setElapsed(0);
      finalTextRef.current = "";

      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
      animateLevels(analyser);
    } catch {
      toast.error("Microphone access denied. Please allow microphone in your browser.");
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setLevels(Array(32).fill(0));
    setInterimText("");
    setPhase("saving");

    const transcript = finalTextRef.current.trim();
    if (!transcript) {
      toast.error("No speech detected. Please try again and speak clearly.");
      setPhase("idle");
      return;
    }

    try {
      const lectureTitle =
        title.trim() ||
        `Lecture — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

      const note = await notesService.createFromText(transcript, lectureTitle);
      setSavedNoteId(note.id);
      setPhase("done");
      toast.success("Recording transcribed and saved as a note!");
    } catch {
      toast.error("Failed to save note — the backend may not be running.");
      setSavedNoteId(null);
      setPhase("done");
    }
  };

  const handleCopy = () => {
    const text = finalTextRef.current.trim() || finalText;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const reset = () => {
    setPhase("idle");
    setElapsed(0);
    setFinalText("");
    setInterimText("");
    setSavedNoteId(null);
    setLevels(Array(32).fill(0));
    finalTextRef.current = "";
  };

  const transcription = finalText;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Record a Class</h1>
        <p className="text-sm text-muted-foreground">
          Hit record, attend your lecture — your speech is transcribed live, then saved as a note instantly.
        </p>
      </div>

      {!supported && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>Speech recognition requires Chrome or Edge. Safari and Firefox do not support this feature.</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl glass p-8 text-center space-y-6">
              <div className="mx-auto relative grid h-28 w-28 place-items-center rounded-full gradient-bg shadow-xl shadow-primary/40">
                <Mic className="h-12 w-12 text-white" />
                <div className="absolute inset-0 rounded-full gradient-bg opacity-30 animate-ping" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Ready to record</h2>
                <p className="text-sm text-muted-foreground">Your speech is transcribed live in real-time — no uploads, no API key required.</p>
              </div>

              <label className="block text-left">
                <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Lecture title (optional)</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g. Calculus II — ${new Date().toLocaleDateString("en-GB", { weekday: "long" })}`}
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                />
              </label>

              <button
                onClick={startRecording}
                disabled={!supported}
                className="inline-flex items-center gap-2 rounded-xl gradient-bg px-6 py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Mic className="h-4 w-4" /> Start Recording
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
              {[
                { icon: Mic, label: "Record audio in class" },
                { icon: Sparkles, label: "Transcribed live in browser" },
                { icon: FileText, label: "Saved as a note automatically" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl glass p-4 space-y-2">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl gradient-bg">
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                  <p>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="rounded-3xl glass p-8 text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" /> Recording
              </div>

              <div className="text-5xl font-bold tabular-nums gradient-text">
                {formatTime(elapsed)}
              </div>

              <div className="flex h-20 items-center justify-center gap-[3px]">
                {levels.map((lvl, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: `${Math.max(4, lvl * 72)}px` }}
                    transition={{ duration: 0.05 }}
                    className="w-1.5 rounded-full gradient-bg origin-center"
                  />
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                {title || "Recording in progress…"} — speak clearly near your device
              </p>

              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600"
              >
                <Square className="h-4 w-4 fill-current" /> Stop & Save
              </button>
            </div>

            {(finalText || interimText) && (
              <div className="rounded-2xl glass p-5 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2">Live transcript</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {finalText}
                  <span className="text-muted-foreground/60">{interimText}</span>
                </p>
              </div>
            )}
          </motion.div>
        )}

        {phase === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-3xl glass p-12 text-center space-y-5"
          >
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full gradient-bg shadow-xl shadow-primary/30">
              <FileText className="h-9 w-9 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Saving your note…</h2>
              <p className="mt-1 text-sm text-muted-foreground">Storing the transcription so you can use it with summaries and quizzes.</p>
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[11px] text-primary">
                <Sparkles className="h-3 w-3" /> Transcription complete
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-2 text-xs hover:bg-accent/40"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-2 text-xs hover:bg-accent/40">
                  <MicOff className="h-3.5 w-3.5" /> New recording
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span> {formatTime(elapsed)}
              <span className="text-muted-foreground ml-4">Words:</span> {transcription.split(/\s+/).filter(Boolean).length}
            </div>

            <div className="rounded-2xl glass p-6 md:p-8 max-h-[50vh] overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {transcription || "[No speech was detected during the recording.]"}
              </p>
            </div>

            {savedNoteId && (
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app/summary"
                  state={{ noteId: savedNoteId }}
                  className="flex items-center gap-2 rounded-xl gradient-bg px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" /> Generate Summary
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/app/quiz"
                  state={{ noteId: savedNoteId }}
                  className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm hover:bg-accent/40"
                >
                  <Brain className="h-4 w-4" /> Generate Quiz
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/app/notes"
                  className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm hover:bg-accent/40"
                >
                  <FileText className="h-4 w-4" /> View in Notes
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
