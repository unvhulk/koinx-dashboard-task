"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getHistory } from "@/lib/api";
import type { AnalysisRun } from "@/lib/types";
import { formatDateRange, formatRunDate } from "@/lib/utils";

export default function HistoryPage() {
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getHistory();
        setRuns(response);
        setError(null);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load history";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <section className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-7 shadow-[0_30px_100px_rgba(2,8,23,0.35)]">
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-black/10 text-xs uppercase tracking-[0.24em] text-slate-300/55">
              <tr>
                <th className="px-6 py-4">Search Tag</th>
                <th className="px-6 py-4">Date Range</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Videos</th>
                <th className="px-6 py-4">Comments</th>
                <th className="px-6 py-4">Topics</th>
                <th className="px-6 py-4">Date Run</th>
                <th className="px-6 py-4">View</th>
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
                  <td className="px-6 py-5 font-medium text-white">{run.search_tag}</td>
                  <td className="px-6 py-5 text-slate-300/72">
                    {formatDateRange(run.start_date, run.end_date)}
                  </td>
                  <td className="px-6 py-5">
                    <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-100">
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">{run.video_count}</td>
                  <td className="px-6 py-5">{run.comment_count}</td>
                  <td className="px-6 py-5">{run.insights?.length ?? "-"}</td>
                  <td className="px-6 py-5 text-slate-300/72">
                    {formatRunDate(run.created_at)}
                  </td>
                  <td className="px-6 py-5">
                    <Link
                      href={`/results/${run.id}`}
                      className="inline-flex rounded-full border border-cyan-300/24 bg-cyan-300/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-300/18 hover:text-white"
                    >
                      View
                    </Link>
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
