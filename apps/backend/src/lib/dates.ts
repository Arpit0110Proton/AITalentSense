/**
 * Estimate the number of years between two date strings.
 * Falls back to 1 if start is missing.
 * Shared by mockProvider and crustDataProvider (FIX 7).
 */
export function estimateYears(start?: string, end?: string): number {
  if (!start) return 1;
  const s = new Date(start).getFullYear();
  const e = end ? new Date(end).getFullYear() : new Date().getFullYear();
  return Math.max(1, e - s);
}
