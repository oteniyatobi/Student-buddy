import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap, Calendar } from "lucide-react";
import { weekChart, subjectsPie, badges } from "@/lib/mock";

export const Route = createFileRoute("/app/analytics")({ component: Analytics });

function Analytics() {
  const max = Math.max(...weekChart.map((d) => d.hours));
  const totalPie = subjectsPie.reduce((s, x) => s + x.value, 0);
  let cum = 0;
  const pieSegs = subjectsPie.map((s) => {
    const start = (cum / totalPie) * 360; cum += s.value;
    const end = (cum / totalPie) * 360;
    return { ...s, start, end };
  });
  const pieColors = ["#8b5cf6", "#ec4899", "#06b6d4", "#10b981"];

  // Heatmap mock
  const heat = Array.from({ length: 7 * 12 }, () => Math.floor(Math.random() * 5));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">A look at how you've been studying.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { i: Flame, l: "Current streak", v: "24 days", c: "from-rose-500 to-orange-500" },
          { i: Zap, l: "Total XP", v: "12,480", c: "from-indigo-500 to-purple-500" },
          { i: Trophy, l: "Badges", v: `${badges.filter(b => b.earned).length}/${badges.length}`, c: "from-amber-500 to-yellow-500" },
          { i: Calendar, l: "Days active (30d)", v: "27", c: "from-emerald-500 to-teal-500" },
        ].map((s, i) => (
          <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl glass p-5">
            <div className={`inline-grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${s.c} text-white shadow-lg`}>
              <s.i className="h-4 w-4" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{s.l}</p>
            <p className="text-xl font-bold">{s.v}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Line graph */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Focus score this week</h3>
            <span className="text-xs text-muted-foreground">Avg 79</span>
          </div>
          <svg viewBox="0 0 700 220" className="mt-4 h-56 w-full">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = weekChart.map((d, i) => ({
                x: (i / (weekChart.length - 1)) * 680 + 10,
                y: 200 - (d.focus / 100) * 180,
              }));
              const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
              const area = `${path} L690,200 L10,200 Z`;
              return (
                <>
                  <motion.path d={area} fill="url(#grad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                  <motion.path d={path} fill="none" stroke="url(#stroke)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  {pts.map((p, i) => (
                    <motion.circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#8b5cf6" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }} />
                  ))}
                  {weekChart.map((d, i) => (
                    <text key={d.d} x={(i / (weekChart.length - 1)) * 680 + 10} y="218" textAnchor="middle" fontSize="10" className="fill-muted-foreground">{d.d}</text>
                  ))}
                </>
              );
            })()}
          </svg>
        </motion.div>

        {/* Pie */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-6">
          <h3 className="font-semibold">Time by subject</h3>
          <div className="mt-4 flex items-center gap-4">
            <svg viewBox="-1.1 -1.1 2.2 2.2" className="h-32 w-32 -rotate-90">
              {pieSegs.map((s, i) => {
                const a1 = (s.start * Math.PI) / 180, a2 = (s.end * Math.PI) / 180;
                const x1 = Math.cos(a1), y1 = Math.sin(a1);
                const x2 = Math.cos(a2), y2 = Math.sin(a2);
                const large = s.end - s.start > 180 ? 1 : 0;
                return (
                  <motion.path
                    key={s.name}
                    d={`M0,0 L${x1},${y1} A1,1 0 ${large} 1 ${x2},${y2} Z`}
                    fill={pieColors[i]}
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  />
                );
              })}
              <circle r="0.55" fill="var(--card)" />
            </svg>
            <ul className="space-y-2 text-sm">
              {pieSegs.map((s, i) => (
                <li key={s.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded" style={{ background: pieColors[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium">{Math.round((s.value / totalPie) * 100)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Study heatmap</h3>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className="h-3 w-3 rounded" style={{ background: `color-mix(in oklch, var(--primary) ${l * 22}%, transparent)` }} />
            ))}
            More
          </div>
        </div>
        <div className="mt-4 grid grid-flow-col grid-rows-7 gap-1">
          {heat.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.005, duration: 0.25 }}
              className="aspect-square rounded-sm"
              style={{ background: v === 0 ? "color-mix(in oklch, var(--muted) 60%, transparent)" : `color-mix(in oklch, var(--primary) ${v * 22}%, transparent)` }}
            />
          ))}
        </div>
        {/* Bars */}
        <div className="mt-6 grid grid-cols-7 gap-3">
          {weekChart.map((d, i) => (
            <div key={d.d} className="text-center">
              <div className="mx-auto mb-1 h-24 w-full overflow-hidden rounded-lg bg-muted/30">
                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.hours / max) * 100}%` }} transition={{ delay: 0.1 + i * 0.05, duration: 0.6 }} className="h-full origin-bottom gradient-bg" />
              </div>
              <span className="text-[10px] text-muted-foreground">{d.d}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass p-6">
        <h3 className="font-semibold">Achievements</h3>
        <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-6">
          {badges.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.04 }}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center ${b.earned ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20 opacity-60"}`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-full text-2xl ${b.earned ? "gradient-bg shadow-lg shadow-primary/30" : "bg-muted"}`}>
                {b.icon}
              </div>
              <span className="text-[11px] font-medium">{b.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
