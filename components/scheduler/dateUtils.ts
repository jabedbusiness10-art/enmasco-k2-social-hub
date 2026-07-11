import { format, formatDistanceToNowStrict, isToday, isSameDay, parseISO } from "date-fns";

export function fmtDate(iso: string): string {
  return format(parseISO(iso), "dd MMM yyyy");
}

export function fmtTime(iso: string): string {
  return format(parseISO(iso), "hh:mm a");
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
}

export function relTime(iso: string): string {
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
}

export { isToday, isSameDay, parseISO };
