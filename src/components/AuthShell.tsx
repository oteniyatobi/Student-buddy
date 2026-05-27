import { type ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, Github, ArrowLeft } from "lucide-react";
import { FloatingShapes } from "./FloatingShapes";
import { ThemeToggle } from "./ThemeToggle";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen md:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden overflow-hidden md:block">
        <FloatingShapes />
        <div className="relative z-10 flex h-full flex-col p-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg"><Sparkles className="h-5 w-5 text-white" /></div>
            <span className="font-semibold">Smart Study</span>
          </Link>
          <div className="mt-auto max-w-md">
            <h2 className="text-3xl font-bold tracking-tight">
              Your AI study<br />companion awaits.
            </h2>
            <p className="mt-3 text-muted-foreground">Join 120,000+ students learning faster with adaptive summaries, quizzes and a 24/7 tutor.</p>
            <div className="mt-6 flex -space-x-2">
              {["MC", "AP", "SR", "JK"].map((a, i) => (
                <div key={i} className="grid h-9 w-9 place-items-center rounded-full gradient-bg text-xs font-semibold text-white ring-2 ring-background">{a}</div>
              ))}
              <span className="ml-4 self-center text-xs text-muted-foreground">+ 120K active students this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-4 md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg"><Sparkles className="h-5 w-5 text-white" /></div>
            <span className="font-semibold">Smart Study</span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="absolute right-4 top-4 hidden md:block"><ThemeToggle /></div>

        <div className="flex flex-1 items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="rounded-3xl glass-strong p-7 shadow-2xl">
              <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back to home
              </Link>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              <div className="mt-6">{children}</div>
              {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className={`relative rounded-xl border bg-background/50 transition-all ${focused ? "border-primary ring-4 ring-primary/20" : "border-border"}`}>
        <input
          type={isPass && show ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
        {isPass && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </label>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button className="inline-flex items-center justify-center gap-2 rounded-xl glass px-3 py-2.5 text-sm hover:bg-accent/40">
        <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1H12v3.2h5.35c-.23 1.46-1.7 4.27-5.35 4.27a6 6 0 1 1 0-12 5.5 5.5 0 0 1 3.9 1.52L18.4 5.9A9.27 9.27 0 0 0 12 3.4a9.6 9.6 0 1 0 0 19.2c5.55 0 9.2-3.9 9.2-9.4 0-.6-.07-1.06-.15-1.5Z"/></svg>
        Google
      </button>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl glass px-3 py-2.5 text-sm hover:bg-accent/40">
        <Github className="h-4 w-4" /> GitHub
      </button>
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const score = Math.min(4, [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(value)).length);
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["bg-muted", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < score ? colors[score] : "bg-muted"}`} />
        ))}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{value ? labels[score] : "Use 8+ chars, mix case, numbers & symbols"}</div>
    </div>
  );
}
