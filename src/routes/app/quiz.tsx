import { useEffect, useState } from "react";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Clock, Trophy, ArrowRight, RotateCcw, Check, X, Sparkles, Brain } from "lucide-react";
import { aiService, type QuizQuestion } from "@/services/aiService";
import { quizService } from "@/services/quizService";
import { notesService } from "@/services/notesService";
import { quizQuestions as fallbackQuestions } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/quiz")({ component: Quiz });

function Quiz() {
  const location = useLocation();
  const preloadNoteId = (location.state as { noteId?: string } | null)?.noteId;

  const [phase, setPhase] = useState<"setup" | "playing" | "done">("setup");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [topic, setTopic] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>(preloadNoteId);

  const { data: notes = [] } = useQuery({
    queryKey: ["notes"],
    queryFn: notesService.list,
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      aiService.generateQuiz({
        noteId: selectedNoteId,
        topic: topic || undefined,
        count: 5,
      }),
    onSuccess: (quiz) => {
      setQuestions(quiz.questions);
      setQuizId(quiz.id);
      setPhase("playing");
      setIdx(0);
      setScore(0);
      setSelected(null);
    },
    onError: () => {
      toast.error("Failed to generate quiz. Using sample questions.");
      setQuestions(fallbackQuestions);
      setPhase("playing");
    },
  });

  const attemptMutation = useMutation({
    mutationFn: ({ score, total }: { score: number; total: number }) =>
      quizId ? quizService.saveAttempt(quizId, score, total) : Promise.resolve({ xpEarned: 0 }),
    onSuccess: ({ xpEarned }) => {
      if (xpEarned > 0) toast.success(`+${xpEarned} XP earned!`);
    },
  });

  useEffect(() => {
    if (phase !== "playing") return;
    setTime(30);
    const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [idx, phase]);

  const q = questions[idx];
  const pct = ((idx + (phase === "done" ? 1 : 0)) / Math.max(questions.length, 1)) * 100;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const newScore = i === q.a ? score + 1 : score;
    if (i === q.a) setScore(newScore);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setPhase("done");
        const finalScore = i === q.a ? score + 1 : score;
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981"] });
        attemptMutation.mutate({ score: finalScore, total: questions.length });
      } else {
        setIdx((n) => n + 1);
        setSelected(null);
      }
    }, 900);
  };

  const reset = () => {
    setPhase("setup");
    setIdx(0);
    setSelected(null);
    setScore(0);
    setQuizId(null);
    setQuestions([]);
  };

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Generate a Quiz</h1>
          <p className="text-sm text-muted-foreground">Create AI-powered questions from your notes or any topic.</p>
        </div>

        <div className="rounded-3xl glass p-6 space-y-4">
          {notes.length > 0 && (
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">From a note (optional)</span>
              <select
                value={selectedNoteId ?? ""}
                onChange={(e) => setSelectedNoteId(e.target.value || undefined)}
                className="w-full rounded-xl border border-border bg-card/50 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">No note selected</option>
                {notes.map((n) => (
                  <option key={n.id} value={n.id}>{n.title}</option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Or enter a topic {selectedNoteId ? "(note takes priority)" : ""}
            </span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, French Revolution, Calculus…"
              className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || (!selectedNoteId && !topic.trim())}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl gradient-bg px-4 py-3 text-sm font-medium text-white shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" /> Generating…
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" /> Generate AI Quiz
                </>
              )}
            </button>
            <button
              onClick={() => { setQuestions(fallbackQuestions); setPhase("playing"); }}
              className="rounded-xl glass px-4 py-3 text-sm hover:bg-accent/40"
            >
              Try sample
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl glass p-8 text-center md:p-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="mx-auto grid h-20 w-20 place-items-center rounded-2xl gradient-bg shadow-xl shadow-primary/40"
          >
            <Trophy className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="mt-5 text-2xl font-bold">Quiz complete!</h2>
          <p className="mt-1 text-sm text-muted-foreground">You scored</p>
          <div className="mt-2 text-5xl font-bold gradient-text">{score}/{questions.length}</div>
          <p className="mt-3 text-sm text-muted-foreground">
            {score === questions.length
              ? "Flawless — you crushed it."
              : score >= Math.ceil(questions.length * 0.6)
              ? "Solid work — one more run to perfect it."
              : "Don't worry — your AI tutor has notes for you."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl glass px-4 py-2 text-sm hover:bg-accent/40">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || (!selectedNoteId && !topic.trim())}
              className="inline-flex items-center gap-1.5 rounded-xl gradient-bg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Next quiz <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Question {idx + 1} of {questions.length}</p>
          <h1 className="text-xl font-semibold">AI Quiz</h1>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm tabular-nums ${time <= 10 ? "text-rose-400" : ""}`}>
          <Clock className="h-4 w-4" />
          <span>0:{time.toString().padStart(2, "0")}</span>
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div animate={{ width: `${pct}%` }} className="h-full gradient-bg" transition={{ duration: 0.4 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl glass p-6 md:p-8"
        >
          <h2 className="text-lg font-semibold md:text-xl">{q.q}</h2>
          <div className="mt-6 grid grid-cols-1 gap-3">
            {q.options.map((o, i) => {
              const isPicked = selected === i;
              const isRight = selected !== null && i === q.a;
              const isWrong = isPicked && i !== q.a;
              return (
                <motion.button
                  key={o}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => choose(i)}
                  disabled={selected !== null}
                  className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 text-left text-sm transition-all ${
                    isRight
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : isWrong
                      ? "border-rose-500/60 bg-rose-500/10"
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-accent/30"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-semibold ${
                      isRight ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "gradient-bg text-white"
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {o}
                  </span>
                  {isRight && <Check className="h-4 w-4 text-emerald-400" />}
                  {isWrong && <X className="h-4 w-4 text-rose-400" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="text-center text-xs text-muted-foreground">
        Score so far: <span className="font-semibold text-foreground">{score}</span>
      </div>
    </div>
  );
}
