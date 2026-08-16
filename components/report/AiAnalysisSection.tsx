import type { AiAnalysisResult } from "@/lib/ai";

export function AiAnalysisSection({ ai }: { ai: AiAnalysisResult }) {
  if (!ai.available || ai.insights.length === 0) return null;

  return (
    <div className="mt-6 border border-ai/30">
      <div className="flex items-center gap-2 border-b border-ai/30 bg-ai-dim px-5 py-3">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1L8.3 5.2L12.5 6.5L8.3 7.8L7 12L5.7 7.8L1.5 6.5L5.7 5.2L7 1Z"
            fill="var(--color-ai)"
          />
        </svg>
        <span className="font-sans text-sm font-semibold text-ink">AI Agent Analysis</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-wide text-ai">
          AI-generated · not part of the ARS score
        </span>
      </div>

      <div className="flex flex-col divide-y divide-line">
        {ai.insights.map((insight, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-ink">&ldquo;{insight.controlText}&rdquo;</span>
              <span
                className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                  insight.isAmbiguous
                    ? "border-amber/30 bg-amber-dim text-amber"
                    : "border-green/30 bg-green-dim text-green"
                }`}
              >
                {insight.isAmbiguous ? "Ambiguous" : "Understandable"}
              </span>
              {insight.nearestHeading && (
                <span className="font-mono text-[11px] text-ink-faint">
                  near heading &ldquo;{insight.nearestHeading}&rdquo;
                </span>
              )}
            </div>
            <p className="mt-2 font-sans text-sm text-ink-dim">{insight.explanation}</p>
            {insight.recommendation && (
              <p className="mt-1.5 font-sans text-sm text-ink">
                <span className="text-ai">→</span> {insight.recommendation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
