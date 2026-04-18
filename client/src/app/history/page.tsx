"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getHistory } from "@/lib/api";
import type { AnalysisRun } from "@/lib/types";
import {
  formatCompactDateRange,
  formatRunDateCompact,
  formatRunTime,
} from "@/lib/utils";

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
        <div>
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[7%]" />
              <col className="w-[9%]" />
              <col className="w-[7%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="border-b border-white/10 bg-black/10 text-xs uppercase tracking-[0.24em] text-slate-300/55">
              <tr>
                <th className="px-5 py-4">Search Tag</th>
                <th className="px-4 py-4">Range</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-3 py-4 text-center">Videos</th>
                <th className="px-3 py-4 text-center">Comments</th>
                <th className="px-3 py-4 text-center">Topics</th>
                <th className="px-4 py-4">Run</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 text-sm text-slate-200/82">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-slate-300/70">
                    Loading history...
                  </td>
                </tr>
              ) : null}

              {!loading && error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-rose-100">
                    {error}
                  </td>
                </tr>
              ) : null}

              {!loading && !error && !runs.length ? (
                <tr>
                  <td colSpan={8} className="px-6 py-14 text-center text-slate-300/70">
                    No runs yet. Start an analysis from the home page.
                  </td>
                </tr>
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
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-100">
                      {run.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">{run.video_count}</td>
                  <td className="px-3 py-4 text-center">{run.comment_count}</td>
                  <td className="px-3 py-4 text-center">{run.insight_count ?? "-"}</td>
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
