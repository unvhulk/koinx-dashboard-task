"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { getHistory } from "@/lib/api";
import type { AnalysisRun } from "@/lib/types";
import {
  formatCompactDateRange,
  formatRunDateCompact,
  formatRunTime,
} from "@/lib/utils";

function Platforms({ platforms }: { platforms?: AnalysisRun["platforms"] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(platforms ?? ["youtube"]).map((platform) => (
        <span
          key={platform}
          className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-slate-300/70"
        >
          {platform === "twitter" ? "X" : platform}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: AnalysisRun["status"] }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-100">
      {status}
    </span>
  );
}

function EmptyRow({
  children,
  colSpan,
}: {
  children: ReactNode;
  colSpan: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center text-slate-300/70">
        {children}
      </td>
    </tr>
  );
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number | undefined;
    let cancelled = false;

    async function load() {
      try {
        const response = await getHistory();
        if (cancelled) return;
        setRuns(response);
        setError(null);
        const hasActive = response.some(
          (r) => r.status === "pending" || r.status === "processing",
        );
        if (!hasActive && intervalId) {
          window.clearInterval(intervalId);
        }
      } catch (fetchError) {
        if (!cancelled) {
          const message =
            fetchError instanceof Error ? fetchError.message : "Unable to load history";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    intervalId = window.setInterval(() => void load(), 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-6 shadow-[0_30px_100px_rgba(2,8,23,0.35)] sm:p-7">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/55">
          Analysis archive
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white">
          Past content research runs
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300/76">
          Review previous searches, compare coverage over time, and jump back into
          high-performing topic clusters without re-running every query.
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(2,8,23,0.28)] backdrop-blur-xl">
        <div className="grid gap-4 p-4 sm:p-5 lg:hidden">
          {loading ? (
            <div className="rounded-[24px] border border-white/10 bg-white/4 px-5 py-12 text-center text-sm text-slate-300/70">
              Loading history...
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-[24px] border border-rose-300/14 bg-rose-300/10 px-5 py-12 text-center text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {!loading && !error && !runs.length ? (
            <div className="rounded-[24px] border border-white/10 bg-white/4 px-5 py-12 text-center text-sm text-slate-300/70">
              No runs yet. Start an analysis from the home page.
            </div>
          ) : null}

          {!loading && !error
            ? runs.map((run) => (
                <article
                  key={run.id}
                  className="min-w-0 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_16px_50px_rgba(2,8,23,0.18)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-medium text-white">
                        {run.search_tag}
                      </p>
                      <p className="mt-2 text-sm text-slate-300/72">
                        {formatCompactDateRange(run.start_date, run.end_date)}
                      </p>
                    </div>
                    <StatusBadge status={run.status} />
                  </div>

                  <div className="mt-4">
                    <Platforms platforms={run.platforms} />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      [String(run.video_count), "Videos"],
                      [String(run.comment_count), "Comments"],
                      [String(run.insight_count ?? "-"), "Topics"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="rounded-[20px] border border-white/10 bg-white/4 px-3 py-3 text-center"
                      >
                        <p className="text-lg font-semibold text-white">{value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-400/60">
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[20px] border border-white/8 bg-black/10 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400/55">
                      Run created
                    </p>
                    <p className="mt-2 text-sm text-slate-200/82">
                      {formatRunDateCompact(run.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400/60">
                      {formatRunTime(run.created_at)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/results/${run.id}`}
                      className="inline-flex rounded-full border border-cyan-300/24 bg-cyan-300/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-300/18 hover:text-white"
                    >
                      View
                    </Link>
                    <Link
                      href={`/logs/${run.id}`}
                      className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300/70 transition hover:bg-white/10 hover:text-white"
                    >
                      Logs
                    </Link>
                  </div>
                </article>
              ))
            : null}
        </div>

        <div className="hidden lg:block">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[7%]" />
              <col className="w-[8%]" />
              <col className="w-[7%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
            </colgroup>
            <thead className="border-b border-white/10 bg-black/10 text-xs uppercase tracking-[0.24em] text-slate-300/55">
              <tr>
                <th className="px-5 py-4">Search Tag</th>
                <th className="px-4 py-4">Range</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-3 py-4 text-center">Videos</th>
                <th className="px-3 py-4 text-center">Comments</th>
                <th className="px-3 py-4 text-center">Topics</th>
                <th className="px-4 py-4">Platforms</th>
                <th className="px-4 py-4">Run</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-sm text-slate-200/82">
              {loading ? (
                <EmptyRow colSpan={9}>Loading history...</EmptyRow>
              ) : null}

              {!loading && error ? (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center text-rose-100">
                    {error}
                  </td>
                </tr>
              ) : null}

              {!loading && !error && !runs.length ? (
                <EmptyRow colSpan={9}>
                  No runs yet. Start an analysis from the home page.
                </EmptyRow>
              ) : null}

              {runs.map((run) => (
                <tr key={run.id} className="transition hover:bg-white/4">
                  <td className="max-w-[260px] px-5 py-4 font-medium text-white">
                    <span className="block truncate">{run.search_tag}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-300/72">
                    <span className="block truncate">
                      {formatCompactDateRange(run.start_date, run.end_date)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-3 py-4 text-center">{run.video_count}</td>
                  <td className="px-3 py-4 text-center">{run.comment_count}</td>
                  <td className="px-3 py-4 text-center">{run.insight_count ?? "-"}</td>
                  <td className="px-4 py-4">
                    <Platforms platforms={run.platforms} />
                  </td>
                  <td className="px-4 py-4 text-slate-300/72">
                    <span className="block whitespace-nowrap">
                      {formatRunDateCompact(run.created_at)}
                    </span>
                    <span className="mt-0.5 block whitespace-nowrap text-xs text-slate-400/55">
                      {formatRunTime(run.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/results/${run.id}`}
                        className="inline-flex rounded-full border border-cyan-300/24 bg-cyan-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:bg-cyan-300/18 hover:text-white"
                      >
                        View
                      </Link>
                      <Link
                        href={`/logs/${run.id}`}
                        className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300/70 transition hover:bg-white/10 hover:text-white"
                      >
                        Logs
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
