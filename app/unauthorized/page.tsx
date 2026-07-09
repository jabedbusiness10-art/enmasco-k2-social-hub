export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
      <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
        <div className="text-sm font-semibold">Unauthorized</div>
        <div className="text-xs text-white/70">You do not have permission to access this module.</div>
      </div>
    </div>
  );
}
