"use client";

import { useState } from "react";

import { ContentTypeBadge } from "@/components/ContentTypeBadge";
import { SentimentBadge } from "@/components/SentimentBadge";
import { generateOutline } from "@/lib/api";
import type { BlogOutline, Insight } from "@/lib/types";

export function TopicCard({ insight }: { insight: Insight }) {
  const [expanded, setExpanded] = useState(false);
  const [outline, setOutline] = useState<BlogOutline | null>(null);
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);

  async function handleGenerateOutline() {
    setLoadingOutline(true);
    setOutlineError(null);
    try {
      const result = await generateOutline(
        insight.topic,
        insight.suggested_title,
        insight.content_type,
      );
      setOutline(result);
    } catch {
      setOutlineError("Could not generate outline. Try again.");
    } finally {
      setLoadingOutline(false);
    }
  }

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
          <h3 className="font-[family-name:var(--font-display)] text-xl leading-snug text-white">
            {insight.topic}
          </h3>
          <p className="mt-2 text-xs text-slate-400/60">
            Came up in {insight.frequency} comments
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/12 px-4 py-3">
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-cyan-100/40">
            Suggested title
          </p>
          <p className="text-sm leading-6 text-slate-200/85">
            {insight.suggested_title}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Example quotes toggle */}
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
          <div className="space-y-3">
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

        {/* Blog outline section */}
        {!outline ? (
          <button
            type="button"
            onClick={() => void handleGenerateOutline()}
            disabled={loadingOutline}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300/70 transition hover:text-white disabled:opacity-50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/6 text-xs">
              ✦
            </span>
            {loadingOutline ? "Generating outline..." : "Generate content outline"}
          </button>
        ) : null}

        {outlineError ? (
          <p className="text-xs text-rose-300/80">{outlineError}</p>
        ) : null}

        {outline ? (
          <div className="rounded-2xl border border-white/8 bg-slate-950/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/45">
                Content outline · ~{outline.estimated_words} words
              </p>
              <button
                type="button"
                onClick={() => setOutline(null)}
                className="text-xs text-slate-400/50 hover:text-slate-300"
              >
                clear
              </button>
            </div>

            <p className="mb-4 text-sm font-medium leading-snug text-white">
              {outline.title}
            </p>

            <p className="mb-4 text-xs italic leading-5 text-slate-300/65">
              {outline.intro}
            </p>

            <div className="space-y-3">
              {outline.sections.map((section, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/60">
                    {section.heading}
                  </p>
                  <ul className="mt-1.5 space-y-1 pl-3">
                    {section.points.map((point, j) => (
                      <li key={j} className="text-xs leading-5 text-slate-300/75 before:mr-2 before:content-['·']">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-4 border-t border-white/8 pt-3 text-xs italic text-slate-400/55">
              {outline.conclusion}
            </p>
          </div>
        ) : null}

        {/* Source videos */}
        {insight.sources?.length ? (
          <div className="border-t border-white/8 pt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400/60">
              Sources
            </p>
            <ul className="space-y-1.5">
              {insight.sources.slice(0, 5).map((source) => (
                <li key={source.url} className="min-w-0">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={source.title}
                    className="flex min-w-0 items-center gap-2 text-xs text-cyan-200/70 transition hover:text-cyan-100"
                  >
                    <span className="shrink-0 text-[10px]">↗</span>
                    <span className="block min-w-0 truncate">{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
