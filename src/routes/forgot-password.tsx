import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, Field } from "@/components/AuthShell";

export const Route = createFileRoute("/forgot-password")({ component: Forgot });

function Forgot() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a magic reset link to your inbox"
      footer={<>Remembered it? <Link to="/login" className="font-medium text-primary hover:underline">Back to log in</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <Field label="Email" type="email" placeholder="you@university.edu" />
        <button className="w-full rounded-xl gradient-bg py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 transition hover:opacity-90">
          Send reset link
        </button>
      </form>
    </AuthShell>
  );
}
