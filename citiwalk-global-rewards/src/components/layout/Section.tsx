import type { HTMLAttributes } from "react";
import { Container } from "@/components/layout/Container";
import { cn } from "@/utils/cn";

type SectionProps = HTMLAttributes<HTMLElement> & {
  containerClassName?: string;
};

export function Section({ className, containerClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn("relative py-section", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
