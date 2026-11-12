const CODE_PATTERN = /^\d{4}$/;

export function generateCheckInCode(existing: Iterable<string> = []): string {
  const used = new Set(existing);
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    if (!used.has(code)) return code;
  }
  throw new Error('No check-in code available');
}

export function parseCheckInCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (CODE_PATTERN.test(value)) return value;

  const payload = value.match(/^HADIR:(?:JOIN:)?(\d{4})$/i);
  if (payload) return payload[1] ?? null;

  try {
    const url = new URL(value);
    const code = url.searchParams.get('code');
    return code && CODE_PATTERN.test(code) ? code : null;
  } catch {
    return null;
  }
}

export function buildJoinUrl(code: string): string {
  const path = `/participant/sessions?code=${encodeURIComponent(code)}`;
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}
