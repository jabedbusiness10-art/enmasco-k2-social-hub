export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5" />

          <div>
            <h1 className="text-sm font-bold tracking-[0.3px] text-white">
              K2KAI Social Flow
            </h1>

            <p className="mt-0.5 text-[12px] font-medium uppercase tracking-[2px] text-white/60">
              by ENMASCO
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="text-xs text-neutral-400">
          Security • Automation • AI
        </div>
      </div>
    </header>
  );
}
