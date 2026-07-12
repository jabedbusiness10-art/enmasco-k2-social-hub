"use client";

export default function UserProfile() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <img
          src="/avatar.png"
          alt="User Avatar"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="hidden text-left md:block">
        <p className="text-sm font-medium text-white">MD Kazim</p>
        <p className="text-[10px] uppercase tracking-widest text-neutral-400">Team</p>
      </div>
    </div>
  );
}
