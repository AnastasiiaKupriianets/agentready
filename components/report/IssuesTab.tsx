"use client";

import { useState } from "react";
import type { Issue } from "@/lib/issues";

function IssueCard({ issue, defaultOpen }: { issue: Issue; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const isCritical = issue.severity === "critical";

  return (
    <div className="border border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-2 w-2 flex-none rounded-full ${isCritical ? "bg-red" : "bg-amber"}`}
          />
          <div>
            <div className="font-sans text-sm font-semibold text-ink">{issue.title}</div>
            <p className="mt-1 font-sans text-xs text-ink-dim">{issue.why}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="border border-line-strong px-2 py-0.5 font-mono text-[10px] text-ink-faint">
                {issue.category}
              </span>
              {issue.example && (
                <span className="border border-line-strong px-2 py-0.5 font-mono text-[10px] text-ink-faint">
                  live example
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`flex-none font-mono text-xs ${isCritical ? "text-red" : "text-amber"}`}>
          −{issue.scoreImpact}
        </span>
      </button>

      {open && (
        <div className="border-t border-line px-5 py-4">
          <span
            className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
              isCritical ? "border-red/30 bg-red-dim text-red" : "border-amber/30 bg-amber-dim text-amber"
            }`}
          >
            {isCritical ? "Critical" : "Warning"}
          </span>

          {issue.example && (
            <div className="mt-3">
              <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
                Found on this page
              </div>
              <pre className="overflow-x-auto border border-line bg-bg p-3 font-mono text-xs text-ink-dim">
                {issue.example}
              </pre>
            </div>
          )}

          <div className="mt-3">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-faint">How to fix</div>
            <p className="font-sans text-sm text-ink-dim">{issue.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function IssuesTab({ issues }: { issues: Issue[] }) {
  const critical = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (issues.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-sm text-ink-dim">
          No issues found in the checks that could be statically evaluated. Nice.
        </p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">What&rsquo;s blocking AI agents?</h2>
        <div className="flex gap-4 font-mono text-xs text-ink-faint">
          <span className="text-red">{critical.length} critical</span>
          <span className="text-amber">{warnings.length} warning</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {issues.map((issue, i) => (
          <IssueCard key={issue.id} issue={issue} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
}
