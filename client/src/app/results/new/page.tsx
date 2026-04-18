"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

import { startAnalysis } from "@/lib/api";
import type { AnalyzeRequest, Platform, VideoDuration, SortOrder } from "@/lib/types";

function NewResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const req: AnalyzeRequest = {
      search_tag: searchParams.get("tag") ?? "",
      start_date: searchParams.get("start") ?? "",
      end_date: searchParams.get("end") ?? "",
      platforms: (searchParams.get("platforms") ?? "youtube").split(",") as Platform[],
      max_videos: Number(searchParams.get("max_videos") ?? 20),
      enhanced_search: searchParams.get("enhanced_search") === "true",
      min_views: Number(searchParams.get("min_views") ?? 0),
      min_subscribers: Number(searchParams.get("min_subscribers") ?? 0),
      min_comments: Number(searchParams.get("min_comments") ?? 0),
      video_duration: (searchParams.get("video_duration") ?? "any") as VideoDuration,
      sort_order: (searchParams.get("sort_order") ?? "relevance") as SortOrder,
      india_focus: searchParams.get("india_focus") === "true",
    };

    startAnalysis(req)
      .then((res) => router.replace(`/results/${res.run_id}`))
      .catch(() => router.replace("/"));
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/55">Starting analysis</p>
        <p className="mt-2 text-lg text-white">
          {searchParams.get("tag")}
        </p>
      </div>
    </div>
  );
}

export default function NewResultPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />
      </div>
    }>
      <NewResultInner />
    </Suspense>
  );
}
