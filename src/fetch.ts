const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export interface FetchResult {
  status: number;
  body: Buffer;
  lastModified: Date | null;
}

export interface HeadResult {
  status: number;
  lastModified: Date | null;
}

function parseLastModified(res: Response): Date | null {
  const value = res.headers.get('last-modified');
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function fetchBuffer(
  url: string,
  attempts = 3,
): Promise<FetchResult | null> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.status === 404) return null;
      if (RETRYABLE_STATUSES.has(res.status)) {
        await sleep(1000 * (i + 1));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      }
      const arr = await res.arrayBuffer();
      return {
        status: res.status,
        body: Buffer.from(arr),
        lastModified: parseLastModified(res),
      };
    } catch (err) {
      lastErr = err;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`failed to fetch ${url}`);
}

export async function fetchHead(
  url: string,
  attempts = 3,
): Promise<HeadResult | null> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (res.status === 404) return null;
      if (RETRYABLE_STATUSES.has(res.status)) {
        await sleep(1000 * (i + 1));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      }
      return { status: res.status, lastModified: parseLastModified(res) };
    } catch (err) {
      lastErr = err;
      await sleep(500 * (i + 1));
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`failed to HEAD ${url}`);
}

export async function fetchText(url: string, attempts = 3): Promise<string | null> {
  const res = await fetchBuffer(url, attempts);
  return res ? res.body.toString('utf-8') : null;
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
