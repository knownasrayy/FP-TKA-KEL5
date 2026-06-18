import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Smart Shop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const nav = useNavigate();
  const [email, setEmail] = useState("admin1@tka.its.ac.id");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      toast.error("Registration is disabled for this demo.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://20.198.72.134/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("smartshop_token", data.token);
        toast.success("Welcome back!");
        setTimeout(() => nav({ to: "/" }), 600);
      } else {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "Invalid credentials.");
      }
    } catch (err) {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative grid place-items-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-accent/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-blush/60 blur-3xl" style={{ background: "oklch(0.85 0.1 20 / 0.5)" }} />

      <div className="relative w-full max-w-md rounded-3xl bg-background/60 backdrop-blur-2xl border border-border/60 shadow-[var(--shadow-glow)] p-8">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="size-9 rounded-xl bg-[image:var(--gradient-accent)] grid place-items-center text-primary-foreground text-sm font-bold">S</div>
          <span className="font-display font-bold text-xl">Smart Shop</span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-center">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="text-center text-sm text-muted-foreground mt-1">{mode === "login" ? "Sign in to continue shopping" : "Join Smart Shop today"}</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border outline-none focus:ring-2 ring-accent text-sm" />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border outline-none focus:ring-2 ring-accent text-sm" />
          {mode === "register" && (
            <input required type="password" placeholder="Confirm password" className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border outline-none focus:ring-2 ring-accent text-sm" />
          )}
          {mode === "login" && (
            <label className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><input type="checkbox" className="accent-accent" /> Remember me</span>
              <a href="#" className="hover:text-foreground">Forgot password?</a>
            </label>
          )}
          <button disabled={loading} className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
            {loading ? "Authenticating..." : (mode === "login" ? "Sign in" : "Create account")}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="py-2.5 rounded-xl bg-background/80 border border-border text-sm hover:bg-background">Google</button>
          <button className="py-2.5 rounded-xl bg-background/80 border border-border text-sm hover:bg-background">Apple</button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? "New here? " : "Have an account? "}
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-foreground font-semibold hover:underline">
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
      <Toaster />
    </div>
  );
}
