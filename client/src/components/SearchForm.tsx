"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { startAnalysis } from "@/lib/api";
import type { AnalyzeRequest, VideoDuration, SortOrder } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultDates = {
  start_date: "2025-04-01",
  end_date: "2025-07-31",
};

const VIEW_PRESETS = [
  { label: "Any", value: 0 },
  { label: "1K+", value: 1_000 },
  { label: "10K+", value: 10_000 },
  { label: "100K+", value: 100_000 },
  { label: "1M+", value: 1_000_000 },
];

const SUB_PRESETS = [
  { label: "Any", value: 0 },
  { label: "1K+", value: 1_000 },
  { label: "10K+", value: 10_000 },
  { label: "100K+", value: 100_000 },
  { label: "1M+", value: 1_000_000 },
];

const COMMENT_PRESETS = [
  { label: "Any", value: 0 },
  { label: "10+", value: 10 },
  { label: "50+", value: 50 },
  { label: "200+", value: 200 },
];

const DURATION_OPTIONS: { label: string; value: VideoDuration; hint: string }[] = [
  { label: "Any", value: "any", hint: "" },
  { label: "Short", value: "short", hint: "< 4 min" },
  { label: "Medium", value: "medium", hint: "4–20 min" },
  { label: "Long", value: "long", hint: "> 20 min" },
];

const SORT_OPTIONS: { label: string; value: SortOrder }[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Most viewed", value: "viewCount" },
  { label: "Newest", value: "date" },
  { label: "Top rated", value: "rating" },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${n / 1_000_000}M`;
  if (n >= 1_000) return `${n / 1_000}K`;
  return String(n);
}

export function SearchForm() {
  const router = useRouter();
  const [form, setForm] = useState<AnalyzeRequest>({
    search_tag: "",
    ...defaultDates,
    platforms: ["youtube"],
    max_videos: 20,
    enhanced_search: false,
    min_views: 0,
    min_subscribers: 0,
    min_comments: 0,
    video_duration: "any",
    sort_order: "relevance",
    india_focus: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.search_tag.trim()) {
      setError("Please enter a topic to search for.");
      return;
    }

    if (form.start_date >= form.end_date) {
      setError("Start date must be before end date.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await startAnalysis({
        ...form,
        search_tag: form.search_tag.trim(),
        platforms: ["youtube"],
      });
      router.push(`/results/${response.run_id}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-6 shadow-[0_36px_120px_rgba(2,8,23,0.35)] backdrop-blur-2xl sm:p-8"
    >
      <div className="absolute -right-24 top-0 h-52 w-52 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />

      <div className="relative space-y-6">

        {/* Topic */}
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/50">
            Topic or keyword
          </span>
          <input
            value={form.search_tag}
            onChange={(event) =>
              setForm((current) => ({ ...current, search_tag: event.target.value }))
            }
            placeholder="e.g. crypto tax india, bitcoin capital gains"
            className="w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/35 focus:bg-slate-950/65"
          />
          <p className="px-1 text-xs text-slate-400/60">
            Enter the topic your audience is talking about
          </p>
        </label>

        {/* Date range */}
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/50">
            Date range
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="px-1 text-xs text-slate-400/60">From</span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, start_date: event.target.value }))
                }
                className="w-full rounded-[20px] border border-white/10 bg-slate-950/45 px-4 py-3.5 text-sm text-white outline-none transition [color-scheme:dark] focus:border-cyan-300/35 focus:bg-slate-950/65"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="px-1 text-xs text-slate-400/60">To</span>
              <input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((current) => ({ ...current, end_date: event.target.value }))
                }
                className="w-full rounded-[20px] border border-white/10 bg-slate-950/45 px-4 py-3.5 text-sm text-white outline-none transition [color-scheme:dark] focus:border-cyan-300/35 focus:bg-slate-950/65"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/50">
            Platform
          </p>
          <div className="mt-2 inline-flex rounded-full border border-cyan-300/24 bg-cyan-300/12 px-4 py-2 text-sm font-medium text-white">
            YouTube
          </div>
          <p className="mt-2 px-1 text-xs text-slate-400/60">
            YouTube-only analysis is enabled for now.
          </p>
        </div>

        {/* Enhanced search toggle */}
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">Enhanced search</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-400/65">
              AI generates more search variants to find more diverse topics — takes ~2× longer
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.enhanced_search}
            onClick={() => setForm((c) => ({ ...c, enhanced_search: !c.enhanced_search }))}
            className={cn(
              "mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
              form.enhanced_search
                ? "border-cyan-300/40 bg-cyan-300/25"
                : "border-white/15 bg-white/8",
            )}
          >
            <span
              className={cn(
                "block h-4 w-4 rounded-full transition-transform duration-200",
                form.enhanced_search
                  ? "translate-x-6 bg-cyan-300"
                  : "translate-x-1 bg-slate-400",
              )}
            />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/50">
              How many videos to scan
            </p>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-sm text-white">
              {form.max_videos}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={form.max_videos}
            onChange={(event) =>
              setForm((current) => ({ ...current, max_videos: Number(event.target.value) }))
            }
            className="koinx-range w-full"
          />
          <p className="px-1 text-xs text-slate-400/60">
            More videos = more comments = better results, but takes longer
          </p>
        </div>

        {/* Quality filters */}
        <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/50">
            Source quality filters
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400/70">Min video views</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white">
                {form.min_views === 0 ? "Any" : formatCount(form.min_views)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {VIEW_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, min_views: preset.value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    form.min_views === preset.value
                      ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-100"
                      : "border-white/10 bg-white/6 text-slate-300/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400/70">Min channel subscribers</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white">
                {form.min_subscribers === 0 ? "Any" : formatCount(form.min_subscribers)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUB_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, min_subscribers: preset.value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    form.min_subscribers === preset.value
                      ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-100"
                      : "border-white/10 bg-white/6 text-slate-300/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Min comment count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400/70">Min comments on video</span>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-white">
                {form.min_comments === 0 ? "Any" : `${form.min_comments}+`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMENT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, min_comments: preset.value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    form.min_comments === preset.value
                      ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-100"
                      : "border-white/10 bg-white/6 text-slate-300/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400/60">
            Filters out low-quality sources. Strict filters may reduce video count.
          </p>
        </div>

        {/* Search settings — native YT params, no extra quota cost */}
        <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/50">
            Search settings
          </p>

          <div className="space-y-2">
            <span className="text-xs text-slate-400/70">Sort results by</span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, sort_order: opt.value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    form.sort_order === opt.value
                      ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-100"
                      : "border-white/10 bg-white/6 text-slate-300/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-slate-400/70">Video duration</span>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, video_duration: opt.value }))}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    form.video_duration === opt.value
                      ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-100"
                      : "border-white/10 bg-white/6 text-slate-300/70 hover:bg-white/10 hover:text-white",
                  )}
                  title={opt.hint}
                >
                  {opt.label}{opt.hint ? ` · ${opt.hint}` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* India focus toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-white">India focus</p>
              <p className="mt-0.5 text-xs text-slate-400/65">
                Biases results toward India-published content
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.india_focus}
              onClick={() => setForm((c) => ({ ...c, india_focus: !c.india_focus }))}
              className={cn(
                "h-6 w-11 shrink-0 rounded-full border transition-colors duration-200",
                form.india_focus
                  ? "border-cyan-300/40 bg-cyan-300/25"
                  : "border-white/15 bg-white/8",
              )}
            >
              <span
                className={cn(
                  "block h-4 w-4 rounded-full transition-transform duration-200",
                  form.india_focus ? "translate-x-6 bg-cyan-300" : "translate-x-1 bg-slate-400",
                )}
              />
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-rose-300/14 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xs text-sm leading-6 text-slate-400/70">
            Takes 30–60 seconds. We'll scan comments and group them into content ideas for you.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#7ef4ff,#5be4c6)] px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Finding ideas..." : "Find content ideas"}
          </button>
        </div>
      </div>
    </form>
  );
}
