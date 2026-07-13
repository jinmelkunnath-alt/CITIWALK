import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { FiCheck, FiChevronDown, FiSearch, FiX } from "react-icons/fi";
import { cn } from "@/utils/cn";

export type SearchableOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SearchableDropdownProps = {
  label: string;
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
};

export function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Search and select",
  description,
  error,
  disabled = false,
  className,
  name,
}: SearchableDropdownProps) {
  const id = useId();
  const listboxId = `${id}-listbox`;
  const messageId = `${id}-message`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (!open) setQuery(selectedOption?.label ?? "");
  }, [open, selectedOption?.label]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  const selectOption = (option: SearchableOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, Math.max(0, filteredOptions.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.max(0, current - 1));
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) selectOption(option);
    } else if (event.key === "Escape") {
      setOpen(false);
      setQuery(selectedOption?.label ?? "");
    }
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onBlur?.();
  };

  const clearSelection = () => {
    onChange("");
    setQuery("");
    setOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={rootRef} className={cn("relative space-y-2", className)} onBlur={handleBlur}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && filteredOptions[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || description ? messageId : undefined}
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          className={cn(
            "control-base pl-11 pr-20",
            error && "border-red-400/70 focus:border-red-400 focus:ring-red-400/10",
          )}
          onFocus={() => {
            setOpen(true);
            setQuery("");
            setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (value) onChange("");
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-0.5">
          {value && !disabled && (
            <button
              type="button"
              className="grid size-8 place-items-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-white"
              aria-label={`Clear ${label}`}
              onClick={clearSelection}
            >
              <FiX className="size-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            className="grid size-8 place-items-center rounded-lg text-muted"
            aria-label={open ? `Close ${label} options` : `Open ${label} options`}
            onClick={() => {
              setOpen((current) => !current);
              inputRef.current?.focus();
            }}
          >
            <FiChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
          </button>
        </div>

        {open && !disabled && (
          <div className="surface-glass absolute inset-x-0 top-[calc(100%+.5rem)] z-40 overflow-hidden rounded-card shadow-panel">
            <ul id={listboxId} role="listbox" aria-label={`${label} options`} className="max-h-56 overflow-y-auto p-1.5">
              {filteredOptions.length ? (
                filteredOptions.map((option, index) => {
                  const selected = option.value === value;
                  const active = index === activeIndex;
                  return (
                    <li
                      key={option.value}
                      id={`${id}-option-${index}`}
                      role="option"
                      aria-selected={selected}
                      aria-disabled={option.disabled || undefined}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition",
                        active && "bg-white/[0.06] text-white",
                        selected && "bg-brand-400/10 text-brand-100",
                        option.disabled && "cursor-not-allowed opacity-40",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        selectOption(option);
                      }}
                    >
                      <span>{option.label}</span>
                      {selected && <FiCheck className="size-4 text-brand-300" aria-hidden="true" />}
                    </li>
                  );
                })
              ) : (
                <li className="px-3 py-6 text-center text-sm text-muted">No matching options</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {(error || description) && (
        <p id={messageId} role={error ? "alert" : undefined} className={cn("text-xs leading-5", error ? "text-red-300" : "text-muted")}>
          {error ?? description}
        </p>
      )}
    </div>
  );
}
