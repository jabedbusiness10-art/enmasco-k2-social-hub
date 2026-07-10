"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SocialPlatform } from "@/types/company-social";
import { PLATFORM_META } from "@/types/company-social";

const PLATFORMS = Object.keys(PLATFORM_META) as SocialPlatform[];

export default function ConnectDialog({
  open,
  onClose,
  onConnect,
}: {
  open: boolean;
  onClose: () => void;
  onConnect: (payload: any) => Promise<void>;
}) {
  const [platform, setPlatform] = useState<SocialPlatform>("FACEBOOK");
  const [accountName, setAccountName] = useState("");
  const [accountHandle, setAccountHandle] = useState("");
  const [accountId, setAccountId] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

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
      // reset
      setAccountName("");
      setAccountHandle("");
      setAccountId("");
      setProfileUrl("");
      setAccessToken("");
      setRefreshToken("");
      setExpiresAt("");
    } catch (e: any) {
      setError(e.message ?? "Connection failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none placeholder:text-white/40 focus:border-sky-400/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0e1320] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Connect Social Account</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/60">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className={inputCls}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_META[p].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Account Name *</label>
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="ENMASCO Official" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Handle</label>
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

          {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>}

          <button
            onClick={submit}
            disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Connecting…" : "Connect"}
          </button>
          <p className="text-center text-[11px] text-white/40">
            Tokens are encrypted (AES-256-GCM) before storage. Real OAuth flows can be wired in via the same service.
          </p>
        </div>
      </div>
    </div>
  );
}
