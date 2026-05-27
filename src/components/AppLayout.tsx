import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Upload, FileText, Brain, MessageSquare,
  CalendarDays, BarChart3, Settings, Menu, Search, Bell, Sparkles, X, LogOut, Mic,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/record", label: "Record Class", icon: Mic },
  { to: "/app/notes", label: "Upload Notes", icon: Upload },
  { to: "/app/summary", label: "Summaries", icon: FileText },
  { to: "/app/quiz", label: "Quiz", icon: Brain },
  { to: "/app/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/app/planner", label: "Planner", icon: CalendarDays },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "??";

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-semibold tracking-tight">Smart Study</span>
          )}
        </Link>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="rounded-md p-1 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.end);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {active && (
                <motion.div
                  layoutId={mobile ? "active-pill-m" : "active-pill"}
                  className="absolute inset-0 rounded-xl gradient-bg opacity-90 shadow-lg shadow-primary/30"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`relative h-4 w-4 ${active ? "text-white" : ""}`} />
              {!collapsed && (
                <span className={`relative ${active ? "text-white font-medium" : ""}`}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <div className="rounded-2xl glass p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Pro Plan
          </div>
          {!collapsed && (
            <>
              <p className="mt-1 text-xs text-muted-foreground">Unlock unlimited AI tutoring</p>
              <button className="mt-3 w-full rounded-lg gradient-bg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
                Upgrade
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="sticky top-0 hidden h-screen shrink-0 border-r border-border bg-sidebar md:block"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur md:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar md:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/60 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-accent md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden rounded-lg p-2 hover:bg-accent md:inline-flex"
              aria-label="Collapse sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden flex-1 md:block">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Search notes, quizzes, sessions…"
                  className="w-full rounded-xl border border-border bg-background/60 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full glass hover:scale-110 transition-transform">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pink-500 animate-pulse-glow" />
              </button>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full glass hover:scale-110 transition-transform text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <div className="ml-1 grid h-9 w-9 place-items-center rounded-full gradient-bg text-xs font-semibold text-white shadow-lg shadow-primary/40">
                {initials}
              </div>
            </div>
          </div>
          {title && (
            <div className="border-t border-border/40 px-4 py-3 md:px-6">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            </div>
          )}
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 p-4 md:p-6"
        >
          {children}
        </motion.main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/80 backdrop-blur md:hidden">
          {nav.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.end);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
