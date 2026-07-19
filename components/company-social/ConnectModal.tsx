"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ArrowRight, Check } from "lucide-react";
import type { SocialPlatform } from "@/types/company-social";
import { PLATFORM_META } from "@/types/company-social";
import { PLATFORM_UI } from "@/lib/social-ui";

function PlatformGlyph({ platform, color }: { platform: SocialPlatform; color: string }) {
  const ring = { backgroundColor: `${color}22`, color };
  return (
    <span style={ring} className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black">
      {platform === "FACEBOOK" ? "f" : platform === "INSTAGRAM" ? "◉" : platform === "LINKEDIN" ? "in" : platform === "YOUTUBE" ? "▶" : platform === "X" ? "X" : "◇"}
    </span>
  );
}

export default function ConnectModal({
  open,
  onClose,
  onConnect,
  initialPlatform,
}: {
  open: boolean;
  onClose: () => void;
  onConnect: (payload: any) => Promise<void>;
  initialPlatform?: SocialPlatform | null;
}) {
  const platforms = Object.keys(PLATFORM_META) as SocialPlatform[];
  const [step, setStep] = useState<"pick" | "form">(initialPlatform ? "form" : "pick");
  const [platform, setPlatform] = useState<SocialPlatform>(initialPlatform ?? "FACEBOOK");

  // form state
  const [accountName, setAccountName] = useState("");
  const [accountHandle, setAccountHandle] = useState("");
  const [accountId, setAccountId] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function choose(p: SocialPlatform) {
    setPlatform(p);
    setStep("form");
  }

  async function submit() {
    setError(null);
    if (!accountName.trim() || !accessToken.trim()) {
      setError("Account name and access token are required.");
      return;
    }
    setSaving(true);
    try {
      await onConnect({
        platform,
        accountName: accountName.trim(),
        accountHandle: accountHandle.trim() || null,
        accountId: accountId.trim() || null,
        profileUrl: profileUrl.trim() || null,
        accessToken: accessToken.trim(),
        refreshToken: refreshToken.trim() || null,
        expiresAt: expiresAt || null,
      });
      setAccountName("");
      setAccountHandle("");
      setAccountId("");
      setProfileUrl("");
      setAccessToken("");
      setRefreshToken("");
      setExpiresAt("");
      setStep("pick");
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Connection failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400/50";
  const meta = PLATFORM_META[platform];
  const ui = PLATFORM_UI[platform];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0c111d] p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        {step === "pick" ? (
          <>
            <h2 className="text-lg font-bold text-white">Connect a Platform</h2>
            <p className="mt-1 text-xs text-white/50">Choose an official company account to connect securely.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {platforms.map((p) => {
                const pm = PLATFORM_META[p];
                const pu = PLATFORM_UI[p];
                return (
                  <motion.button
                    key={p}
                    whileHover={{ y: -3 }}
                    onClick={() => choose(p)}
                    className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-white/25"
                  >
                    <div className="flex items-center justify-between">
                      <PlatformGlyph platform={p} color={pm.color} />
                      <ArrowRight className="h-4 w-4 text-white/40" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{pm.label}</div>
                      <div className="text-xs text-white/55">{pu.description}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pu.requirements.map((r) => (
                        <span key={r} className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
                          {r}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setStep("pick")} className="mb-3 text-xs text-white/50 hover:text-white">
              ← Back to platforms
            </button>
            <div className="flex items-center gap-3">
              <PlatformGlyph platform={platform} color={meta.color} />
              <div>
                <h2 className="text-lg font-bold text-white">Connect {meta.label}</h2>
                <p className="text-xs text-white/50">{ui.apiVersion} · {ui.platformType}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-white/60">Account Name *</label>
                <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="ENMASCO Official" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-white/60">Handle / Username</label>
                  <input value={accountHandle} onChange={(e) => setAccountHandle(e.target.value)} placeholder="@enmasco" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/60">Account ID</label>
                  <input value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">Profile URL</label>
                <input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://..." className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/60">Access Token * (encrypted at rest)</label>
                <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} type="password" placeholder="Paste token" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-white/60">Refresh Token</label>
                  <input value={refreshToken} onChange={(e) => setRefreshToken(e.target.value)} type="password" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/60">Expires At</label>
                  <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} type="date" className={inputCls} />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>
              )}

              <button
                onClick={submit}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Connecting…" : (<><Check className="h-4 w-4" /> Connect {meta.label}</>)}
              </button>
              <p className="text-center text-[11px] text-white/40">
                Tokens are encrypted (AES-256-GCM) before storage. Real OAuth flows can be wired in via the same service.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
