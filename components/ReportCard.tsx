import { ReportSummary } from "@/lib/types";
import { ScoreGauge } from "./ScoreGauge";
import { CategoryBars } from "./CategoryBars";

export function ReportCard({ report }: { report: ReportSummary }) {
  return (
    <div>
      <div className="mb-3.5 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
        <span>Example report — acme-shop.com</span>
        <a href="#" className="font-sans text-[13px] normal-case tracking-normal text-green hover:underline">
          Open full report →
        </a>
      </div>

      <div className="border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
            <span className="h-2 w-2 rounded-full bg-line-strong" />
          </div>
          <div className="flex-1 text-center font-mono text-xs text-ink-faint">
            {report.url}
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-10 p-6 sm:p-10 md:grid-cols-[220px_1fr] md:gap-12">
          <ScoreGauge
            score={report.overallScore}
            title="AI Agent Readiness"
            subtitle={report.overallLabel}
          />
          <CategoryBars categories={report.categories} />
        </div>
      </div>
    </div>
  );
}
