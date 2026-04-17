import type { Sentiment } from "@/lib/types";
import { cn, sentimentMap } from "@/lib/utils";

export function SentimentBadge({ value }: { value: Sentiment }) {
  const sentiment = sentimentMap[value];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        sentiment.className,
      )}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current/20 text-[10px] font-bold uppercase">
        {sentiment.icon}
      </span>
      {sentiment.label}
    </span>
  );
}
