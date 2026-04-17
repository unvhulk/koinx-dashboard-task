import { format, parseISO } from "date-fns";

import type { ContentType, Sentiment } from "@/lib/types";

export const contentTypeStyles: Record<ContentType, string> = {
  blog: "bg-sky-400/12 text-sky-200 ring-1 ring-inset ring-sky-300/25",
  video: "bg-amber-400/12 text-amber-200 ring-1 ring-inset ring-amber-300/25",
  social: "bg-emerald-400/12 text-emerald-200 ring-1 ring-inset ring-emerald-300/25",
};

export const contentTypeSolid: Record<ContentType, string> = {
  blog: "#4da7ff",
  video: "#f8a63a",
  social: "#45d495",
};

export const sentimentMap: Record<
  Sentiment,
  { icon: string; className: string; label: string }
> = {
  confused: {
    icon: "?",
    label: "Confused",
    className: "bg-rose-400/12 text-rose-200 ring-1 ring-inset ring-rose-300/20",
  },
  concerned: {
    icon: "!",
    label: "Concerned",
    className: "bg-amber-400/12 text-amber-200 ring-1 ring-inset ring-amber-300/20",
  },
  curious: {
    icon: "i",
    label: "Curious",
    className: "bg-fuchsia-400/12 text-fuchsia-200 ring-1 ring-inset ring-fuchsia-300/20",
  },
  positive: {
    icon: "+",
    label: "Positive",
    className: "bg-emerald-400/12 text-emerald-200 ring-1 ring-inset ring-emerald-300/20",
  },
};

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDateRange(start: string, end: string) {
  return `${format(parseISO(start), "dd MMM yyyy")} - ${format(parseISO(end), "dd MMM yyyy")}`;
}

export function formatRunDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy, hh:mm a");
}
