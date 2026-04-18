"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { generateOutline, getSavedOutlines, refineOutline, saveOutline } from "@/lib/api";
import type { BlogOutline, SavedOutline } from "@/lib/types";
import { contentTypeStyles, formatRunDate, outlineToMarkdown } from "@/lib/utils";

const PRESET_CHIPS = [
  "Simpler language",
  "Add more sections",
  "SEO-friendly intro",
  "Add strong CTA",
];

function OutlineDisplay({ outline }: { outline: BlogOutline }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/45">
          ~{outline.estimated_words} words
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-snug text-white">
          {outline.title}
        </h2>
        <p className="mt-3 text-sm italic leading-6 text-slate-300/65">{outline.intro}</p>
      </div>

      <div className="space-y-4">
        {outline.sections.map((section, i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/70">
              {section.heading}
            </p>
            <ul className="mt-2 space-y-1.5 pl-1">
              {section.points.map((point, j) => (
                <li
                  key={j}
                  className="text-sm leading-5 text-slate-300/80 before:mr-2 before:text-cyan-300/50 before:content-['·']"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="border-t border-white/8 pt-4 text-sm italic text-slate-400/60">
        {outline.conclusion}
      </p>
    </div>
  );
}

export default function OutlinePage() {
  const params = useParams<{ run_id: string; topic: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const topicSlug = params.topic;
  const runId = params.run_id;
  const suggestedTitle = searchParams.get("title") ?? topicSlug.replace(/-/g, " ");
  const contentType = (searchParams.get("ct") ?? "blog") as "blog" | "video" | "social";
  const topic = suggestedTitle;

  const [outline, setOutline] = useState<BlogOutline | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const [instruction, setInstruction] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const [history, setHistory] = useState<SavedOutline[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const items = await getSavedOutlines(runId, topicSlug);
      setHistory(items);
    } catch {
      // history panel is non-blocking
    } finally {
      setHistoryLoading(false);
    }
  }, [runId, topicSlug]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // Auto-generate on mount
  useEffect(() => {
    async function init() {
      setGenerating(true);
      setGenError(null);
      try {
        const result = await generateOutline(topic, suggestedTitle, contentType);
        setOutline(result);
      } catch (err) {
        setGenError(err instanceof Error ? err.message : "Generation failed.");
      } finally {
        setGenerating(false);
      }
    }
    void init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegenerate() {
    if (!outline && !instruction) return;
    setGenerating(true);
    setGenError(null);
    setSaved(false);
    try {
      let result: BlogOutline;
      if (outline && instruction.trim()) {
        result = await refineOutline({
          topic,
          suggested_title: suggestedTitle,
          content_type: contentType,
          current_outline: outline,
          instruction: instruction.trim(),
        });
      } else {
        result = await generateOutline(topic, suggestedTitle, contentType);
      }
      setOutline(result);
      setCopyDone(false);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Regeneration failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!outline) return;
    setSaving(true);
    try {
      await saveOutline({
        run_id: runId,
        topic,
        topic_slug: topicSlug,
        outline,
        modification: instruction.trim() || undefined,
      });
      setSaved(true);
      void loadHistory();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!outline) return;
    void navigator.clipboard.writeText(outlineToMarkdown(outline)).then(() => {
      setCopyDone(true);
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
      <div className="flex gap-8 xl:gap-12">
        {/* LHS: history panel */}
        <aside className="hidden w-72 shrink-0 xl:block">
          <div className="sticky top-10 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-5">
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
              Saved outlines
            </p>

            {historyLoading ? (
              <div className="mt-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-2xl bg-white/6" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="mt-4 text-xs leading-5 text-slate-400/60">
                No saved outlines yet. Generate and save one to see it here.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOutline(item.outline);
                        if (item.modification) setInstruction(item.modification);
                        setSaved(false);
                        setCopyDone(false);
                      }}
                      className="w-full rounded-2xl border border-white/8 bg-white/4 px-3 py-2.5 text-left transition hover:bg-white/8"
                    >
                      <p className="truncate text-xs font-medium text-white">
                        {item.outline.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400/60">
                        {formatRunDate(item.generated_at)}
                      </p>
                      {item.modification ? (
                        <p className="mt-1 truncate text-[10px] italic text-slate-400/50">
                          "{item.modification}"
                        </p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main panel */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-3 inline-flex items-center gap-1.5 text-xs text-slate-400/60 transition hover:text-slate-200"
              >
                ← Back to results
              </button>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
                Content outline
              </p>
              <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
                {topic}
              </h1>
            </div>
            <span className={`mt-1 rounded-full px-3 py-1.5 text-xs font-medium ${contentTypeStyles[contentType]}`}>
              {contentType}
            </span>
          </div>

          {/* Outline display */}
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.28)]">
            {generating ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-100/30 border-t-cyan-200" />
                <p className="text-sm text-slate-300/60">
                  {outline ? "Applying changes..." : "Generating outline..."}
                </p>
              </div>
            ) : genError ? (
              <div className="rounded-2xl border border-rose-300/14 bg-rose-300/10 px-4 py-5">
                <p className="text-sm text-rose-100">{genError}</p>
                <button
                  type="button"
                  onClick={() => void handleRegenerate()}
                  className="mt-3 text-xs text-rose-200/80 underline hover:text-rose-100"
                >
                  Try again
                </button>
              </div>
            ) : outline ? (
              <OutlineDisplay outline={outline} />
            ) : null}
          </div>

          {/* Modification input */}
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/50">
              Modify outline
            </p>

            <div className="flex flex-wrap gap-2">
              {PRESET_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInstruction(chip)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    instruction === chip
                      ? "border-cyan-300/40 bg-cyan-300/18 text-cyan-100"
                      : "border-white/10 bg-white/6 text-slate-300/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Or describe what to change — e.g. 'focus more on beginners', 'add a section on ITR filing'"
              rows={3}
              className="w-full resize-none rounded-[20px] border border-white/10 bg-slate-950/45 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/35 focus:bg-slate-950/65"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleRegenerate()}
              disabled={generating || !outline}
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#7ef4ff,#5be4c6)] px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? "Applying..." : instruction.trim() ? "Regenerate with changes" : "Regenerate"}
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !outline || saved}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/10 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save outline"}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!outline}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copyDone ? "Copied!" : "Copy Markdown"}
            </button>
          </div>

          {/* Mobile: history panel */}
          {history.length > 0 ? (
            <div className="xl:hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
                Saved outlines
              </p>
              <ul className="mt-4 space-y-2">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOutline(item.outline);
                        if (item.modification) setInstruction(item.modification);
                        setSaved(false);
                        setCopyDone(false);
                      }}
                      className="w-full rounded-2xl border border-white/8 bg-white/4 px-3 py-2.5 text-left transition hover:bg-white/8"
                    >
                      <p className="truncate text-xs font-medium text-white">{item.outline.title}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400/60">{formatRunDate(item.generated_at)}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
