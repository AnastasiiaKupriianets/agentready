import type { AnalyzeApiResult } from "@/lib/apiTypes";
import type { CategoryChecks } from "@/lib/rules";
import { ScoreGauge } from "@/components/ScoreGauge";
import { AiAnalysisSection } from "./AiAnalysisSection";
import type { ReportTab } from "./ReportHeader";

function worstCheckSummary(cat: CategoryChecks): string {
  const applicable = cat.checks.filter((c) => c.status !== "na");
  if (applicable.length === 0) return "No applicable checks for this page.";
  const worst = [...applicable].sort((a, b) => {
    const ra = a.maxPoints > 0 ? a.earnedPoints / a.maxPoints : 1;
    const rb = b.maxPoints > 0 ? b.earnedPoints / b.maxPoints : 1;
    return ra - rb;
  })[0];
  if (worst.status === "pass") return "All applicable checks passing.";
  return worst.detail;
}

function tierColor(percentage: number): string {
  if (percentage >= 80) return "text-green";
  if (percentage >= 60) return "text-amber";
  return "text-red";
}

function tierBar(percentage: number): string {
  if (percentage >= 80) return "bg-green";
  if (percentage >= 60) return "bg-amber";
  return "bg-red";
}

export function OverviewTab({
  result,
  onNavigate,
}: {
  result: AnalyzeApiResult;
  onNavigate: (tab: ReportTab) => void;
}) {
  const { scoring } = result;

  const recoverable = result.issues.reduce((sum, i) => sum + i.scoreImpact, 0);
  const projectedScore = Math.min(100, Math.round(scoring.overallScore + recoverable));

  return (
    <div className="py-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="border border-line bg-surface p-8">
          <ScoreGauge score={scoring.overallScore} title="AI Agent Readiness" subtitle={scoring.status} />
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6 text-center">
            <div>
              <div className="font-mono text-xl font-semibold text-red">{scoring.criticalBlockers.length}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Critical</div>
            </div>
            <div>
              <div className="font-mono text-xl font-semibold text-amber">
                {result.issues.filter((i) => i.severity === "warning").length}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Warnings</div>
            </div>
            <div>
              <div className="font-mono text-xl font-semibold text-green">{scoring.passCount}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wide text-ink-faint">Passed</div>
            </div>
          </div>
          {scoring.downgradedByBlocker && (
            <p className="mt-5 border-t border-line pt-4 font-sans text-xs text-ink-faint">
              Score alone would read Agent Ready, but a Critical Blocker holds the status at{" "}
              <span className="text-ink">Mostly Ready</span>.
            </p>
          )}
          {scoring.scoredWeight < 100 && (
            <p className="mt-3 font-sans text-xs text-ink-faint">
              Computed from {scoring.scoredWeight}/100 spec points — the rest needs runtime or
              visual inspection this scan doesn&rsquo;t do yet.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {scoring.categories.map((cat) => {
            const catChecks = result.categories.find((c) => c.id === cat.id)!;
            return (
              <div key={cat.id} className="border border-line p-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-sans text-sm font-semibold text-ink">{cat.label}</span>
                  {cat.hasData ? (
                    <span className={`font-mono text-sm font-semibold ${tierColor(cat.percentage)}`}>
                      {Math.round(cat.percentage)}
                    </span>
                  ) : (
                    <span className="font-mono text-sm text-ink-faint">—</span>
                  )}
                </div>
                <div className="mt-2 h-1 bg-white/6">
                  {cat.hasData && (
                    <div
                      className={`h-full ${tierBar(cat.percentage)}`}
                      style={{ width: `${Math.min(100, cat.percentage)}%` }}
                    />
                  )}
                </div>
                <p className="mt-3 font-sans text-xs leading-relaxed text-ink-dim">
                  {cat.hasData
                    ? worstCheckSummary(catChecks)
                    : "Nothing in this category could be statically verified on this page — it's excluded from the score rather than counted as a failure."}
                </p>
                {cat.naCount > 0 && cat.hasData && (
                  <p className="mt-1.5 font-mono text-[10px] text-ink-faint">
                    {cat.naCount} check(s) need runtime/visual inspection, not scored here
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AiAnalysisSection ai={result.aiAnalysis} />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => onNavigate("agent-view")}
          className="border border-line p-6 text-left transition-colors hover:border-line-strong"
        >
          <div className="font-sans text-sm font-semibold text-ink">Agent View</div>
          <p className="mt-2 font-sans text-xs leading-relaxed text-ink-dim">
            See the structural tree an agent actually receives from this page —{" "}
            {result.agentViewMeta.unreadableCount} node(s) flagged unreadable.
          </p>
          <span className="mt-3 inline-block font-mono text-xs text-green">Open Agent View →</span>
        </button>

        <button
          onClick={() => onNavigate("recommendations")}
          className="border border-line p-6 text-left transition-colors hover:border-line-strong"
        >
          <div className="font-sans text-sm font-semibold text-ink">Projected after fixes</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl text-ink">{scoring.overallScore}</span>
            <span className="font-mono text-ink-faint">→</span>
            <span className="font-mono text-2xl text-green">{projectedScore}</span>
          </div>
          <p className="mt-2 font-sans text-xs leading-relaxed text-ink-dim">
            If every fixable issue below were resolved. {result.issues.length} fix(es) available.
          </p>
          <span className="mt-3 inline-block font-mono text-xs text-green">See recommendations →</span>
        </button>
      </div>
    </div>
  );
}
