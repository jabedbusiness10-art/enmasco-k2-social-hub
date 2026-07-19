"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { PlatformKey, PostStatus, ScheduledPost } from "@/types/scheduler";
import PlatformSelector from "./PlatformSelector";
import { PLATFORMS } from "./platformMeta";
import ModalPortal from "@/components/ui/ModalPortal";

export interface ScheduleFormValues {
  platform: PlatformKey;
  caption: string;
  hashtags: string;
  scheduleDate: string;
  scheduleTime: string;
  timezone: string;
  campaign: string;
  mediaUrl?: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: ScheduledPost | null;
  onSubmit: (
    post: ScheduledPost,
    action: "draft" | "schedule" | "publish"
  ) => void;
};

const TIMEZONES = [
  "Asia/Riyadh",
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export default function ScheduleModal({ open, onClose, initial, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    defaultValues: {
      platform: "facebook",
      caption: "",
      hashtags: "",
      scheduleDate: new Date().toISOString().slice(0, 10),
      scheduleTime: "09:00",
      timezone: "Asia/Riyadh",
      campaign: "",
      mediaUrl: "/logo.svg",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const d = new Date(initial.scheduledAt);
      reset({
        platform: initial.platform,
        caption: initial.caption,
        hashtags: initial.hashtags.join(" "),
        scheduleDate: d.toISOString().slice(0, 10),
        scheduleTime: d.toISOString().slice(11, 16),
        timezone: initial.timezone,
        campaign: initial.campaign ?? "",
        mediaUrl: initial.mediaUrl ?? "/logo.svg",
      });
    } else {
      reset({
        platform: "facebook",
        caption: "",
        hashtags: "",
        scheduleDate: new Date().toISOString().slice(0, 10),
        scheduleTime: "09:00",
        timezone: "Asia/Riyadh",
        campaign: "",
        mediaUrl: "/logo.svg",
      });
    }
  }, [open, initial, reset]);

  const platform = watch("platform");

  const build = (action: "draft" | "schedule" | "publish"): ScheduledPost | null => {
    const v = watch();
    const status: PostStatus =
      action === "draft" ? "DRAFT" : action === "publish" ? "PUBLISHING" : "SCHEDULED";
    const dt = new Date(`${v.scheduleDate}T${v.scheduleTime}:00`);
    return {
      id: initial?.id ?? `s${Date.now()}`,
      title: v.caption.split("\n")[0].slice(0, 40) || "Untitled Post",
      caption: v.caption,
      platform: v.platform,
      mediaUrl: v.mediaUrl,
      hashtags: v.hashtags
        .split(/\s+/)
        .map((h) => h.replace(/^#/, "").toUpperCase())
        .filter(Boolean),
      scheduledAt: isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString(),
      status,
      owner: initial?.owner ?? "MD Kazim",
      campaign: v.campaign || undefined,
      timezone: v.timezone,
      accent: PLATFORMS[v.platform].key === "facebook" ? "red" :
             v.platform === "instagram" ? "rose" :
             v.platform === "linkedin" ? "sky" : "violet",
    };
  };

  const submit = (action: "draft" | "schedule" | "publish") => {
    const post = build(action);
    if (post) onSubmit(post, action);
  };

  return (
    <ModalPortal lockScroll={open}>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0b0d]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {initial ? "Edit Scheduled Post" : "Create Schedule"}
                </h2>
                <p className="text-xs text-white/50">
                  Plan, draft and publish across connected platforms.
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(() => submit("schedule"))}
              className="flex flex-col gap-4"
            >
              {/* platform */}
              <Field label="Platform">
                <PlatformSelector
                  value={platform}
                  onChange={(p) => setValue("platform", p)}
                />
              </Field>

              {/* caption */}
              <Field label="Caption">
                <textarea
                  {...register("caption", { required: "Caption is required" })}
                  rows={3}
                  placeholder="What do you want to say?"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-400/40"
                />
                {errors.caption && <Err msg={errors.caption.message} />}
              </Field>

              {/* media */}
              <Field label="Media Upload">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={watch("mediaUrl") || "/logo.svg"} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-white/55">Mock upload — /logo.svg attached</span>
                    <span className="text-[10px] text-white/35">
                      Real S3/Cloudinary upload ready via future integration.
                    </span>
                  </div>
                </div>
              </Field>

              {/* hashtags */}
              <Field label="Hashtags">
                <input
                  {...register("hashtags")}
                  placeholder="#brand #promo #2026"
                  className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-400/40"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Schedule Date">
                  <input
                    type="date"
                    {...register("scheduleDate", { required: true })}
                    className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-red-400/40 [color-scheme:dark]"
                  />
                </Field>
                <Field label="Schedule Time">
                  <input
                    type="time"
                    {...register("scheduleTime", { required: true })}
                    className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-red-400/40 [color-scheme:dark]"
                  />
                </Field>
                <Field label="Timezone">
                  <select
                    {...register("timezone")}
                    className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-red-400/40 [&>option]:bg-[#0b0b0d]"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Campaign Name">
                <input
                  {...register("campaign")}
                  placeholder="e.g. Eid eCommerce Blitz"
                  className="h-9 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-red-400/40"
                />
              </Field>

              {/* actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => submit("draft")}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => submit("publish")}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
                >
                  Publish Now
                </button>
                <button
                  type="submit"
                  className="rounded-xl border border-red-500/40 bg-red-500/20 px-5 py-2 text-xs font-semibold text-white shadow-[0_0_24px_rgba(248,113,113,0.25)] transition hover:bg-red-500/30"
                >
                  Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ModalPortal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
        {label}
      </label>
      {children}
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className="text-[11px] text-red-300">{msg}</span>;
}
