import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { Bell, Globe, Lock, User, Palette } from "lucide-react";

export const Route = createFileRoute("/app/settings")({ component: Settings });

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "gradient-bg" : "bg-muted"}`}
      aria-pressed={on}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${on ? "right-0.5" : "left-0.5"}`}
      />
    </button>
  );
}

function Section({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl glass p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg text-white shadow-lg shadow-primary/30">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </motion.div>
  );
}

function Settings() {
  const { theme, setTheme } = useTheme();
  const [notif, setNotif] = useState({ daily: true, streak: true, weekly: false, marketing: false });
  const [profile, setProfile] = useState({ name: "Ada Karim", email: "ada@university.edu", school: "Northwood University" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Personalize your experience.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section icon={User} title="Profile" desc="How others see you in Smart Study">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-bg text-lg font-bold text-white">AK</div>
            <div>
              <button className="rounded-lg glass px-3 py-1.5 text-xs hover:bg-accent/40">Change avatar</button>
              <p className="mt-1 text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
            </div>
          </div>
          {[
            { l: "Name", k: "name" as const },
            { l: "Email", k: "email" as const },
            { l: "School", k: "school" as const },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.l}</span>
              <input
                value={profile[f.k]}
                onChange={(e) => setProfile((p) => ({ ...p, [f.k]: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
            </label>
          ))}
        </Section>

        <Section icon={Palette} title="Appearance" desc="Light or dark — your call">
          <div className="grid grid-cols-2 gap-3">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`relative overflow-hidden rounded-2xl border p-4 text-left transition ${theme === t ? "border-primary ring-4 ring-primary/20" : "border-border hover:border-primary/40"}`}
              >
                <div className={`h-16 w-full rounded-xl ${t === "dark" ? "bg-gradient-to-br from-slate-900 to-indigo-950" : "bg-gradient-to-br from-white to-indigo-100"}`} />
                <div className="mt-2 text-sm font-medium capitalize">{t}</div>
                <div className="text-xs text-muted-foreground">{t === "dark" ? "Easy on the eyes" : "Bright and clean"}</div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 p-3">
            <div>
              <p className="text-sm font-medium">Reduce motion</p>
              <p className="text-xs text-muted-foreground">Calmer transitions for sensitive users</p>
            </div>
            <Toggle on={false} onChange={() => {}} />
          </div>
        </Section>

        <Section icon={Bell} title="Notifications" desc="What you hear from us">
          {[
            { k: "daily" as const, l: "Daily study reminder", d: "Nudge me at 9am to start" },
            { k: "streak" as const, l: "Streak protection", d: "Warn me before I lose my streak" },
            { k: "weekly" as const, l: "Weekly progress digest", d: "Sunday recap email" },
            { k: "marketing" as const, l: "Product updates", d: "Big launches and tips" },
          ].map((n) => (
            <div key={n.k} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{n.l}</p>
                <p className="text-xs text-muted-foreground">{n.d}</p>
              </div>
              <Toggle on={notif[n.k]} onChange={(v) => setNotif((s) => ({ ...s, [n.k]: v }))} />
            </div>
          ))}
        </Section>

        <Section icon={Globe} title="Preferences" desc="Language and study defaults">
          {[
            { l: "Language", v: "English (US)" },
            { l: "Time zone", v: "GMT+2 — Cairo" },
            { l: "Default session", v: "Pomodoro · 25min" },
          ].map((p) => (
            <div key={p.l} className="flex items-center justify-between rounded-xl border border-border/40 bg-card/40 p-3">
              <span className="text-sm">{p.l}</span>
              <span className="text-xs text-muted-foreground">{p.v}</span>
            </div>
          ))}
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/40 px-3 py-2 text-sm hover:bg-accent/40">
            <Lock className="h-4 w-4" /> Privacy & data
          </button>
        </Section>
      </div>
    </div>
  );
}
