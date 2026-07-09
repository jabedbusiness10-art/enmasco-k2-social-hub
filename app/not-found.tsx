export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center text-white">
        <div className="text-sm font-semibold">Page not found</div>
        <div className="text-xs text-white/70">The requested page does not exist.</div>
      </div>
    </div>
  );
}
