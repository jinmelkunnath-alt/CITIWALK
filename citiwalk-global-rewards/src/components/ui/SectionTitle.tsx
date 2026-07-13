import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionTitleProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionTitleProps) {
  return (
    <header
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <h2 className="text-display-sm text-balance text-white">{title}</h2>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-7 text-muted md:text-lg md:leading-8",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </header>
  );
}
