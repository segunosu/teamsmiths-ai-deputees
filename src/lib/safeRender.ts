export function safeText(value: unknown, fallback = '—'): string {
  if (value == null) return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try { return JSON.stringify(value); } catch { return fallback; }
}