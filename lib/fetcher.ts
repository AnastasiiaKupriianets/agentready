const TIMEOUT_MS = 10_000;
const MAX_BYTES = 3_000_000; // 3MB safety cap — plenty for a page's initial HTML

export interface FetchSuccess {
  ok: true;
  html: string;
  status: number;
  contentType: string | null;
  finalUrl: string;
  fetchTimeMs: number;
}

export interface FetchFailure {
  ok: false;
  error: string;
  status: number;
}

export type FetchResult = FetchSuccess | FetchFailure;

/**
 * Fetches raw HTML for a single URL. Follows redirects, enforces a hard
 * timeout and a byte cap, and rejects non-HTML responses. Does not execute
 * JavaScript — Etap 2 measures what's present in the initial HTML response,
 * the same document-level view most crawling agents start from.
 */
export async function fetchWebsite(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "AgentReadyBot/0.1 (+https://agentready.dev; structural agent-readiness audit)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return {
          ok: false,
          error:
            "This site blocked the request (403). Many sites reject automated/bot traffic — this isn't something AgentReady can work around, and it's worth noting agents hit the same wall.",
          status: res.status,
        };
      }
      if (res.status === 429) {
        return {
          ok: false,
          error: "This site rate-limited the request (429). Wait a moment and try again.",
          status: res.status,
        };
      }
      return {
        ok: false,
        error: `Site responded with ${res.status} ${res.statusText}.`,
        status: res.status,
      };
    }

    const contentType = res.headers.get("content-type");
    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      return {
        ok: false,
        error: `Expected an HTML page, got "${contentType}".`,
        status: 415,
      };
    }

    const reader = res.body?.getReader();
    if (!reader) {
      const html = await res.text();
      return {
        ok: true,
        html,
        status: res.status,
        contentType,
        finalUrl: res.url,
        fetchTimeMs: Date.now() - start,
      };
    }

    let received = 0;
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) {
        controller.abort();
        return { ok: false, error: "Page exceeds the 3MB analysis limit.", status: 413 };
      }
      chunks.push(value);
    }
    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");

    return {
      ok: true,
      html,
      status: res.status,
      contentType,
      finalUrl: res.url,
      fetchTimeMs: Date.now() - start,
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: `Timed out after ${TIMEOUT_MS / 1000}s.`, status: 504 };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reach that site.",
      status: 502,
    };
  } finally {
    clearTimeout(timeout);
  }
}
