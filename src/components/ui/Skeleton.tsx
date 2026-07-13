import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("placeholder-line block", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function TableSkeleton({
  columns = 6,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div
      className="divide-y divide-white/[0.06]"
      aria-label="Loading table data"
      role="status"
    >
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid gap-4 px-5 py-5"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(90px, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton
              key={column}
              className={cn("h-2.5", column === 0 ? "w-24" : "w-full")}
              style={{ animationDelay: `-${(row + column) * 120}ms` }}
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading records</span>
    </div>
  );
}
