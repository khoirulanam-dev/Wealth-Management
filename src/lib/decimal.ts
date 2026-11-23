import Decimal from "decimal.js";

// Global precision configuration: 28 significant digits, standard financial rounding
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export { Decimal };

export function toDecimal(value: Decimal.Value | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  return new Decimal(value);
}

export function formatCurrency(
  value: Decimal.Value,
  currency: string = "IDR",
  locale: string = "id-ID"
): string {
  const dec = toDecimal(value);
  const num = dec.toNumber();

  if (!Number.isFinite(num)) {
    return currency === "IDR" ? "Rp 0" : `${currency} 0.00`;
  }

  if (currency === "IDR") {
    // Indonesian Rupiah format: Rp 1.500.000
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(num);
    return formatted.replace("IDR", "Rp").trim();
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatPercent(value: Decimal.Value, decimals: number = 2): string {
  const dec = toDecimal(value);
  const num = dec.toNumber();
  if (!Number.isFinite(num)) {
    return "0.00%";
  }
  const sign = dec.isPositive() && !dec.isZero() ? "+" : "";
  return `${sign}${dec.toFixed(decimals)}%`;
}

export function formatQuantity(value: Decimal.Value, unit?: string): string {
  const dec = toDecimal(value);
  const formatted = dec.toString();
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatNumber(value: Decimal.Value | number, maximumFractionDigits: number = 2): string {
  const dec = toDecimal(value);
  const num = dec.toNumber();
  if (!Number.isFinite(num)) {
    return "0";
  }
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits,
  }).format(num);
}

export function formatDate(
  date: Date | string | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", options || {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

