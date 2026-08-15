import type { ParsedPage } from "@/lib/parser";
import { findSchemaGaps } from "@/lib/structuredDataGaps";

const LANDMARK_ROWS: { key: keyof ParsedPage["landmarks"]; tag: string }[] = [
  { key: "header", tag: "<header>" },
  { key: "nav", tag: "<nav>" },
  { key: "main", tag: "<main>" },
  { key: "footer", tag: "<footer>" },
];

export function StructureTab({ page }: { page: ParsedPage }) {
  const { rows: headingRows } = page.headings.reduce<{
    rows: Array<ParsedPage["headings"][number] & { skipped: boolean }>;
    maxSeen: number;
  }>(
    (acc, h) => {
      acc.rows.push({ ...h, skipped: h.level > acc.maxSeen + 1 });
      acc.maxSeen = Math.max(acc.maxSeen, h.level);
      return acc;
    },
    { rows: [], maxSeen: 0 }
  );

  const gaps = findSchemaGaps(page.structuredData);

  return (
    <div className="py-10">
      <h2 className="mb-2 font-display text-xl font-semibold text-ink">Structure</h2>
      <p className="mb-6 max-w-[640px] font-sans text-sm text-ink-dim">
        Landmarks, heading order, and machine-readable data an agent uses to orient itself.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border border-line">
          <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Landmarks
          </div>
          <div className="px-4">
            {LANDMARK_ROWS.map((row) => {
              const present = page.landmarks[row.key];
              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between border-b border-line py-3 last:border-b-0"
                >
                  <span className="font-mono text-sm text-ink">{row.tag}</span>
                  <span className="font-sans text-xs text-ink-dim">{present ? "Present" : "Not found"}</span>
                  <span className={`font-mono text-xs ${present ? "text-green" : "text-red"}`}>
                    {present ? "ok" : "missing"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border border-line">
          <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Heading outline
          </div>
          <div className="max-h-80 overflow-y-auto px-4 py-3">
            {headingRows.length === 0 && (
              <p className="font-sans text-xs text-ink-faint">No headings found.</p>
            )}
            {headingRows.map((h, i) => (
              <div
                key={i}
                className="flex items-baseline gap-2 py-1 font-mono text-[13px]"
                style={{ paddingLeft: `${(h.level - 1) * 16}px` }}
              >
                <span className="text-ink-faint">h{h.level}</span>
                <span className={h.skipped ? "text-amber" : "text-ink"}>{h.text || "(empty)"}</span>
                {h.skipped && (
                  <span className="ml-auto border border-amber/30 bg-amber-dim px-1.5 py-0.5 text-[10px] text-amber">
                    skipped level
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border border-line">
        <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          Structured data
        </div>
        <div className="p-4">
          {page.structuredData.length === 0 ? (
            <p className="font-sans text-xs text-ink-faint">No JSON-LD found on this page.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {page.structuredData.map((sd, i) => (
                <pre
                  key={i}
                  className="overflow-x-auto border border-line bg-bg p-3 font-mono text-xs text-ink-dim"
                >
                  {sd.valid ? JSON.stringify(sd.raw, null, 2) : "Invalid JSON in this block."}
                </pre>
              ))}
              {gaps.map((gap, i) => (
                <p key={i} className="font-mono text-xs text-amber">
                  {gap.type}: missing {gap.missing.join(", ")} — agents can&rsquo;t fully compare or
                  trust this record.
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
