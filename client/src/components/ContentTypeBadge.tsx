import type { ContentType } from "@/lib/types";
import { cn, contentTypeStyles } from "@/lib/utils";

export function ContentTypeBadge({ value }: { value: ContentType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        contentTypeStyles[value],
      )}
    >
      {value}
    </span>
  );
}
