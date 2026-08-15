import { ReactNode } from "react";

export interface DocSectionMeta {
  id: string;
  label: string;
}

export function DocsShell({
  eyebrow,
  title,
  description,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: DocSectionMeta[];
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-12 pb-28 pt-14 md:grid-cols-[200px_1fr] md:gap-16">
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            On this page
          </div>
          <nav className="flex flex-col gap-2.5 border-l border-line pl-4">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="font-mono text-[13px] text-ink-dim transition-colors hover:text-green"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-4 inline-flex items-center gap-2 border border-green/25 bg-green-dim px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-green">
          {eyebrow}
        </div>
        <h1 className="font-display text-[34px] font-bold leading-tight text-ink sm:text-[42px]">
          {title}
        </h1>
        <p className="mt-4 max-w-[620px] text-[15px] leading-relaxed text-ink-dim">
          {description}
        </p>

        <div className="mt-14 flex flex-col gap-16">{children}</div>
      </div>
    </div>
  );
}

export function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 font-display text-xl font-semibold text-ink">{title}</h2>
      <div className="flex flex-col gap-4 text-[14.5px] leading-relaxed text-ink-dim">
        {children}
      </div>
    </section>
  );
}

export function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <pre className="overflow-x-auto border border-line bg-surface px-4 py-3.5 font-mono text-[13px] leading-relaxed text-ink">
      <code>{children}</code>
    </pre>
  );
}

export function SpecTable({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[480px] border-collapse text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-line bg-white/[0.03]">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-b-0">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 ${j === 0 ? "text-ink" : "font-mono text-ink-dim"}`}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CALLOUT_STYLES = {
  note: "border-line bg-white/[0.03] text-ink-dim",
  critical: "border-red/30 bg-red-dim text-ink",
  planned: "border-amber/30 bg-amber-dim text-ink",
} as const;

export function Callout({
  tone = "note",
  label,
  children,
}: {
  tone?: keyof typeof CALLOUT_STYLES;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className={`border px-4 py-3.5 text-[13.5px] leading-relaxed ${CALLOUT_STYLES[tone]}`}>
      {label && (
        <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.1em] opacity-80">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
