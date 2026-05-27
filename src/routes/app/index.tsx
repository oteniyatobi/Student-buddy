import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Trophy, FileText, MessageSquare, Upload, Flame, Sparkles,
  ArrowUpRight, Plus, Play, Brain, CalendarDays,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";
import { weekChart as mockChart } from "@/lib/mock";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const ICONS = { Trophy, FileText, MessageSquare, Upload } as const;

function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardService.getStats,
    staleTime: 60_000,
  });

  const firstName = user?.firstName ?? data?.userName ?? "Student";

  const stats = data?.stats;
  const statsCards = [
    { label: "Study Streak", value: String(stats?.streakDays ?? 0), unit: "days", trend: `${stats?.streakDays ?? 0}d`, color: "from-indigo-500 to-purple-500" },
    { label: "Hours This Week", value: String(stats?.hoursThisWeek ?? 0), unit: "hrs", trend: "this week", color: "from-sky-500 to-indigo-500" },
    { label: "Quizzes Aced", value: String(stats?.quizzesAced ?? 0), unit: "quizzes", trend: `total`, color: "from-fuchsia-500 to-pink-500" },
    { label: "XP Earned", value: (stats?.xp ?? user?.xp ?? 0).toLocaleString(), unit: "XP", trend: "total", color: "from-emerald-500 to-teal-500" },
  ];

  const chart = data?.weekChart ?? mockChart.map((d) => ({ ...d, hours: 0, focus: 0 }));
  const activity = data?.recentActivity ?? [];
  const tasks = data?.upcomingTasks ?? [];
  const max = Math.max(...chart.map((d) => d.hours), 1);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-bg p-6 text-white md:p-8"
      >
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/15 blur-3xl animate-float-slow" />
        <div className="absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float-slow" />
        <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs backdrop-blur">
              <Flame className="h-3.5 w-3.5" />
              {(stats?.streakDays ?? user?.streakDays ?? 0) > 0
                ? `${stats?.streakDays ?? user?.streakDays}-day streak — keep it going!`
                : "Start your first study session today!"}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Good afternoon, {firstName} 👋
            </h1>
            <p className="mt-1 text-white/85">You're crushing your study goals — keep it up!</p>
          </div>
          <div className="flex gap-2">
            <Link to="/app/chat" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur hover:bg-white/25">
              <Sparkles className="h-4 w-4" /> Ask AI
            </Link>
            <Link to="/app/quiz" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-primary hover:bg-white/95">
              <Play className="h-4 w-4" /> Start session
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statsCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl glass p-5"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              {isLoading ? (
                <div className="h-8 w-16 skeleton-shimmer rounded-md" />
              ) : (
                <span className={`bg-gradient-to-br ${s.color} bg-clip-text text-2xl font-bold text-transparent md:text-3xl`}>{s.value}</span>
              )}
              <span className="text-xs text-muted-foreground">{s.unit}</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />{s.trend}
            </div>
            <div className={`pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-20 blur-xl`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="rounded-2xl glass p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Weekly study hours</h3>
              <p className="text-xs text-muted-foreground">Your sessions this week</p>
            </div>
            <Link to="/app/analytics" className="text-xs text-primary hover:underline">View analytics</Link>
          </div>
          <div className="mt-6 flex h-44 items-end gap-3">
            {chart.map((d, i) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.hours / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.05, ease: "easeOut" }}
                  className="w-full rounded-t-lg gradient-bg shadow-lg shadow-primary/30 hover:opacity-90"
                />
                <span className="text-[10px] text-muted-foreground">{d.d}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="rounded-2xl glass p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Upcoming tasks</h3>
            <Link to="/app/planner" className="rounded-lg p-1 hover:bg-accent"><Plus className="h-4 w-4" /></Link>
          </div>
          <ul className="mt-4 space-y-3">
            {tasks.length === 0 ? (
              <li className="text-xs text-muted-foreground">No upcoming tasks. Add some in the planner!</li>
            ) : (
              tasks.map((t, i) => (
                <motion.li
                  key={t.id ?? t.title}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-start gap-3 rounded-xl border border-border/40 bg-card/40 p-3"
                >
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full ${t.priority === "high" ? "bg-rose-400" : t.priority === "med" ? "bg-amber-400" : "bg-sky-400"}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.due ?? "No due date"}</p>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl glass p-6 lg:col-span-2"
        >
          <h3 className="font-semibold">Recent activity</h3>
          <ul className="mt-4 space-y-2">
            {activity.map((a, i) => {
              const Icon = ICONS[a.icon as keyof typeof ICONS] ?? FileText;
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/40"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="flex-1 truncate text-sm">{a.title}</p>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="rounded-2xl glass p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">This week</h3>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-2">
            {[
              { i: Brain, t: "Start a quiz", to: "/app/quiz" },
              { i: Upload, t: "Upload notes", to: "/app/notes" },
              { i: MessageSquare, t: "Chat with AI", to: "/app/chat" },
            ].map((a) => (
              <Link key={a.t} to={a.to} className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-2.5 text-sm hover:border-primary/40">
                <div className="grid h-8 w-8 place-items-center rounded-lg gradient-bg">
                  <a.i className="h-4 w-4 text-white" />
                </div>
                {a.t}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
