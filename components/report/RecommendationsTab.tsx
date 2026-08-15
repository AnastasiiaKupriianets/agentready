"use client";

import { useMemo, useState } from "react";
import type { Issue } from "@/lib/issues";
import type { ScoringResult } from "@/lib/scoring";

export function RecommendationsTab({
  issues,
  scoring,
}: {
  issues: Issue[];
  scoring: ScoringResult;
}) {
  const fixable = useMemo(() => [...issues].sort((a, b) => b.scoreImpact - a.scoreImpact), [issues]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(fixable.map((i) => i.id)));
  }

  const selectedImpact = fixable
    .filter((i) => selected.has(i.id))
    .reduce((sum, i) => sum + i.scoreImpact, 0);
  const projected = Math.min(100, Math.round(scoring.overallScore + selectedImpact));

  if (fixable.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-sm text-ink-dim">Nothing to recommend — every checkable item passed.</p>
      </div>
    );
  }

  return (
    <div className="py-10">
      <h2 className="mb-2 font-display text-xl font-semibold text-ink">Recommendations</h2>
      <p className="mb-6 font-sans text-sm text-ink-dim">
        Toggle a fix to see its real, computed effect on your readiness score.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-2">
          {fixable.map((issue) => (
            <label
              key={issue.id}
              className="flex cursor-pointer items-start gap-3 border border-line p-4 transition-colors hover:border-line-strong"
            >
              <input
                type="checkbox"
                checked={selected.has(issue.id)}
                onChange={() => toggle(issue.id)}
                className="mt-1 h-4 w-4 flex-none accent-[#35e0a1]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-sans text-sm font-semibold text-ink">{issue.title}</span>
                  <span className="flex-none font-mono text-xs text-green">+{issue.scoreImpact}</span>
                </div>
                <p className="mt-1 font-sans text-xs text-ink-dim">{issue.fix}</p>
                <span className="mt-2 inline-block border border-line-strong px-2 py-0.5 font-mono text-[10px] text-ink-faint">
                  {issue.category}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="h-fit border border-line p-6 lg:sticky lg:top-24">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Before / After
          </div>

          <div className="border border-line p-4">
            <div className="font-mono text-[11px] text-ink-faint">Before</div>
            <div className="mt-1 font-display text-3xl font-bold text-ink">{scoring.overallScore}</div>
          </div>

          <div className="my-2 text-center font-mono text-ink-faint">↓</div>

          <div className="border border-green/30 bg-green-dim p-4">
            <div className="font-mono text-[11px] text-green">After selected fixes</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-green">{projected}</span>
              <span className="font-mono text-xs text-ink-dim">
                {selected.size} fix{selected.size === 1 ? "" : "es"} selected
              </span>
            </div>
          </div>

          <button
            onClick={selectAll}
            className="mt-4 w-full border border-green bg-green py-2.5 font-sans text-sm font-bold text-[#08120d] transition-transform hover:-translate-y-px"
          >
            Select all fixes
          </button>
          <p className="mt-3 text-center font-mono text-[11px] text-ink-faint">
            re-run scan after shipping →
          </p>
        </div>
      </div>
    </div>
  );
}
