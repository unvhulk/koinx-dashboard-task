"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { Insight } from "@/lib/types";
import { contentTypeSolid } from "@/lib/utils";

export function FrequencyChart({ insights }: { insights: Insight[] }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(2,8,23,0.28)] backdrop-blur-xl sm:p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-100/50">
            Topic Momentum
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
            Comment frequency by content angle
          </h2>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={insights}
            margin={{ top: 12, right: 12, left: -24, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="topic"
              tick={{ fill: "rgba(226,232,240,0.72)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-12}
              height={70}
            />
            <YAxis
              tick={{ fill: "rgba(226,232,240,0.62)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(9,16,34,0.96)",
                borderRadius: "18px",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="frequency"
              radius={[16, 16, 8, 8]}
              maxBarSize={56}
            >
              {insights.map((entry) => (
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
