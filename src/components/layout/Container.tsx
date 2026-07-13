import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--container-width)] px-gutter", className)}
      {...props}
    />
  );
}
