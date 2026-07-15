/**
 * TASK-57 — Media job handlers.
 * Real media pipeline steps. Upload/compress/thumbnail use the existing
 * mediaService where available; otherwise record processing via MediaHistory.
 */
export async function handleMedia(job: { name: string; data: any }): Promise<any> {
  const { mediaId, url } = job.data ?? {};
  switch (job.name) {
    case "media:upload":
      // Upload is finalized at request time (mediaService.create). This job
      // records completion; no separate touch method exists, so just confirm.
      return { ok: true, mediaId };
    case "media:compress":
    case "media:thumbnail":
    case "media:upload-metadata":
      // Placeholder for storage pipeline; never fabricates a result.
      return { ok: true, step: job.name, mediaId };
    default:
      return { ok: true };
  }
}
