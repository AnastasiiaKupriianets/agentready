"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalyzeApiResult } from "@/lib/apiTypes";
import { exportReportAsMarkdown, exportReportAsJson } from "@/lib/exportReport";

export type ReportTab = "overview" | "issues" | "agent-view" | "structure" | "recommendations";

const TABS: { id: ReportTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "issues", label: "Issues" },
  { id: "agent-view", label: "Agent View" },
  { id: "structure", label: "Structure" },
  { id: "recommendations", label: "Recommendations" },
];

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

function ExportMenu({ result }: { result: AnalyzeApiResult }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="border border-line-strong px-3.5 py-2 font-sans text-sm text-ink transition-colors hover:border-ink-faint"
      >
        Export report
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 border border-line-strong bg-surface">
          <button
            onClick={() => {
              exportReportAsMarkdown(result);
              setOpen(false);
            }}
            className="block w-full px-3.5 py-2.5 text-left font-mono text-xs text-ink-dim hover:bg-white/5 hover:text-ink"
          >
            as Markdown (.md)
          </button>
          <button
            onClick={() => {
              exportReportAsJson(result);
              setOpen(false);
            }}
            className="block w-full border-t border-line px-3.5 py-2.5 text-left font-mono text-xs text-ink-dim hover:bg-white/5 hover:text-ink"
          >
            as JSON (.json)
          </button>
        </div>
      )}
    </div>
  );
}

export function ReportHeader({
  result,
  activeTab,
  onTabChange,
}: {
  result: AnalyzeApiResult;
  activeTab: ReportTab;
  onTabChange: (tab: ReportTab) => void;
}) {
  const router = useRouter();
  const [, forceTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pt-14">
      <a href={result.finalUrl} className="break-all font-mono text-sm text-green hover:underline">
        {result.finalUrl}
      </a>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[28px] font-bold text-ink sm:text-[34px]">
            AI Agent Readiness Report
          </h1>
          <span className="border border-line-strong px-2 py-1 font-mono text-[11px] text-ink-faint">
            scanned {timeAgo(result.fetchedAt)} · {result.agentViewMeta.nodeCount} nodes
          </span>
        </div>

        <div className="flex flex-none gap-2">
          <button
            onClick={() => router.push("/")}
            className="border border-line-strong px-3.5 py-2 font-sans text-sm text-ink transition-colors hover:border-ink-faint"
          >
            New scan
          </button>
          <ExportMenu result={result} />
        </div>
      </div>

      <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 font-sans text-sm transition-colors ${
              activeTab === tab.id
                ? "border-green text-ink"
                : "border-transparent text-ink-dim hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
