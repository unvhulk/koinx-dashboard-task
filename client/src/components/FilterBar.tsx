"use client";

import type { ContentType, Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  contentType: ContentType | "all";
  onContentTypeChange: (value: ContentType | "all") => void;
  platforms: Platform[];
  activePlatform: Platform | "all";
  onPlatformChange: (value: Platform | "all") => void;
}

const contentTypeOptions: Array<{ label: string; value: ContentType | "all" }> = [
  { label: "All", value: "all" },
  { label: "Blog", value: "blog" },
  { label: "Video", value: "video" },
  { label: "Social", value: "social" },
];

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "Twitter / X",
  reddit: "Reddit",
};

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
  platforms,
  activePlatform,
  onPlatformChange,
}: FilterBarProps) {
  const platformOptions: Array<{ label: string; value: Platform | "all" }> = [
    { label: "All", value: "all" },
    ...platforms.map((p) => ({ label: PLATFORM_LABELS[p] ?? p, value: p })),
  ];

  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_20px_64px_rgba(2,8,23,0.24)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap gap-6">
        <FilterGroup
          label="Content Type"
          value={contentType}
          options={contentTypeOptions}
          onChange={onContentTypeChange}
        />
        {platforms.length > 1 && (
          <FilterGroup
            label="Platform"
            value={activePlatform}
            options={platformOptions}
            onChange={onPlatformChange}
          />
        )}
      </div>
    </div>
  );
}
