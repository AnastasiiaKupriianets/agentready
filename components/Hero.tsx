"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TRY_URLS = ["github.com", "example.com", "npmjs.com"];

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("github.com");

  function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    router.push(`/report?url=${encodeURIComponent(url.trim())}`);
  }

  return (
    <section className="pt-22 pb-10 text-center">
      <div className="mb-7 inline-flex items-center gap-2 border border-green/25 bg-green-dim px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.14em] text-green">
        <span className="h-1.5 w-1.5 rounded-full bg-green" />
        The readiness test for the agentic web
      </div>

      <h1 className="font-display text-[38px] font-bold leading-[1.06] tracking-tight text-ink sm:text-[52px] md:text-[68px]">
        Is your website
        <br />
        ready for AI agents?
      </h1>

      <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-ink-dim">
        See how well AI agents can understand, navigate, and interact with
        your website — before they arrive on it.
      </p>

      <form className="mx-auto mt-10 flex max-w-[640px] flex-col gap-3 sm:flex-row" onSubmit={handleAnalyze}>
        <div className="flex h-13 flex-1 items-center gap-0.5 border border-line-strong bg-surface px-4 focus-within:border-green focus-within:shadow-[0_0_0_3px_var(--color-green-dim)]">
          <span className="font-mono text-sm text-ink-faint">https://</span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="acme-shop.com"
            className="h-13 flex-1 bg-transparent pl-1 font-mono text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
        <button
          type="submit"
          className="h-13 whitespace-nowrap border border-green bg-green px-6 font-sans text-sm font-bold text-[#08120d] transition-all hover:-translate-y-px hover:shadow-[0_0_0_4px_var(--color-green-dim)]"
        >
          Analyze Website →
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs text-ink-faint">
        Try:
        {TRY_URLS.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => setUrl(sample)}
            className="border border-line px-3 py-1 text-ink-dim transition-colors hover:border-line-strong hover:text-ink"
          >
            {sample}
          </button>
        ))}
      </div>
    </section>
  );
}
