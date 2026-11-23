/**
 * CSV Formula Injection Sanitizer (CWE-1236 Defense)
 * Prevents execution of malicious formulas in Excel, Google Sheets, or LibreOffice
 * when user-controlled data is exported to CSV or TSV.
 */

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);
  if (str.length === 0) {
    return "";
  }

  // If the cell begins with dangerous spreadsheet formula characters (raw or trimmed), prepend with single quote
  const firstChar = str.charAt(0);
  if (FORMULA_PREFIXES.includes(firstChar)) {
    return `'${str}`;
  }

  const trimmed = str.trim();
  if (trimmed.length > 0 && FORMULA_PREFIXES.includes(trimmed.charAt(0))) {
    return `'${str}`;
  }

  return str;
}

export function desanitizeCsvCell(value: string): string {
  if (typeof value !== "string") {
    return String(value ?? "");
  }

  const trimmed = value.trim();
  // Strip prepended single quote if it was used to neutralize formula injection
  if (trimmed.startsWith("'") && trimmed.length > 1) {
    const secondChar = trimmed.charAt(1);
    if (FORMULA_PREFIXES.includes(secondChar)) {
      return trimmed.slice(1);
    }
  }

  return trimmed;
}
