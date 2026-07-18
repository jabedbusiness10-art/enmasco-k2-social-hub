"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const CMS_OPTIONS = [
  { value: "WORDPRESS", label: "WordPress" },
  { value: "REST_API", label: "REST API" },
  { value: "RSS", label: "RSS / Atom (read-only)" },
  { value: "SITEMAP", label: "XML Sitemap (read-only)" },
  { value: "WEBHOOK", label: "Signed Webhook (inbound)" },
  { value: "NEXTJS", label: "Next.js" },
  { value: "HEADLESS", label: "Headless CMS" },
  { value: "LARAVEL", label: "Laravel" },
  { value: "CUSTOM", label: "Custom Website" },
  { value: "STATIC", label: "Static Website" },
];

const AUTH_OPTIONS = [
  { value: "NONE", label: "No authentication" },
  { value: "BEARER", label: "Bearer token" },
  { value: "API_KEY", label: "X-API-Key" },
  { value: "BASIC", label: "Basic (user:password)" },
  { value: "WORDPRESS_APP_PASSWORD", label: "WordPress app password" },
];

const FREQ_OPTIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "HOURLY", label: "Hourly" },
  { value: "DAILY", label: "Daily" },
  { value: "REALTIME", label: "Realtime" },
];

export default function WebsiteConnectModal({
  open,
  onClose,
  onConnect,
}: {
  open: boolean;
  onClose: () => void;
  onConnect: (payload: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    websiteName: "",
    websiteUrl: "",
    cmsType: "WORDPRESS",
    apiEndpoint: "",
    authMethod: "NONE",
    apiKey: "",
    webhookSecret: "",
    syncFrequency: "MANUAL",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onConnect({ ...form, apiEndpoint: form.apiEndpoint || undefined, apiKey: form.apiKey || undefined, webhookSecret: form.webhookSecret || undefined });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to connect website");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-sky-400/50";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0f] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Connect Website</h3>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/50">Website Name</label>
            <input className={inputCls} placeholder="ENMASCO Official" value={form.websiteName} onChange={(e) => set("websiteName", e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Website URL</label>
            <input className={inputCls} placeholder="https://www.enmasco.com" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-white/50">CMS Type</label>
              <select className={inputCls} value={form.cmsType} onChange={(e) => set("cmsType", e.target.value)}>
                {CMS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Sync Frequency</label>
              <select className={inputCls} value={form.syncFrequency} onChange={(e) => set("syncFrequency", e.target.value)}>
                {FREQ_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Provider Endpoint <span className="text-white/30">(optional)</span></label>
            <input className={inputCls} placeholder="https://example.com/api/content or /feed" value={form.apiEndpoint} onChange={(e) => set("apiEndpoint", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Authentication</label>
            <select className={inputCls} value={form.authMethod} onChange={(e) => set("authMethod", e.target.value)}>
              {AUTH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Credential <span className="text-white/30">(authenticated providers only)</span></label>
            <input type="password" autoComplete="new-password" className={inputCls} placeholder="Token, API key, or user:password" value={form.apiKey} onChange={(e) => set("apiKey", e.target.value)} required={form.authMethod !== "NONE"} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/50">Webhook Secret <span className="text-white/30">(24+ characters, optional)</span></label>
            <input type="password" autoComplete="new-password" minLength={24} className={inputCls} placeholder="HMAC signing secret" value={form.webhookSecret} onChange={(e) => set("webhookSecret", e.target.value)} />
          </div>
        </div>

        {error && <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</div>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Connecting…" : "Connect Website"}
        </button>
      </motion.form>
    </div>
  );
}
