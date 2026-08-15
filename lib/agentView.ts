import type { ParsedPage } from "./parser";

export type NodeFlag = "unreadable" | "ambiguous" | "duplicate";

export interface AgentViewNode {
  kind: "link" | "heading" | "button" | "field" | "image" | "note";
  label: string;
  detail: string;
  flag?: NodeFlag;
  flagNote?: string;
}

export interface AgentViewSection {
  title: string;
  nodes: AgentViewNode[];
}

export function buildAgentView(page: ParsedPage): AgentViewSection[] {
  const sections: AgentViewSection[] = [];

  // NAVIGATION
  const seenHrefs = new Map<string, number>();
  const navNodes: AgentViewNode[] = page.navLinks.map((l) => {
    const key = l.absoluteHref ?? l.href ?? l.text;
    const count = (seenHrefs.get(key) ?? 0) + 1;
    seenHrefs.set(key, count);
    return {
      kind: "link",
      label: "link",
      detail: `${l.text || "(no text)"} → ${l.href ?? "?"}`,
      flag: l.isEmpty ? "unreadable" : count > 1 ? "duplicate" : undefined,
      flagNote: l.isEmpty ? "no accessible text" : count > 1 ? "duplicate destination" : undefined,
    };
  });
  sections.push({
    title: "NAVIGATION",
    nodes:
      navNodes.length > 0
        ? navNodes
        : [{ kind: "note", label: "note", detail: "No <nav> landmark found — nothing to group here." }],
  });

  // MAIN CONTENT
  const mainNodes: AgentViewNode[] = [
    ...page.headings.map((h) => ({
      kind: "heading" as const,
      label: `h${h.level}`,
      detail: h.text || "(empty heading)",
    })),
    ...page.buttons.map((b) => ({
      kind: "button" as const,
      label: "button",
      detail: b.text || "(no text)",
      flag: (!b.hasAccessibleName ? "unreadable" : undefined) as NodeFlag | undefined,
      flagNote: !b.hasAccessibleName ? "no role/name" : undefined,
    })),
  ];
  sections.push({ title: "MAIN CONTENT", nodes: mainNodes });

  // FORM(S)
  page.forms.forEach((form, i) => {
    const nodes: AgentViewNode[] = form.fields.map((field) => ({
      kind: "field",
      label: "input",
      detail: `${field.name ?? field.id ?? field.type} (${field.type})`,
      flag: !field.hasLabel ? "unreadable" : undefined,
      flagNote: !field.hasLabel ? "no label — purpose unknown" : undefined,
    }));
    sections.push({
      title: page.forms.length > 1 ? `FORM ${i + 1}` : "FORM",
      nodes: nodes.length > 0 ? nodes : [{ kind: "note", label: "note", detail: "Form has no input fields." }],
    });
  });

  // IMAGES
  if (page.images.length > 0) {
    sections.push({
      title: "IMAGES",
      nodes: page.images.map((img) => ({
        kind: "image",
        label: "img",
        detail: img.alt || "(no alt)",
        flag: !img.hasAlt ? "unreadable" : undefined,
        flagNote: !img.hasAlt ? "no alt text — content unknown" : undefined,
      })),
    });
  }

  return sections;
}

export function countUnreadable(sections: AgentViewSection[]): number {
  return sections.reduce((sum, s) => sum + s.nodes.filter((n) => n.flag === "unreadable").length, 0);
}

export function countNodes(sections: AgentViewSection[]): number {
  return sections.reduce((sum, s) => sum + s.nodes.length, 0);
}
