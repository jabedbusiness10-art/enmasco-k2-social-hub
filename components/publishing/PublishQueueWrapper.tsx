import type { PublishJob } from "@/types/publishing";

type Props = {
  jobs: PublishJob[];
  selected: PublishJob | null;
  onSelect: (job: PublishJob) => void;
};

export default function PublishQueueWrapper({ jobs, selected, onSelect }: Props) {
  return (
    <div className="flex flex-col border-r border-white/5">
      <div className="flex-none border-b border-white/5 px-4 py-3 text-xs uppercase tracking-widest text-white/60">
        Publish Queue
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/60">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Platform</th>
              <th className="px-4 py-2 font-medium">Content</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Priority</th>
              <th className="px-4 py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => onSelect(job)}
                className={`cursor-pointer border-b border-white/5 transition hover:bg-white/[0.04] ${
                  selected?.id === job.id ? "bg-white/[0.06]" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2 text-xs text-white/70">
                  {new Date(job.scheduledAt).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-xs uppercase tracking-wide">
                  {job.platform}
                </td>
                <td className="px-4 py-2 text-xs text-white/90">{job.title}</td>
                <td className="px-4 py-2">
                  <StatusPill status={job.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-2 text-xs text-white/70">{job.priority}</td>
                <td className="px-4 py-2">
                  <ActionLinks job={job} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    QUEUED: "bg-sky-500/15 text-sky-300",
    PUBLISHING: "bg-amber-500/15 text-amber-300",
    PUBLISHED: "bg-emerald-500/15 text-emerald-300",
    FAILED: "bg-red-500/15 text-red-300",
    CANCELLED: "bg-white/10 text-white/70",
    RETRY: "bg-violet-500/15 text-violet-300",
    PENDING: "bg-white/10 text-white/70",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${map[status] ?? "bg-white/10 text-white/70"}`}>
      {status}
    </span>
  );
}

function ActionLinks({ job }: { job: PublishJob }) {
  return (
    <div className="flex items-center gap-2">
      <button className="text-xs text-sky-300 hover:text-sky-200">Edit</button>
      {job.status !== "SUCCESS" && (
        <button className="text-xs text-red-300 hover:text-red-200">Cancel</button>
      )}
      {job.status === "FAILED" && (
        <button className="text-xs text-amber-300 hover:text-amber-200">Retry</button>
      )}
    </div>
  );
}
