import type { AgentViewSection } from "@/lib/agentView";

function nodeIcon(kind: string): string {
  switch (kind) {
    case "link":
      return "link";
    case "heading":
      return "h";
    case "button":
      return "btn";
    case "field":
      return "input";
    case "image":
      return "img";
    default:
      return "·";
  }
}

export function AgentViewTab({
  sections,
  meta,
}: {
  sections: AgentViewSection[];
  meta: { nodeCount: number; unreadableCount: number };
}) {
  return (
    <div className="py-10">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">Agent View</h2>
        <span className="font-mono text-xs text-ink-faint">
          {meta.nodeCount} nodes · {meta.unreadableCount} unreadable
        </span>
      </div>
      <p className="mb-6 max-w-[640px] font-sans text-sm text-ink-dim">
        The structural tree an agent receives from the DOM and accessibility layer — headings,
        landmarks, actions, and form fields, with anything ambiguous flagged in place. This is a
        structural view, not a visual render.
      </p>

      <div className="flex flex-col gap-4">
        {sections.map((section) => (
          <div key={section.title} className="border border-line">
            <div className="border-b border-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              {section.title}
            </div>
            <div className="px-4 py-2">
              {section.nodes.map((node, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line py-2 font-mono text-[13px] last:border-b-0"
                >
                  <span className="text-ink-faint">→</span>
                  <span className="w-12 flex-none text-ink-faint">{nodeIcon(node.kind)}</span>
                  <span className="text-ink">{node.detail}</span>
                  {node.flag && (
                    <span
                      className={`ml-auto border px-1.5 py-0.5 text-[10px] ${
                        node.flag === "unreadable"
                          ? "border-red/30 bg-red-dim text-red"
                          : "border-amber/30 bg-amber-dim text-amber"
                      }`}
                    >
                      {node.flag === "unreadable" ? "✗" : "⚠"} {node.flagNote}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
