"use client";

import { useState } from "react";
import type { CategoryChecks } from "@/lib/rules";
import type { CheckResult, CheckStatus } from "@/lib/rules/types";

const STATUS_STYLE: Record<CheckStatus, string> = {
  pass: "border-green/30 bg-green-dim text-green",
  partial: "border-amber/30 bg-amber-dim text-amber",
  fail: "border-red/30 bg-red-dim text-red",
  na: "border-line-strong bg-white/[0.03] text-ink-faint",
};

const STATUS_LABEL: Record<CheckStatus, string> = {
  pass: "PASS",
  partial: "PARTIAL",
  fail: "FAIL",
  na: "N/A",
};

function CheckRow({ check }: { check: CheckResult }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-line py-3 first:border-t-0">
      <div className="min-w-0">
        <div className="font-sans text-[13.5px] text-ink">{check.label}</div>
        <div className="mt-1 font-sans text-xs text-ink-dim">
          {check.status === "na" ? check.limitation : check.detail}
        </div>
      </div>
      <div className="flex flex-none flex-col items-end gap-1">
        <span className={`border px-2 py-0.5 font-mono text-[10px] tracking-wide ${STATUS_STYLE[check.status]}`}>
          {STATUS_LABEL[check.status]}
        </span>
        <span className="font-mono text-[11px] text-ink-faint">
          {check.status === "na" ? "—" : `${check.earnedPoints}/${check.maxPoints}`}
        </span>
      </div>
    </div>
  );
}

function CategoryBlock({ category }: { category: CategoryChecks }) {
  const [open, setOpen] = useState(false);

  const applicable = category.checks.filter((c) => c.status !== "na");
  const passCount = category.checks.filter((c) => c.status === "pass").length;
  const partialCount = category.checks.filter((c) => c.status === "partial").length;
  const failCount = category.checks.filter((c) => c.status === "fail").length;
  const naCount = category.checks.filter((c) => c.status === "na").length;
  const earned = applicable.reduce((sum, c) => sum + c.earnedPoints, 0);
  const possible = applicable.reduce((sum, c) => sum + c.maxPoints, 0);

  return (
    <div className="border border-line">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <div className="font-sans text-sm font-semibold text-ink">{category.label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-ink-faint">
            <span className="text-green">{passCount} pass</span>
            <span className="text-amber">{partialCount} partial</span>
            <span className="text-red">{failCount} fail</span>
            <span>{naCount} n/a</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-ink-dim">
            {possible > 0 ? `${Math.round(earned * 10) / 10}/${possible} pts checked` : "—"}
          </span>
          <span className="font-mono text-ink-faint">{open ? "−" : "+"}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-line px-5 pb-2">
          {category.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChecksPanel({ categories }: { categories: CategoryChecks[] }) {
  return (
    <div className="mt-10">
      <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
        ARS checks — by category (Etap 3, no aggregated score yet)
      </div>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <CategoryBlock key={cat.id} category={cat} />
        ))}
      </div>
      <p className="mt-4 font-sans text-xs text-ink-faint">
        “N/A” checks are things ARS defines but that genuinely can&rsquo;t be verified from static
        HTML alone (e.g. validation messages, hover-only interactions) — expand a category to see
        why. Weighted scoring and the 0–100 readiness number land in Etap 4.
      </p>
    </div>
  );
}
