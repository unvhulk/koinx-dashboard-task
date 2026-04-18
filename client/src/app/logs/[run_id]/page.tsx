"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getLogs } from "@/lib/api";
import type { PipelineLog } from "@/lib/types";

const TERMINAL_STAGES = new Set(["pipeline.done", "pipeline.error"]);

const LEVEL_STYLES = {
  info: "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
  warn: "border-amber-300/20 bg-amber-300/10 text-amber-200",
  error: "border-rose-300/20 bg-rose-300/10 text-rose-200",
};

function formatTime(ts: string): string {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(new Date(ts));
}

function MetaPanel({ log }: { log: PipelineLog }) {
  const extras = Object.entries(log).filter(
    ([k]) => !["run_id", "ts", "stage", "level", "message"].includes(k),
  );
  if (!extras.length) return null;
  return (
    <div className="mt-2 rounded-xl border border-white/8 bg-black/20 px-3 py-2">
      {extras.map(([k, v]) => (
        <div key={k} className="flex gap-3 text-xs">
          <span className="w-32 shrink-0 text-slate-400/60">{k}</span>
          <span className="break-all font-mono text-slate-300/80">
            {Array.isArray(v) ? v.join(", ") : String(v)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function LogsPage() {
  const params = useParams<{ run_id: string }>();
  const router = useRouter();
  const runId = params.run_id;

  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    async function fetch() {
      try {
        const items = await getLogs(runId);
        setLogs(items);
        setLoading(false);
        const done = items.some((l) => TERMINAL_STAGES.has(l.stage));
        if (done && intervalRef.current) {
          window.clearInterval(intervalRef.current);
        }
      } catch {
        setLoading(false);
      }
    }

    void fetch();
    intervalRef.current = window.setInterval(() => void fetch(), 3000);
    return () => window.clearInterval(intervalRef.current);
  }, [runId]);

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const isDone = logs.some((l) => TERMINAL_STAGES.has(l.stage));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400/60 transition hover:text-slate-200"
        >
          ← Back
        </button>
        <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">Pipeline logs</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
          Run{" "}
          <span className="font-mono text-xl text-slate-400/70">
            {runId.slice(0, 8)}…
          </span>
        </h1>
        <div className="mt-3 flex items-center gap-3">
          {isDone ? (
            <span className="rounded-full border border-cyan-300/24 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              Complete
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-300" />
              Live — polling every 3s
            </span>
          )}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] overflow-hidden">
        {loading ? (
          <div className="px-6 py-14 text-center text-sm text-slate-400/60">
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-slate-400/60">No logs yet.</p>
            <p className="mt-2 text-xs text-slate-500/50">
              Logs appear when a new analysis run is started.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/6">
            {logs.map((log, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full px-5 py-3.5 text-left transition hover:bg-white/4"
                >
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="mt-px shrink-0 font-mono text-xs text-slate-500/60">
                      {formatTime(log.ts)}
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] ${
                        LEVEL_STYLES[log.level] ?? LEVEL_STYLES.info
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-400/70">
                      {log.stage}
                    </span>
                    <span className="min-w-0 text-sm text-slate-200/85">{log.message}</span>
                  </div>
                  {expanded.has(i) && <MetaPanel log={log} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
