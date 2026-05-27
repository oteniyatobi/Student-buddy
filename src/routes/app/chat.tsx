import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Plus, Loader2 } from "lucide-react";
import { aiService } from "@/services/aiService";
import { chatPrompts } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat")({ component: Chat });

type Msg = { role: "user" | "ai"; text: string };

function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hey! 👋 I'm your AI Study Companion. What would you like to learn today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setMsgs((m) => [...m, { role: "user", text: content }]);
    setInput("");
    setLoading(true);

    try {
      const history = msgs
        .filter((m) => m.role !== "ai" || msgs.indexOf(m) > 0)
        .map((m) => ({
          role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
          content: m.text,
        }));
      history.push({ role: "user", content });

      const reply = await aiService.chat(history);
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      toast.error("AI is unavailable. Please try again.");
      setMsgs((m) => [...m, { role: "ai", text: "Sorry, I'm having trouble right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const startNew = () => {
    setMsgs([{ role: "ai", text: "Hey! 👋 I'm your AI Study Companion. What would you like to learn today?" }]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col gap-4 md:h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">AI Study Tutor</h1>
          <p className="text-xs text-muted-foreground">Always-on, infinitely patient.</p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-2 text-xs hover:bg-accent/40"
        >
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto rounded-3xl glass p-4 scrollbar-thin md:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "ai" && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full gradient-bg shadow-lg shadow-primary/30">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  m.role === "user" ? "gradient-bg text-white" : "glass"
                }`}>
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold">
                    Me
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full gradient-bg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl glass px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>

      {msgs.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {chatPrompts.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              className="rounded-full glass px-3 py-1.5 text-xs hover:bg-accent/40 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 rounded-2xl glass p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything…"
          disabled={loading}
          className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="inline-flex items-center gap-1.5 rounded-xl gradient-bg px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
