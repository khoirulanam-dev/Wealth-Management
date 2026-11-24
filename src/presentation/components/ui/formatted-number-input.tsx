"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormattedNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (rawValue: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allowDecimals?: boolean;
  prefix?: string;
}

/**
 * Format a numeric string with thousand separators (.)
 * Example: "5000000" -> "5.000.000"
 */
function formatNumberWithDots(val: string, allowDecimals = false): string {
  if (!val) return "";

  if (allowDecimals) {
    // If decimals allowed, handle standard decimal separator (, or .)
    const normalized = val.replace(/,/g, ".");
    const parts = normalized.split(".");
    const integerPart = parts[0].replace(/\D/g, "");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (parts.length > 1) {
      return `${formattedInteger},${parts[1].slice(0, 4)}`;
    }
    return formattedInteger;
  }

  // Pure integer formatting
  const digits = val.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Extract pure digits or decimal string
 */
function cleanToRaw(val: string, allowDecimals = false): string {
  if (!val) return "";
  if (allowDecimals) {
    const normalized = val.replace(/\./g, "").replace(/,/g, ".");
    return normalized;
  }
  return val.replace(/\D/g, "");
}

export const FormattedNumberInput = React.forwardRef<HTMLInputElement, FormattedNumberInputProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onValueChange,
      onChange,
      name,
      allowDecimals = false,
      prefix,
      placeholder = "0",
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    // Initial state
    const initialRaw = React.useMemo(() => {
      const v = controlledValue !== undefined ? controlledValue : defaultValue;
      return v !== undefined && v !== null ? String(v) : "";
    }, [controlledValue, defaultValue]);

    const [rawValue, setRawValue] = React.useState<string>(() => cleanToRaw(initialRaw, allowDecimals));
    const [displayValue, setDisplayValue] = React.useState<string>(() =>
      formatNumberWithDots(initialRaw, allowDecimals)
    );

    // Sync with controlled value changes
    React.useEffect(() => {
      if (controlledValue !== undefined) {
        const clean = cleanToRaw(String(controlledValue), allowDecimals);
        setRawValue(clean);
        setDisplayValue(formatNumberWithDots(String(controlledValue), allowDecimals));
      }
    }, [controlledValue, allowDecimals]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputEl = e.target;
      const rawInput = inputEl.value;
      const cursorPosition = inputEl.selectionStart || 0;

      // Count digits before cursor to restore position
      const digitsBeforeCursor = rawInput.slice(0, cursorPosition).replace(/\D/g, "").length;

      const clean = cleanToRaw(rawInput, allowDecimals);
      const formatted = formatNumberWithDots(clean, allowDecimals);

      setRawValue(clean);
      setDisplayValue(formatted);

      // Notify parents
      onValueChange?.(clean);

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...inputEl,
            name: name || inputEl.name,
            value: clean,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }

      // Restore cursor position seamlessly
      requestAnimationFrame(() => {
        if (!inputEl) return;
        let newCursor = 0;
        let countedDigits = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            countedDigits++;
          }
          if (countedDigits >= digitsBeforeCursor) {
            newCursor = i + 1;
            break;
          }
        }
        if (countedDigits < digitsBeforeCursor) {
          newCursor = formatted.length;
        }
        inputEl.setSelectionRange(newCursor, newCursor);
      });
    };

    return (
      <div className="relative flex items-center w-full">
        {prefix && (
          <span className="absolute left-3.5 z-10 text-xs font-semibold text-[#94A3B8] pointer-events-none select-none">
            {prefix}
          </span>
        )}
        {/* Hidden input to ensure FormData gets clean numeric string without dots */}
        {name && <input type="hidden" name={name} value={rawValue} />}
        <input
          {...props}
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-mono shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:border-[#007AFF] disabled:cursor-not-allowed disabled:opacity-50",
            prefix && "pl-9",
            className
          )}
        />
      </div>
    );
  }
);

FormattedNumberInput.displayName = "FormattedNumberInput";

