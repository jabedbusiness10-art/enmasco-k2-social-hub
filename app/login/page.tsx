"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Shield } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("ceo@enmasco.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [callback, setCallback] = useState("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get("callbackUrl");
    if (urlParam) setCallback(urlParam);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <GlassCard className="w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
            <Shield className="h-5 w-5 text-red-300" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">ENMASCO K2 SOCIAL</div>
            <div className="text-xs text-white/60">Secure workspace</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-white/70">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-white/20" />
          </div>
          <div>
            <label className="text-xs text-white/70">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-white/20" />
          </div>
          {error && <div className="text-xs text-red-300">{error}</div>}
          <Button variant="primary" className="w-full">{loading ? "Signing in..." : "Sign In"}</Button>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-3 text-[11px] text-white/70">
          Demo: CEO `ceo@enmasco.local`, Admin `admin@enmasco.local`. Password: `admin123`
        </div>
      </GlassCard>
    </div>
  );
}
