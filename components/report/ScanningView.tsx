"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Fetching website structure",
  "Inspecting semantic HTML",
  "Checking navigation",
  "Analyzing forms and actions",
  "Reading structured data",
  "Reasoning about ambiguous controls",
  "Evaluating agent accessibility",
];

const STEP_INTERVAL_MS = 550;

export function ScanningView({ url }: { url: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return;
    const t = setTimeout(() => setActiveStep((s) => s + 1), STEP_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [activeStep]);

  const progress = Math.min(100, ((activeStep + 1) / STEPS.length) * 100);

  return (
    <div className="pt-16 pb-24">
      <div className="mb-8 flex items-center gap-3 font-mono text-sm text-ink-dim">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-green" />
        Running agent readiness probe on <span className="text-ink">{url}</span>
      </div>

      <div className="border border-line">
        {STEPS.map((step, i) => {
          const state = i < activeStep ? "done" : i === activeStep ? "running" : "queued";
          return (
            <div
              key={step}
              className={`flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0 ${
                state === "queued" ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <span
                  className={`flex h-4 w-4 flex-none items-center justify-center border ${
                    state === "done"
                      ? "border-green bg-green text-[#08120d]"
                      : state === "running"
                        ? "border-green"
                        : "border-line-strong"
                  }`}
                >
                  {state === "done" && (
                    <svg width="9" height="9" viewBox="0 0 10 10">
                      <path d="M1 5l2.5 2.5L9 2" stroke="#08120d" strokeWidth="1.6" fill="none" />
                    </svg>
                  )}
                </span>
                <span className="font-sans text-sm text-ink">{step}...</span>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{state}</span>
            </div>
          );
        })}
        <div className="h-[2px] w-full bg-white/5">
          <div
            className="h-full bg-green transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
