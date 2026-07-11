import { formatDistanceToNowStrict, parseISO, format } from "date-fns";

export function relTime(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: false })
      .replace(" seconds", "s")
      .replace(" second", "s")
      .replace(" minutes", "m")
      .replace(" minute", "m")
      .replace(" hours", "h")
      .replace(" hour", "h")
      .replace(" days", "d")
      .replace(" day", "d");
  } catch {
    return "";
  }
}

export function fmtDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy · HH:mm");
  } catch {
    return iso;
  }
}

export function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy");
  } catch {
    return iso;
  }
}
