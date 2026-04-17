"use client";

import { useEffect, useState, type ReactNode } from "react";

import { getResults } from "@/lib/api";
import type { AnalysisRun } from "@/lib/types";

interface StatusPollerProps {
  runId: string;
  initialData?: AnalysisRun | null;
  children: (state: {
    data: AnalysisRun | null;
    loading: boolean;
    error: string | null;
    retry: () => Promise<void>;
  }) => ReactNode;
}

export function StatusPoller({
  runId,
  initialData = null,
  children,
}: StatusPollerProps) {
  const [data, setData] = useState<AnalysisRun | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const next = await getResults(runId);
      setData(next);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Unable to load results";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let intervalId: number | undefined;
    let cancelled = false;

    async function sync() {
      try {
        const next = await getResults(runId);
        if (cancelled) {
          return;
        }

        setData(next);
        setError(null);
        setLoading(false);

        if (next.status === "complete" || next.status === "failed") {
          if (intervalId) {
            window.clearInterval(intervalId);
          }
        }
      } catch (fetchError) {
        if (cancelled) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to poll results";
        setError(message);
        setLoading(false);
      }
    }

    sync();
    intervalId = window.setInterval(sync, 3000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [runId]);

  return <>{children({ data, loading, error, retry: load })}</>;
}
