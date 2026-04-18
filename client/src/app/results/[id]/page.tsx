"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { FilterBar } from "@/components/FilterBar";
import { FrequencyChart } from "@/components/FrequencyChart";
import { StatusPoller } from "@/components/StatusPoller";
import { TopicCard } from "@/components/TopicCard";
import type { ContentType, Platform } from "@/lib/types";
import { formatDateRange, formatRunDate } from "@/lib/utils";

function ProcessingState({
  searchTag,
  startDate,
  endDate,
  createdAt,
  status,
}: {
  searchTag?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  status: "pending" | "processing";
}) {
  const isProcessing = status === "processing";

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[36px] border border-cyan-200/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))] p-7 shadow-[0_30px_100px_rgba(2,8,23,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(126,244,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(91,228,198,0.1),transparent_30%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/12 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100/70">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-200 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-200" />
              </span>
              {isProcessing ? "Processing comments" : "Preparing analysis run"}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-slate-300/50">
                Search Tag
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white sm:text-5xl">
                {searchTag || "Loading run details..."}
              </h1>
            </div>

            <p className="max-w-2xl text-base leading-8 text-slate-300/78">
              {isProcessing
                ? "We’ve started pulling videos, extracting comments, and clustering audience themes. The dashboard will unlock automatically once the run is complete."
                : "Your request is queued. As soon as the backend starts processing, this view will transition into the live analysis state."}
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-slate-300/80">
              {startDate && endDate ? (
                <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                  {formatDateRange(startDate, endDate)}
                </span>
              ) : null}
              {createdAt ? (
                <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                  Run created {formatRunDate(createdAt)}
                </span>
              ) : null}
              <span className="rounded-full border border-cyan-300/18 bg-cyan-300/12 px-4 py-2 text-cyan-100">
                {status}
              </span>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950/30 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="spinner-ring relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-100/30 border-t-cyan-100" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/55">
                  Live poll
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
                  Checking every 3 seconds
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                "Collecting matching videos from selected platforms",
                "Fetching audience comments and normalizing responses",
                "Clustering themes and preparing suggested content angles",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200/80"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/16 bg-cyan-300/10 text-xs font-semibold text-cyan-100">
                    0{index + 1}
                  </span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300/50">
                Topic Momentum
              </p>
              <div className="mt-3 h-10 w-64 rounded-2xl bg-white/8" />
            </div>
          </div>
          <div className="grid h-[320px] grid-cols-6 items-end gap-4">
            {[42, 70, 55, 82, 64, 48].map((height, index) => (
              <div key={height + index} className="space-y-3">
                <div
                  className="animate-loading-shimmer rounded-t-[18px] bg-[linear-gradient(180deg,rgba(126,244,255,0.45),rgba(126,244,255,0.14))]"
                  style={{ height: `${height}%` }}
                />
                <div className="mx-auto h-3 w-16 rounded-full bg-white/8" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          {["Videos", "Comments", "Topics"].map((label) => (
            <div
              key={label}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5"
            >
              <div className="animate-loading-shimmer h-12 w-24 rounded-2xl bg-white/10" />
              <p className="mt-3 text-sm uppercase tracking-[0.24em] text-slate-300/45">
                {label} incoming
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="h-3 w-28 rounded-full bg-white/8" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`content-filter-${index}`}
                  className="h-10 w-20 rounded-full bg-white/8"
                />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-white/8" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`platform-filter-${index}`}
                  className="h-10 w-24 rounded-full bg-white/8"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`topic-skeleton-${index}`}
            className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-6"
          >
            <div className="flex gap-3">
              <div className="h-8 w-20 rounded-full bg-white/8" />
              <div className="h-8 w-24 rounded-full bg-white/8" />
            </div>
            <div className="mt-6 h-8 w-4/5 rounded-2xl bg-white/8" />
            <div className="mt-4 h-4 w-28 rounded-full bg-white/8" />
            <div className="mt-6 space-y-3 rounded-2xl border border-white/6 bg-black/10 p-4">
              <div className="h-4 w-full rounded-full bg-white/8" />
              <div className="h-4 w-5/6 rounded-full bg-white/8" />
            </div>
            <div className="mt-6 h-10 w-40 rounded-full bg-white/8" />
          </div>
        ))}
      </section>
    </section>
  );
}

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const [contentType, setContentType] = useState<ContentType | "all">("all");
  const [platform, setPlatform] = useState<Platform | "all">("all");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <StatusPoller runId={params.id}>
        {({ data, error, loading, retry }) => {
          if (loading && !data) {
            return (
              <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
                <div className="spinner-ring relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-100/30 border-t-cyan-100" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/55">
                    Analysis in progress
                  </p>
                  <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
                    Fetching videos and comments...
                  </h1>
                  <p className="max-w-lg text-slate-300/74">
                    Polling the backend every 3 seconds until the run completes.
                  </p>
                </div>
              </section>
            );
          }

          if (error && !data) {
            return (
              <section className="rounded-[36px] border border-rose-300/16 bg-rose-300/10 p-8 text-center">
                <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">
                  Unable to fetch the analysis run.
                </h1>
                <p className="mt-3 text-slate-200/75">{error}</p>
                <button
                  type="button"
                  onClick={() => void retry()}
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Retry
                </button>
              </section>
            );
          }

          if (!data) {
            return null;
          }

          if (data.status === "pending" || data.status === "processing") {
            return (
              <ProcessingState
                searchTag={data.search_tag}
                startDate={data.start_date}
                endDate={data.end_date}
                createdAt={data.created_at}
                status={data.status}
              />
            );
          }

          if (data.status === "failed") {
            return (
              <section className="rounded-[36px] border border-rose-300/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-8">
                <p className="text-xs uppercase tracking-[0.26em] text-rose-100/65">
                  Run failed
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white">
                  The analysis could not be completed.
                </h1>
                <p className="mt-4 max-w-2xl text-slate-300/75">
                  Check the backend logs, then retry this run or trigger a fresh
                  analysis from the home page.
                </p>
                <button
                  type="button"
                  onClick={() => void retry()}
                  className="mt-8 rounded-full bg-[linear-gradient(135deg,#7ef4ff,#5be4c6)] px-6 py-3 text-sm font-semibold text-slate-950"
                >
                  Retry
                </button>
              </section>
            );
          }

          const insights = data.insights ?? [];
          const hasActiveFilters = contentType !== "all" || platform !== "all";
          const filteredInsights = insights.filter((insight) => {
            const matchesContentType =
              contentType === "all" || insight.content_type === contentType;
            const matchesPlatform =
              platform === "all" || insight.platform === platform;

            return matchesContentType && matchesPlatform;
          });
          const hasNoResults =
            data.video_count === 0 && data.comment_count === 0 && insights.length === 0;

          return (
            <div className="space-y-8">
              <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-7 shadow-[0_30px_100px_rgba(2,8,23,0.35)]">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/55">
                    Search Tag
                  </p>
                  <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white">
                    {data.search_tag}
                  </h1>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300/80">
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                      {formatDateRange(data.start_date, data.end_date)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                      Run created {formatRunDate(data.created_at)}
                    </span>
                    <span className="rounded-full border border-cyan-300/18 bg-cyan-300/12 px-4 py-2 text-cyan-100">
                      {data.status}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  {[
                    [`${data.video_count}`, "videos analyzed"],
                    [`${data.comment_count}`, "comments processed"],
                    [`${insights.length}`, "topics found"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-[28px] border border-white/10 bg-white/5 p-5"
                    >
                      <p className="text-4xl font-semibold text-white">{value}</p>
                      <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-300/50">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {hasNoResults ? (
                <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.28)]">
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/55">
                    No matching content found
                  </p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-white">
                    No videos were found for this tag and date range.
                  </h2>
                  <p className="mt-4 max-w-2xl text-slate-300/76">
                    The run completed, but there were no YouTube results to analyze,
                    so no comments or topic clusters could be generated. Try widening
                    the date range, changing the search tag, or adding another platform.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300/80">
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                      0 videos found
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                      0 comments analyzed
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-4 py-2">
                      0 topics generated
                    </span>
                  </div>
                </section>
              ) : (
                <FrequencyChart insights={filteredInsights} />
              )}

              <FilterBar
                contentType={contentType}
                platform={platform}
                onContentTypeChange={setContentType}
                onPlatformChange={setPlatform}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">
                    Topic coverage
                  </p>
                  <p className="mt-2 text-lg text-white">
                    {hasActiveFilters
                      ? `${filteredInsights.length} of ${insights.length} topics`
                      : `${insights.length} topics`}
                  </p>
                </div>
                {hasActiveFilters ? (
                  <p className="text-sm text-slate-300/68">
                    Filters are showing a narrower slice of the full run.
                  </p>
                ) : null}
              </div>

              {error ? (
                <p className="rounded-2xl border border-amber-300/14 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  Polling warning: {error}
                </p>
              ) : null}

              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredInsights.map((insight) => (
                  <TopicCard
                    key={`${insight.topic}-${insight.platform}`}
                    insight={insight}
                  />
                ))}
              </section>

              {!filteredInsights.length ? (
                <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 text-center text-slate-300/72">
                  {hasActiveFilters
                    ? "No topics match the active filters."
                    : "No topics were generated for this run."}
                </div>
              ) : null}
            </div>
          );
        }}
      </StatusPoller>
    </div>
  );
}
