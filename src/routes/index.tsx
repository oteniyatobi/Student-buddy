import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Brain, Upload, MessageSquare, BarChart3, CalendarDays,
  ArrowRight, Play, Star, Zap, Trophy,
} from "lucide-react";
import { FloatingShapes } from "@/components/FloatingShapes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { testimonials } from "@/lib/mock";

export const Route = createFileRoute("/")({ component: Landing });

const features = [
  { icon: Upload, title: "Smart Note Ingestion", text: "Drop PDFs, images or text. Your AI organizes everything instantly." },
  { icon: Brain, title: "AI Summaries", text: "Long, short, key points. Generated in seconds, written like a tutor." },
  { icon: Trophy, title: "Adaptive Quizzes", text: "Auto-generated MCQs that adapt to what you know and what you don't." },
  { icon: MessageSquare, title: "24/7 AI Tutor", text: "Ask anything, get clear answers with examples and follow-ups." },
  { icon: CalendarDays, title: "Study Planner", text: "Pomodoro, weekly grid and AI-suggested schedules to keep you on track." },
  { icon: BarChart3, title: "Progress Analytics", text: "Streaks, XP, heatmaps and badges that make studying genuinely fun." },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg shadow-lg shadow-primary/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Smart Study</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition">Loved by students</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground sm:inline-block">
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg gradient-bg px-3.5 py-1.5 text-sm font-medium text-white shadow-lg shadow-primary/30 hover:opacity-90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <FloatingShapes />
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-24 text-center md:pt-28 md:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            New · AI Tutor 2.0 is live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-4xl font-bold tracking-tight md:text-7xl"
          >
            Study <span className="gradient-text">Smarter</span> with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            Your AI-powered learning companion for notes, summaries, quizzes and personalized study plans — all in one beautifully minimal workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl gradient-bg px-5 py-3 text-sm font-medium text-white shadow-xl shadow-primary/30 transition hover:shadow-primary/50"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button className="group inline-flex items-center gap-2 rounded-xl glass px-5 py-3 text-sm font-medium hover:bg-accent/40">
              <span className="grid h-6 w-6 place-items-center rounded-full gradient-bg">
                <Play className="h-3 w-3 text-white" />
              </span>
              Watch Demo
            </button>
          </motion.div>

          {/* Hero preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <div className="absolute -inset-1 rounded-3xl gradient-bg opacity-40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border/60 glass-strong shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-border/40 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-muted-foreground">app.smartstudy.ai/dashboard</span>
              </div>
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
                {[
                  { label: "Study Streak", v: "24", u: "days", g: "from-indigo-500 to-purple-500" },
                  { label: "Weekly Hours", v: "18.5", u: "hrs", g: "from-sky-500 to-blue-500" },
                  { label: "Quizzes Aced", v: "47", u: "perfect", g: "from-fuchsia-500 to-pink-500" },
                ].map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="rounded-2xl border border-border/60 bg-card/60 p-4 text-left"
                  >
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className={`bg-gradient-to-br ${c.g} bg-clip-text text-3xl font-bold text-transparent`}>{c.v}</span>
                      <span className="text-xs text-muted-foreground">{c.u}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${50 + i * 15}%` }} transition={{ delay: 1, duration: 1 }} className={`h-full bg-gradient-to-r ${c.g}`} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Everything you need</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
            A full study suite, powered by AI
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six tools working together so you can focus on understanding, not organizing.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl glass p-6 gradient-border"
            >
              <div className="mb-4 inline-grid h-11 w-11 place-items-center rounded-xl gradient-bg shadow-lg shadow-primary/30">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-4 rounded-3xl glass p-8 md:grid-cols-4">
          {[
            { v: "120K+", l: "Students" },
            { v: "4.9★", l: "App rating" },
            { v: "8M+", l: "Quizzes taken" },
            { v: "97%", l: "Pass rate" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-bold gradient-text md:text-4xl">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground md:text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Loved by students</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">From overwhelmed to overachieving</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl glass p-6"
            >
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gradient-bg text-sm font-semibold text-white">{t.avatar}</div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-bg p-10 text-center text-white md:p-16"
        >
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
          <div className="relative">
            <Zap className="mx-auto h-8 w-8" />
            <h3 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Ready to level up your studying?</h3>
            <p className="mx-auto mt-3 max-w-xl text-white/85">Join thousands of students learning faster with Smart Study Companion. Free to start, no credit card required.</p>
            <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-primary shadow-xl hover:bg-white/95">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg"><Sparkles className="h-5 w-5 text-white" /></div>
              <span className="font-semibold">Smart Study</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">AI-powered learning that adapts to you. Built for curious students everywhere.</p>
          </div>
          {[
            { t: "Product", l: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { t: "Company", l: ["About", "Blog", "Careers", "Contact"] },
          ].map((g) => (
            <div key={g.t}>
              <div className="text-sm font-semibold">{g.t}</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {g.l.map((x) => <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 px-4 py-5 text-center text-xs text-muted-foreground">
          © 2026 Smart Study Companion. Crafted with care.
        </div>
      </footer>
    </div>
  );
}
