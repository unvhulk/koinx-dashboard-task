"use client";

import { useState } from "react";

import { ContentTypeBadge } from "@/components/ContentTypeBadge";
import { SentimentBadge } from "@/components/SentimentBadge";
import type { Insight } from "@/lib/types";

export function TopicCard({ insight }: { insight: Insight }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.34)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/18">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
      <div className="flex flex-wrap items-center gap-3">
        <ContentTypeBadge value={insight.content_type} />
        <SentimentBadge value={insight.sentiment} />
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300/70">
          {insight.platform}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-white">
            {insight.topic}
          </h3>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-cyan-100/50">
            {insight.frequency} comments
          </p>
        </div>

        <p className="rounded-2xl border border-white/8 bg-black/12 px-4 py-4 text-sm italic leading-7 text-slate-200/82">
          “{insight.suggested_title}”
        </p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-200/18 bg-cyan-200/10 text-xs">
            {expanded ? "-" : "+"}
          </span>
          View example quotes
        </button>

        {expanded ? (
          <div className="mt-4 space-y-3">
            {insight.example_quotes.slice(0, 3).map((quote) => (
              <blockquote
                key={quote}
                className="rounded-2xl border border-white/8 bg-slate-950/35 px-4 py-3 text-sm leading-6 text-slate-300"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
