"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Check, Copy, Mail, KeyRound, UserCog } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function LoginPage() {
  const [email, setEmail] = useState("ceo@enmasco.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState("");
  const [callback, setCallback] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("callbackUrl");
    if (urlParam) setCallback(urlParam);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // no duplicate submissions
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials. Use demo emails from auth docs.");
      return;
    }
    window.location.href = callback;
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard may be unavailable in insecure context; ignore silently
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? "" : c)), 1400);
  }

  const inputBase =
    "w-full h-[50px] rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/35 outline-none transition-all duration-200 focus:border-sky-400/50 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] px-4 py-10">
      {/* ---- Background polish (visual only) ---- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.10),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(168,139,250,0.10),transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---- LEFT: Product hero ---- */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="hidden flex-col justify-between rounded-[22px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl lg:flex"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10">
                <Shield className="h-5 w-5 text-sky-300" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-[15px] font-bold tracking-[0.3px] text-white">K2KAI Social Flow</div>
                <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[3px] text-white/55">by ENMASCO</div>
              </div>
            </div>

            <h1 className="mt-8 text-2xl font-semibold leading-snug text-white">
              Enterprise Social
              <br />
              Automation Platform
            </h1>
            <p className="mt-3 text-sm text-white/55">
              Unify every channel, team, and workflow in one secure command center.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Monitor", "Manage", "Automate", "Secure"].map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-white/75"
                >
                  {k}
                </span>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2.5">
              {[
                { label: "AI Online", dot: "bg-emerald-400" },
                { label: "Security Active", dot: "bg-emerald-400" },
                { label: "Network Connected", dot: "bg-emerald-400" },
                { label: "System Healthy", dot: "bg-emerald-400" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white/70"
                >
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-4">
            <span className="text-xs text-white/45">Current Version</span>
            <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
              v1.0 Stable
            </span>
          </div>
        </motion.div>

        {/* ---- RIGHT: Login card ---- */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <GlassCard className="w-full rounded-[22px] border-white/10 p-7 shadow-[0_0_50px_rgba(56,189,248,0.06)]">
            {/* Mobile brand (hidden on lg where hero shows it) */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-400/10">
                <Shield className="h-5 w-5 text-sky-300" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-bold tracking-[0.3px] text-white">K2KAI Social Flow</div>
                <div className="text-[11px] font-medium uppercase tracking-[3px] text-white/55">by ENMASCO</div>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-white">Sign in to your workspace</h2>
            <p className="mt-1 text-sm text-white/50">Use your enterprise credentials to continue.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="text-xs font-medium text-white/65">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`mt-1.5 ${inputBase}`}
                  placeholder="you@enmasco.local"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-medium text-white/65">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputBase} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
                    >
                      {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-[50px] w-full items-center justify-center rounded-[14px] border border-sky-400/30 bg-gradient-to-b from-sky-500/90 to-sky-600/90 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(56,189,248,0.25)] transition-all duration-200 hover:from-sky-400 hover:to-sky-500 hover:shadow-[0_10px_30px_rgba(56,189,248,0.40)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Demo accounts card */}
            <div className="mt-6 rounded-[16px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-white/45">Demo Access</div>
              <div className="space-y-2">
                <CopyRow
                  icon={<UserCog className="h-4 w-4 text-sky-300" />}
                  label="CEO"
                  value="ceo@enmasco.local"
                  copied={copied === "ceo"}
                  onCopy={() => copy("ceo@enmasco.local", "ceo")}
                />
                <CopyRow
                  icon={<Mail className="h-4 w-4 text-sky-300" />}
                  label="Admin"
                  value="admin@enmasco.local"
                  copied={copied === "admin"}
                  onCopy={() => copy("admin@enmasco.local", "admin")}
                />
                <CopyRow
                  icon={<KeyRound className="h-4 w-4 text-sky-300" />}
                  label="Password"
                  value="admin123"
                  copied={copied === "pw"}
                  onCopy={() => copy("admin123", "pw")}
                />
              </div>
            </div>
          </GlassCard>

          {/* Footer */}
          <div className="mt-5 text-center text-[11px] leading-relaxed text-white/35">
            © 2026 ENMASCO · K2KAI Social Flow v1.0 Stable · Secure Enterprise Platform
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function CopyRow({
  icon,
  label,
  value,
  copied,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wide text-white/40">{label}</div>
        <div className="truncate text-xs text-white/80">{value}</div>
      </div>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      </button>
      {copied && (
        <span className="pointer-events-none absolute -top-8 right-2 rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-medium text-white shadow-lg">
          Copied
        </span>
      )}
    </div>
  );
}
