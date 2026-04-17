"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { startAnalysis } from "@/lib/api";
import type { AnalyzeRequest, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const defaultDates = {
  start_date: "2024-01-01",
  end_date: "2024-03-31",
};

export function SearchForm() {
  const router = useRouter();
  const [form, setForm] = useState<AnalyzeRequest>({
    search_tag: "",
    ...defaultDates,
    platforms: ["youtube"],
    max_videos: 20,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function togglePlatform(platform: Platform) {
    setForm((current) => {
      const exists = current.platforms.includes(platform);
      const nextPlatforms = exists
        ? current.platforms.filter((value) => value !== platform)
        : [...current.platforms, platform];

      return {
        ...current,
        platforms: nextPlatforms,
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.search_tag.trim()) {
      setError("Search tag is required.");
      return;
    }

    if (form.start_date >= form.end_date) {
      setError("Start date must be before end date.");
      return;
    }

    if (!form.platforms.length) {
      setError("Select at least one platform.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await startAnalysis({
        ...form,
        search_tag: form.search_tag.trim(),
      });
      router.push(`/results/${response.run_id}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to start analysis.";
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

      <div className="relative space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <label className="space-y-3">
            <span className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
              Search Tag
            </span>
            <input
              value={form.search_tag}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  search_tag: event.target.value,
                }))
              }
              placeholder="crypto tax india"
              className="w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/35 focus:bg-slate-950/65"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-3">
              <span className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
                Start Date
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    start_date: event.target.value,
                  }))
                }
                className="w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-4 text-base text-white outline-none transition focus:border-cyan-300/35 focus:bg-slate-950/65"
              />
            </label>
            <label className="space-y-3">
              <span className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
                End Date
              </span>
              <input
                type="date"
                value={form.end_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    end_date: event.target.value,
                  }))
                }
                className="w-full rounded-[24px] border border-white/10 bg-slate-950/45 px-5 py-4 text-base text-white outline-none transition focus:border-cyan-300/35 focus:bg-slate-950/65"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
              Platforms
            </p>
            <div className="flex flex-wrap gap-3">
              {(["youtube", "reddit"] as Platform[]).map((platform) => {
                const checked = form.platforms.includes(platform);

                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={cn(
                      "rounded-full border px-4 py-3 text-sm font-medium capitalize transition",
                      checked
                        ? "border-cyan-300/30 bg-cyan-300/12 text-white"
                        : "border-white/10 bg-white/6 text-slate-300 hover:border-white/20 hover:text-white",
                    )}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
                Max Videos
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
                setForm((current) => ({
                  ...current,
                  max_videos: Number(event.target.value),
                }))
              }
              className="koinx-range w-full"
            />
          </div>
        </div>

        {error ? (
          <p className="rounded-2xl border border-rose-300/14 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl text-sm leading-7 text-slate-300">
            Discover recurring audience pain points, map them to high-conviction
            content types, and turn raw comments into integratable editorial
            signals for the next campaign.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-w-[188px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#7ef4ff,#5be4c6)] px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
    </form>
  );
}
