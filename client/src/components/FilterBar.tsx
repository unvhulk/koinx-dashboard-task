"use client";

import type { ContentType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  contentType: ContentType | "all";
  onContentTypeChange: (value: ContentType | "all") => void;
}

const contentTypeOptions: Array<{ label: string; value: ContentType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Video", value: "video" },
  { label: "Social", value: "social" },
];

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-300/50">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                active
                  ? "border-cyan-300/30 bg-cyan-300/14 text-white shadow-[0_0_0_1px_rgba(126,244,255,0.08)]"
                  : "border-white/10 bg-white/6 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FilterBar({
  contentType,
  onContentTypeChange,
}: FilterBarProps) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_20px_64px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <FilterGroup
          label="Content Type"
          value={contentType}
          options={contentTypeOptions}
          onChange={onContentTypeChange}
        />
        <div className="space-y-3 lg:justify-self-end">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-300/50">
            Platform
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/24 bg-cyan-300/10 px-4 py-2 text-sm text-white">
            <span className="h-2 w-2 rounded-full bg-cyan-200" />
            YouTube only
          </div>
        </div>
      </div>
    </div>
  );
}
