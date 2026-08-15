import type { ParsedPage } from "./parser";
import type { CategoryChecks } from "./rules";
import type { CheckResult, CheckStatus } from "./rules/types";
import { isAmbiguousPhrase } from "./rules/wordlists";

export type IssueSeverity = "critical" | "warning";

export interface Issue {
  id: string;
  severity: IssueSeverity;
  title: string;
  why: string;
  fix: string;
  category: string;
  status: CheckStatus;
  scoreImpact: number;
  /** A concrete instance pulled from this specific scan, when we can point to one. */
  example?: string;
}

interface CheckCopy {
  title: string;
  why: string;
  fix: string;
}

const CHECK_COPY: Record<string, CheckCopy> = {
  "semantic.h1-count": {
    title: "Ambiguous or missing primary heading",
    why: "Agents use the H1 as the anchor for what a page is about. Zero or multiple H1s leaves that ambiguous.",
    fix: "Use exactly one <h1> that states the page's primary purpose.",
  },
  "semantic.heading-hierarchy": {
    title: "Heading levels are skipped",
    why: "A skipped level (e.g. H1 → H3) breaks the outline an agent uses to navigate by section.",
    fix: "Step headings down one level at a time — don't skip levels for visual sizing.",
  },
  "semantic.landmarks": {
    title: "Missing semantic landmarks",
    why: "Landmarks (header/nav/main/footer) let an agent jump straight to the region it needs instead of parsing the whole page.",
    fix: "Wrap the relevant regions in <header>, <nav>, <main>, and <footer> (or the matching ARIA roles).",
  },
  "semantic.image-alt": {
    title: "Images missing alt text",
    why: "Without alt text, an agent can't tell what a meaningful image shows or use it to complete a task.",
    fix: "Add descriptive alt text to meaningful images; use alt=\"\" only for purely decorative ones.",
  },
  "semantic.accessible-names": {
    title: "Interactive elements with no accessible name",
    why: "A control with no text, aria-label, or aria-labelledby is invisible to an agent reading the accessibility tree.",
    fix: "Give every button visible text, or an aria-label if the design has no room for it.",
  },
  "semantic.no-div-soup": {
    title: "Clickable divs instead of real controls",
    why: "A <div onclick> has no role or keyboard behavior — agents relying on the accessibility tree won't see it as actionable.",
    fix: "Replace with <button> for actions or <a href> for navigation.",
  },
  "actions.descriptive-names": {
    title: "Buttons with vague or missing labels",
    why: "\"Continue\" or \"Click here\" doesn't tell an agent what will happen — it has to guess or give up.",
    fix: "Name the action and its target: \"Continue to checkout\" instead of \"Continue\".",
  },
  "actions.correct-elements": {
    title: "Actions not implemented as real controls",
    why: "Non-semantic elements built to look like buttons often don't expose a role, name, or keyboard path.",
    fix: "Use <button> for in-page actions and <a href> for navigation — never a styled <div>.",
  },
  "actions.state-exposed": {
    title: "Control state isn't exposed programmatically",
    why: "An agent can't tell if a toggle is on, a panel is expanded, or a button is disabled without a matching ARIA attribute.",
    fix: "Add aria-expanded / aria-checked / aria-selected / aria-pressed / disabled as appropriate.",
  },
  "actions.destructive-clarity": {
    title: "Destructive action isn't clearly labeled",
    why: "An unlabeled icon on a delete/cancel action risks an agent triggering it without understanding the consequence.",
    fix: "Give destructive actions explicit, unambiguous text — not just an icon.",
  },
  "actions.icon-labels": {
    title: "Icon-only controls with no accessible name",
    why: "A bare SVG or image inside a button carries no meaning for an agent unless the button itself is named.",
    fix: "Add an aria-label describing the action to every icon-only button.",
  },
  "forms.labels": {
    title: "Form fields lack semantic labels",
    why: "An agent maps a field to a value by reading its accessible name. With no label, it has to guess or skip the field.",
    fix: "Add a <label for> or aria-label to every input, select, and textarea.",
  },
  "forms.input-types": {
    title: "Input type doesn't match the data requested",
    why: "The wrong type (e.g. text instead of email) loses the semantic hint agents and autofill both rely on.",
    fix: "Match the input type to the data: type=\"email\", type=\"tel\", type=\"password\", etc.",
  },
  "forms.name-autocomplete": {
    title: "Fields missing name/autocomplete hints",
    why: "Without a name or autocomplete token, an agent has less signal for what a field expects beyond its label.",
    fix: "Add a stable \"name\" attribute and a matching autocomplete token (e.g. autocomplete=\"email\").",
  },
  "forms.submit-clarity": {
    title: "Form has no clear submit control",
    why: "Without a discoverable submit action, an agent can fill in every field and still have no way to complete the task.",
    fix: "Include a <button type=\"submit\"> (or equivalent) with clear text like \"Create account\".",
  },
  "nav.semantic-nav": {
    title: "Primary navigation isn't marked up semantically",
    why: "Without a <nav> landmark, an agent has to guess which links form the site's navigation.",
    fix: "Wrap the primary navigation links in a <nav> element.",
  },
  "nav.descriptive-links": {
    title: "Links use context-free text",
    why: "\"Learn more\" or \"Read more\" says nothing on its own — an agent scanning links out of context can't tell where it goes.",
    fix: "Write link text that describes the destination: \"Learn more about pricing\".",
  },
  "nav.no-broken-links": {
    title: "Empty or broken links",
    why: "A link with no href or href=\"#\" leads nowhere — an agent following it wastes a step.",
    fix: "Give every link a real destination, or remove it if it's not functional yet.",
  },
  "nav.breadcrumbs": {
    title: "No machine-readable breadcrumbs",
    why: "Without BreadcrumbList data, an agent can't cheaply confirm where a page sits in the site hierarchy.",
    fix: "Add a BreadcrumbList JSON-LD block alongside any visual breadcrumb trail.",
  },
  "nav.page-identity": {
    title: "Weak or missing page title",
    why: "The <title> is often the first signal an agent uses to confirm it landed on the right page.",
    fix: "Give the page a specific, descriptive <title> — not \"Untitled\" or a bare domain name.",
  },
  "data.json-ld": {
    title: "No structured data found",
    why: "Without JSON-LD, an agent has to infer facts (price, availability, article type…) from prose instead of reading them directly.",
    fix: "Add a Schema.org JSON-LD block matching the page's content (Product, Article, Organization…).",
  },
  "data.basic-metadata": {
    title: "Missing basic metadata",
    why: "Title and meta description are the fastest way for an agent to confirm what a page is before reading further.",
    fix: "Add a specific <title> and a one-sentence meta description.",
  },
  "trust.destructive-described": {
    title: "Destructive/financial action isn't clearly described",
    why: "An agent shouldn't have to guess whether a click deletes something or costs money.",
    fix: "Label destructive or financial actions in plain text, not just an icon or color.",
  },
};

const FALLBACK_FIX = "Review this check against the ARS spec for the recommended pattern.";

function exampleForCheck(id: string, page: ParsedPage): string | undefined {
  switch (id) {
    case "forms.labels": {
      const field = page.forms.flatMap((f) => f.fields).find((f) => !f.hasLabel);
      if (!field) return undefined;
      const attrs = [field.name ? `name="${field.name}"` : null, field.id ? `id="${field.id}"` : null]
        .filter(Boolean)
        .join(" ");
      return `<input type="${field.type}"${attrs ? " " + attrs : ""}> has no label.`;
    }
    case "actions.descriptive-names": {
      const button = page.buttons.find((b) => !b.hasAccessibleName || isAmbiguousPhrase(b.text));
      if (!button) return undefined;
      return button.hasAccessibleName ? `Detected: "${button.text}"` : "Detected: a button with no text at all.";
    }
    case "nav.descriptive-links": {
      const link = page.links.find((l) => isAmbiguousPhrase(l.text));
      return link ? `Detected: "${link.text}" → ${link.href ?? "?"}` : undefined;
    }
    case "nav.no-broken-links": {
      const link = page.links.find((l) => !l.href || l.href === "#" || l.href.trim() === "");
      return link ? `Link text "${link.text || "(empty)"}" has no working href.` : undefined;
    }
    case "semantic.image-alt": {
      const img = page.images.find((i) => !i.hasAlt);
      return img?.src ? `<img src="${truncate(img.src, 60)}"> has no alt attribute.` : undefined;
    }
    case "semantic.h1-count": {
      const h1s = page.headings.filter((h) => h.level === 1);
      if (h1s.length > 1) return `Found ${h1s.length}: ${h1s.map((h) => `"${h.text || "(empty)"}"`).join(", ")}`;
      return undefined;
    }
    default:
      return undefined;
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function severityFor(check: CheckResult): IssueSeverity {
  if (check.status === "fail" && check.maxPoints >= 4) return "critical";
  return "warning";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Builds the ordered issues list (critical first, then by points recoverable). Skips "pass" and "na" checks. */
export function buildIssues(categories: CategoryChecks[], page: ParsedPage): Issue[] {
  const issues: Issue[] = [];

  for (const cat of categories) {
    for (const check of cat.checks) {
      if (check.status === "pass" || check.status === "na") continue;

      const copy = CHECK_COPY[check.id];
      issues.push({
        id: check.id,
        severity: severityFor(check),
        title: copy?.title ?? check.label,
        why: copy?.why ?? check.detail,
        fix: copy?.fix ?? FALLBACK_FIX,
        category: cat.label,
        status: check.status,
        scoreImpact: round1(check.maxPoints - check.earnedPoints),
        example: exampleForCheck(check.id, page),
      });
    }
  }

  return issues.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1;
    return b.scoreImpact - a.scoreImpact;
  });
}
