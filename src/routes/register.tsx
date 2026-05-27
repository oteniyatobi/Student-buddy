import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field, SocialButtons, PasswordStrength } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password);
      navigate({ to: "/app" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start studying smarter in under 30 seconds"
      footer={
        <>
          Have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" placeholder="Ada" value={form.firstName} onChange={set("firstName")} />
          <Field label="Last name" placeholder="Lovelace" value={form.lastName} onChange={set("lastName")} />
        </div>
        <Field label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={set("email")} />
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 placeholder:text-muted-foreground/60"
          />
          <PasswordStrength value={form.password} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl gradient-bg py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
        <div className="text-center text-xs text-muted-foreground">or sign up with</div>
        <SocialButtons />
      </form>
    </AuthShell>
  );
}
