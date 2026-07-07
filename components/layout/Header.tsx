export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5" />

          <div>
            <h1 className="text-sm font-semibold text-white">
              ENMASCO K2 SOCIAL
            </h1>

            <p className="text-xs text-neutral-400">
              Enterprise Operating System
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
