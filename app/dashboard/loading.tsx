const skeletons = ["w-2/5", "w-3/5", "w-1/2"];

export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-5" role="status" aria-label="Loading page">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
        <div className="h-5 w-44 rounded-md bg-white/[0.09]" />
        <div className="mt-2 h-3 w-72 max-w-full rounded bg-white/[0.055]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {skeletons.map((width, index) => (
          <div
            key={index}
            className="h-28 rounded-2xl border border-white/[0.065] bg-white/[0.025] p-4"
          >
            <div className="h-8 w-8 rounded-xl bg-sky-400/[0.08]" />
            <div className={`mt-4 h-3 rounded bg-white/[0.075] ${width}`} />
          </div>
        ))}
      </div>

      <div className="h-56 rounded-2xl border border-white/[0.065] bg-white/[0.02]" />
      <span className="sr-only">Loading dashboard content…</span>
    </div>
  );
}
