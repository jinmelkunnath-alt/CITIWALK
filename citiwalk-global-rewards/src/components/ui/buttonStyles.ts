import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  outline: "button-outline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2.5 text-xs",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-[3.25rem] px-6 py-4 text-sm",
};

export function buttonClassNames({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(variantClasses[variant], sizeClasses[size], className);
}
