"use client";

import { useState } from "react";
import type { ParsedPage } from "@/lib/parser";
import type { CategoryChecks } from "@/lib/rules";
import { ChecksPanel } from "./ChecksPanel";

export interface AnalyzeApiResult {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  fetchTimeMs: number;
  httpStatus: number;
  page: ParsedPage;
  categories: CategoryChecks[];
}

const LANDMARK_LABELS: { key: keyof ParsedPage["landmarks"]; label: string }[] = [
  { key: "header", label: "header" },
  { key: "nav", label: "nav" },
  { key: "main", label: "main" },
  { key: "footer", label: "footer" },
];

function CountBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-line px-4 py-3">
      <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
        {label}
      </div>
    </div>
  );
}

export function AnalyzeResult({ result }: { result: AnalyzeApiResult }) {
  const [showRaw, setShowRaw] = useState(false);
  const { page } = result;

  const unlabeledFields = page.forms.reduce(
    (sum, f) => sum + f.fields.filter((field) => !field.hasLabel).length,
    0
  );
  const emptyLinks = page.links.filter((l) => l.isEmpty).length;
  const missingAlt = page.images.filter((i) => !i.hasAlt).length;

  return (
    <div className="mt-14">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
        <span>Fetched structure — {result.finalUrl}</span>
        <span className="normal-case tracking-normal text-ink-dim">
          {result.httpStatus} · {result.fetchTimeMs}ms
        </span>
      </div>

      <div className="border border-line bg-surface p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
          <CountBadge label="Headings" value={page.counts.headings} />
          <CountBadge label="Links" value={page.counts.links} />
          <CountBadge label="Buttons" value={page.counts.buttons} />
          <CountBadge label="Forms" value={page.counts.forms} />
          <CountBadge label="Form fields" value={page.counts.formFields} />
          <CountBadge label="Images" value={page.counts.images} />
          <CountBadge label="JSON-LD" value={page.counts.structuredData} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Landmarks
            </div>
            <div className="flex flex-wrap gap-2">
              {LANDMARK_LABELS.map(({ key, label }) => {
                const present = page.landmarks[key];
                return (
                  <span
                    key={key}
                    className={`border px-2.5 py-1 font-mono text-xs ${
                      present
                        ? "border-green/30 bg-green-dim text-green"
                        : "border-red/30 bg-red-dim text-red"
                    }`}
                  >
                    {present ? "✓" : "✗"} {label}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Quick flags
            </div>
            <ul className="flex flex-col gap-1.5 font-sans text-[13.5px] text-ink-dim">
              <li>
                <span className={unlabeledFields > 0 ? "text-red" : "text-green"}>
                  {unlabeledFields}
                </span>{" "}
                form field(s) without a label
              </li>
              <li>
                <span className={emptyLinks > 0 ? "text-amber" : "text-green"}>{emptyLinks}</span>{" "}
                link(s) with no accessible text
              </li>
              <li>
                <span className={missingAlt > 0 ? "text-amber" : "text-green"}>{missingAlt}</span>{" "}
                image(s) missing alt
              </li>
              <li>
                <span className={page.divSoupCount > 0 ? "text-amber" : "text-green"}>
                  {page.divSoupCount}
                </span>{" "}
                clickable div/span (not a real button)
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => setShowRaw((v) => !v)}
          className="mt-8 font-mono text-xs text-ink-dim transition-colors hover:text-green"
        >
          {showRaw ? "− hide" : "+ show"} raw parsed structure (JSON)
        </button>

        {showRaw && (
          <pre className="mt-4 max-h-96 overflow-auto border border-line bg-bg p-4 font-mono text-[12px] leading-relaxed text-ink-dim">
            {JSON.stringify(page, null, 2)}
          </pre>
        )}
      </div>

      <ChecksPanel categories={result.categories} />
    </div>
  );
}
