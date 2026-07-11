"use client";

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useRef } from "react";

/* ------------------------------------------------------------------ */
/*  SectionCard — groups a heading + body inside a glass surface       */
/* ------------------------------------------------------------------ */
export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)]", className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70">{title}</h3>
          {description && <p className="mt-1 text-xs text-white/40">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

/* ------------------------------------------------------------------ */
/*  TextField                                                         */
/* ------------------------------------------------------------------ */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/60">
        {label}
        {required && <span className="ml-1 text-red-300">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition focus:border-sky-300 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
      />
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="resize-y rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition focus:border-sky-300 focus:shadow-[0_0_0_1px_rgba(56,189,248,0.3)]"
      />
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  SelectField                                                       */
/* ------------------------------------------------------------------ */
export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition focus:border-sky-300"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0b0b10]">
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  ToggleField                                                       */
/* ------------------------------------------------------------------ */
export function ToggleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]"
    >
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-white/40">{description}</div>}
      </div>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          value ? "bg-sky-500/80" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            value ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  SliderField                                                       */
/* ------------------------------------------------------------------ */
export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-white/60">{label}</span>
        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-sky-200">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-sky-400"
      />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  ColorField                                                        */
/* ------------------------------------------------------------------ */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none focus:border-sky-300"
        />
      </div>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/*  UploadField — drag/drop + file picker (base64 preview)            */
/* ------------------------------------------------------------------ */
export function UploadField({
  label,
  value,
  onChange,
  accept = "image/*",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accept?: string;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <div
        onClick={() => ref.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-6 text-center transition hover:border-sky-400/40 hover:bg-white/[0.05]"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-16 w-16 rounded-lg object-contain" />
        ) : (
          <Upload className="h-6 w-6 text-white/40" />
        )}
        <span className="text-xs text-white/50">{value ? "Click to replace" : "Click to upload"}</span>
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => onChange(String(reader.result));
          reader.readAsDataURL(f);
        }}
      />
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MultiSelect chips                                                  */
/* ------------------------------------------------------------------ */
export function ChipMultiSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/60">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                active
                  ? "border-sky-300/50 bg-sky-500/15 text-sky-100"
                  : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
