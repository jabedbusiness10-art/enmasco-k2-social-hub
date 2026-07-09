"use client";

type SaveBarProps = {
  onSave?: () => void;
  onReset: () => void;
  isSaving?: boolean;
};

export default function SaveBar({ onSave, onReset, isSaving }: SaveBarProps) {
  return (
    <div className="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="rounded-xl border border-white/10 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20 disabled:opacity-40"
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
