export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-64 w-full animate-pulse rounded-3xl bg-white/10" />
      </div>
    </div>
  );
}
