import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value" | "className"> {
  label?: string;
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
  className?: string;
}

/** A quiet, native select. Native keeps it accessible and instant on mobile. */
export function Select<T extends string>({ label, value, options, onChange, className, id, ...rest }: SelectProps<T>) {
  const selectId = id ?? `select-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  return (
    <label htmlFor={selectId} className={cn("group flex flex-col gap-1", className)}>
      {label && <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">{label}</span>}
      <span className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-line bg-canvas pl-3 pr-8 text-sm text-ink transition-colors hover:border-line-strong focus:border-accent-ring focus:outline-none"
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-faint transition-colors group-hover:text-muted"
          aria-hidden
        />
      </span>
    </label>
  );
}
