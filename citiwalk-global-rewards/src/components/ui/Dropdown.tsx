import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
} from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/utils/cn";

export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type DropdownProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: DropdownOption[];
  description?: string;
  error?: string;
};

export const Dropdown = forwardRef<HTMLSelectElement, DropdownProps>(
  ({ className, label, options, description, error, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const messageId = `${selectId}-message`;

    return (
      <div className={cn("space-y-2", className)}>
        <label htmlFor={selectId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "control-base appearance-none pr-11",
              error && "border-red-400/70 focus:border-red-400 focus:ring-red-400/10",
            )}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={description || error ? messageId : undefined}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled} className="bg-elevated text-ink">
                {option.label}
              </option>
            ))}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        </div>
        {(error || description) && (
          <p id={messageId} className={cn("text-xs leading-5", error ? "text-red-300" : "text-muted")}>
            {error ?? description}
          </p>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";
