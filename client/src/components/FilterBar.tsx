"use client";

import type { ContentType, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  contentType: ContentType | "all";
  platform: Platform | "all";
  onContentTypeChange: (value: ContentType | "all") => void;
  onPlatformChange: (value: Platform | "all") => void;
}

const contentTypeOptions: Array<{ label: string; value: ContentType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Video", value: "video" },
  { label: "Social", value: "social" },
];

const platformOptions: Array<{ label: string; value: Platform | "all" }> = [
  { label: "All", value: "all" },
  { label: "YouTube", value: "youtube" },
  { label: "Reddit", value: "reddit" },
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
  platform,
  onContentTypeChange,
  onPlatformChange,
}: FilterBarProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(2,8,23,0.28)] backdrop-blur-xl">
      <div className="grid gap-5 lg:grid-cols-2">
        <FilterGroup
          label="Content Type"
          value={contentType}
          options={contentTypeOptions}
          onChange={onContentTypeChange}
        />
        <FilterGroup
          label="Platform"
          value={platform}
          options={platformOptions}
          onChange={onPlatformChange}
        />
      </div>
    </div>
  );
}
