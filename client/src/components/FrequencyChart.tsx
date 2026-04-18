"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Insight } from "@/lib/types";
import { contentTypeSolid } from "@/lib/utils";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  blog: "Blog post",
  video: "Video",
  social: "Social",
};

function clampLabel(value: string, maxLength = 42) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function normalizeLabel(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    if ("value" in value) {
      return normalizeLabel((value as { value: unknown }).value);
    }

    if ("topic" in value) {
      return normalizeLabel((value as { topic: unknown }).topic);
    }
  }

  return "";
}

function splitLabel(value: string, lineLength = 22) {
  const words = clampLabel(value, 44).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= lineLength) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;

    if (lines.length === 1) {
      break;
    }
  }

  if (current && lines.length < 2) {
    lines.push(current);
  }

  if (lines.length === 2 && words.join(" ").length > lines.join(" ").length) {
    lines[1] = clampLabel(lines[1], lineLength);
  }

  return lines;
}

function TopicTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: unknown };
}) {
  if (!payload) {
    return null;
  }

  const label = normalizeLabel(payload.value);
  const lines = splitLabel(label);

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        textAnchor="end"
        fill="rgba(226,232,240,0.78)"
        fontSize={12}
      >
        {lines.map((line) => (
          <tspan key={line} x={0} dy={line === lines[0] ? -2 : 16}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: Insight }> }) {
  if (!active || !payload?.length) return null;
  const insight = payload[0].payload;
  return (
    <div className="max-w-xs rounded-2xl border border-white/10 bg-[rgba(9,16,34,0.97)] p-4 shadow-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/50">
        {CONTENT_TYPE_LABELS[insight.content_type]} · {insight.frequency} comments
      </p>
      <p className="mt-1.5 text-sm font-medium leading-5 text-white">{insight.topic}</p>
      <p className="mt-2 text-xs italic leading-5 text-slate-300/70">"{insight.suggested_title}"</p>
    </div>
  );
}

export function FrequencyChart({ insights }: { insights: Insight[] }) {
  const sortedInsights = [...insights].sort((left, right) => right.frequency - left.frequency);
  const chartHeight = Math.max(320, sortedInsights.length * 64);

  const legend = [
    { label: "Blog post", color: contentTypeSolid.blog },
    { label: "Video", color: contentTypeSolid.video },
    { label: "Social", color: contentTypeSolid.social },
  ];

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(2,8,23,0.28)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
            Most discussed topics
          </p>
          <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-2xl text-white">
            What people are asking about most
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {legend.map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-slate-300/65">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedInsights}
            layout="vertical"
            margin={{ top: 6, right: 20, left: 44, bottom: 6 }}
            barCategoryGap={16}
          >
            <XAxis
              type="number"
              tick={{ fill: "rgba(226,232,240,0.45)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={220}
              tick={<TopicTick />}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="frequency" radius={[0, 10, 10, 0]} maxBarSize={32}>
              {sortedInsights.map((entry) => (
                <Cell
                  key={`${entry.topic}-${entry.platform}`}
                  fill={contentTypeSolid[entry.content_type]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
