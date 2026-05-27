import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, Reorder } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Target, TrendingUp, Plus, X } from "lucide-react";
import { plannerService, type PlannerTask } from "@/services/plannerService";
import { toast } from "sonner";

export const Route = createFileRoute("/app/planner")({ component: Planner });

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

const COLORS = [
  "from-indigo-500 to-purple-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
];

function Planner() {
  const qc = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["plannerTasks"],
    queryFn: plannerService.list,
  });

  const createMutation = useMutation({
    mutationFn: plannerService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plannerTasks"] }); toast.success("Task added"); },
    onError: () => toast.error("Failed to add task"),
  });

  const deleteMutation = useMutation({
    mutationFn: plannerService.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plannerTasks"] }),
    onError: () => toast.error("Failed to delete task"),
  });

  const [backlog, setBacklog] = useState<{ id: string; title: string }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = Math.floor(secs / 60).toString().padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  const pomoPct = ((25 * 60 - secs) / (25 * 60)) * 100;

  const addToBacklog = () => {
    if (!newTaskTitle.trim()) return;
    setBacklog((b) => [...b, { id: Math.random().toString(36).slice(2), title: newTaskTitle.trim() }]);
    setNewTaskTitle("");
  };

  const promoteToCalendar = (item: { id: string; title: string }) => {
    createMutation.mutate({
      title: item.title,
      day: 0,
      hour: 9,
      duration: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      priority: "med",
    });
    setBacklog((b) => b.filter((x) => x.id !== item.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study planner</h1>
          <p className="text-sm text-muted-foreground">This week — drag tasks to reschedule.</p>
        </div>
        <div className="flex gap-2">
          {[
            { i: Target, t: "Goal: 20h", c: "from-indigo-500 to-purple-500" },
            { i: TrendingUp, t: "+12% focus", c: "from-emerald-500 to-teal-500" },
          ].map((s) => (
            <div key={s.t} className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${s.c} px-3 py-2 text-xs font-medium text-white shadow-lg`}>
              <s.i className="h-3.5 w-3.5" /> {s.t}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto rounded-2xl glass p-4 lg:col-span-3"
        >
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-2">
              <div />
              {DAYS.map((d, i) => (
                <div key={d} className={`pb-2 text-center text-xs font-medium ${i === new Date().getDay() - 1 ? "text-primary" : "text-muted-foreground"}`}>
                  <div>{d}</div>
                </div>
              ))}
              {HOURS.map((h) => (
                <div key={h} className="contents">
                  <div className="py-2 text-right text-[10px] text-muted-foreground">{h}:00</div>
                  {DAYS.map((_, di) => {
                    const task = tasks.find((t) => t.day === di && t.hour === h);
                    return (
                      <div key={di} className="relative h-10 rounded-lg border border-border/30 bg-card/20">
                        {task && (
                          <motion.div
                            layout
                            whileHover={{ scale: 1.03 }}
                            className={`absolute inset-x-0 top-0 z-10 group cursor-default overflow-hidden rounded-lg bg-gradient-to-r ${task.color} px-2 py-1.5 text-[10px] font-medium text-white shadow-lg shadow-primary/30`}
                            style={{ height: `${task.duration * 40 - 4}px` }}
                          >
                            <span className="block truncate">{task.title}</span>
                            <button
                              onClick={() => deleteMutation.mutate(task.id)}
                              className="absolute right-1 top-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded bg-white/20 hover:bg-white/40"
                            >
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-5 text-center">
            <p className="text-xs text-muted-foreground">Pomodoro Timer</p>
            <div className="relative mx-auto mt-3 grid h-40 w-40 place-items-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/40" />
                <motion.circle
                  cx="50" cy="50" r="44" stroke="url(#g)" strokeWidth="6" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - pomoPct / 100) }}
                />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <div className="text-3xl font-bold tabular-nums">{mm}:{ss}</div>
                <div className="text-[11px] text-muted-foreground">Focus session</div>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setRunning((r) => !r)} className="inline-flex items-center gap-1.5 rounded-xl gradient-bg px-3 py-1.5 text-xs font-medium text-white">
                {running ? <><Pause className="h-3.5 w-3.5" /> Pause</> : <><Play className="h-3.5 w-3.5" /> Start</>}
              </button>
              <button onClick={() => { setRunning(false); setSecs(25 * 60); }} className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-xl glass px-3 py-1.5 text-xs">
                <Coffee className="h-3.5 w-3.5" /> Break
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Backlog</h3>
              <span className="text-xs text-muted-foreground">tap to add to calendar</span>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addToBacklog()}
                placeholder="Add task…"
                className="flex-1 rounded-lg border border-border bg-background/50 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
              />
              <button onClick={addToBacklog} className="rounded-lg gradient-bg px-2.5 py-1.5 text-white">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <Reorder.Group axis="y" values={backlog} onReorder={setBacklog} className="mt-3 space-y-2">
              {backlog.map((t) => (
                <Reorder.Item
                  key={t.id} value={t}
                  whileDrag={{ scale: 1.03, zIndex: 5 }}
                  onClick={() => promoteToCalendar(t)}
                  className="cursor-pointer rounded-xl border border-border/40 bg-card/40 px-3 py-2 text-xs hover:border-primary/40 active:cursor-grabbing"
                >
                  {t.title}
                </Reorder.Item>
              ))}
              {backlog.length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-4">No backlog items</p>
              )}
            </Reorder.Group>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
