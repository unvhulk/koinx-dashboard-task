import type { AnalysisRun, AnalyzeRequest } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function startAnalysis(
  body: AnalyzeRequest,
): Promise<{ run_id: string; status: string }> {
  return request("/api/analyze", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getResults(runId: string): Promise<AnalysisRun> {
  return request(`/api/results/${runId}`);
}

export async function getHistory(): Promise<AnalysisRun[]> {
  return request("/api/history");
}
