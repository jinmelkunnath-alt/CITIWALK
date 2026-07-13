import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  description?: string;
  error?: string;
  leadingIcon?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      description,
      error,
      id,
      leadingIcon,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = `${inputId}-description`;
    const errorId = `${inputId}-error`;
    const describedBy = [
      ariaDescribedBy,
      description && !error ? descriptionId : undefined,
      error ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("space-y-2", className)}>
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
        <div className="relative">
          {leadingIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted" aria-hidden="true">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "control-base",
              leadingIcon && "pl-11",
              error && "border-red-400/70 focus:border-red-400 focus:ring-red-400/10",
            )}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy || undefined}
            {...props}
          />
        </div>
        {description && !error && (
          <p id={descriptionId} className="text-xs leading-5 text-muted">
            {description}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs leading-5 text-red-300">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
