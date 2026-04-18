import { parseISO } from "date-fns";

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

export function formatDateRange(start: string, end: string): string {
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
  return `${fmt.format(parseApiDate(start))} – ${fmt.format(parseApiDate(end))}`;
}

export function formatCompactDateRange(start: string, end: string): string {
  const startDate = parseApiDate(start);
  const endDate = parseApiDate(end);

  const sameYear =
    startDate.getUTCFullYear() === endDate.getUTCFullYear();
  const sameMonth =
    sameYear && startDate.getUTCMonth() === endDate.getUTCMonth();

  if (sameMonth) {
    return `${String(startDate.getUTCDate()).padStart(2, "0")} – ${new Intl.DateTimeFormat(
      undefined,
      { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" },
    ).format(endDate)}`;
  }

  if (sameYear) {
    return `${new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(startDate)} – ${new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(endDate)}`;
  }

  return formatDateRange(start, end);
}

export function formatRunDate(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parseApiDate(date));
}

export function formatRunDateCompact(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(parseApiDate(date));
}

export function formatRunTime(date: string): string {
  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(parseApiDate(date));
}

export function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function outlineToMarkdown(outline: {
  title: string;
  intro: string;
  sections: { heading: string; points: string[] }[];
  conclusion: string;
}): string {
  const lines: string[] = [`# ${outline.title}`, "", outline.intro, ""];
  for (const section of outline.sections) {
    lines.push(`## ${section.heading}`);
    for (const point of section.points) {
      lines.push(`- ${point}`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push(outline.conclusion);
  return lines.join("\n");
}

function parseApiDate(value: string) {
  const normalized = hasExplicitTimezone(value) || isDateOnly(value) ? value : `${value}Z`;
  return parseISO(normalized);
}

function hasExplicitTimezone(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
