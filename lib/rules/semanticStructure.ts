import type { ParsedPage } from "@/lib/parser";
import type { CheckResult } from "./types";
import type { ItemVerdict } from "./helpers";
import { makeCheck, makeBinaryCheck } from "./helpers";

export function runSemanticStructureChecks(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];
  const category = "semantic-structure" as const;

  // Exactly one H1 — 3 pts (0 if missing, half credit if multiple)
  const h1Count = page.headings.filter((h) => h.level === 1).length;
  checks.push({
    id: "semantic.h1-count",
    category,
    label: "Exactly one H1",
    maxPoints: 3,
    earnedPoints: h1Count === 1 ? 3 : h1Count > 1 ? 1.5 : 0,
    status: h1Count === 1 ? "pass" : h1Count > 1 ? "partial" : "fail",
    detail:
      h1Count === 0
        ? "No H1 found on the page."
        : h1Count === 1
          ? "Exactly one H1, as expected."
          : `Found ${h1Count} H1 elements — ambiguous primary heading.`,
  });

  // Correct heading hierarchy — 3 pts (no skipped levels)
  let maxSeen = 0;
  let violations = 0;
  for (const h of page.headings) {
    if (h.level > maxSeen + 1) violations++;
    maxSeen = Math.max(maxSeen, h.level);
  }
  const hierarchyFraction =
    page.headings.length === 0 ? 0 : Math.max(0, 1 - violations / page.headings.length);
  checks.push({
    id: "semantic.heading-hierarchy",
    category,
    label: "Correct heading hierarchy",
    maxPoints: 3,
    earnedPoints: Math.round(3 * hierarchyFraction * 10) / 10,
    status: page.headings.length === 0 ? "fail" : violations === 0 ? "pass" : violations <= 2 ? "partial" : "fail",
    detail:
      page.headings.length === 0
        ? "No headings to evaluate."
        : violations === 0
          ? "No skipped heading levels."
          : `${violations} place(s) where a heading level was skipped (e.g. H1 → H3).`,
  });

  // Semantic landmarks — 4 pts
  const landmarkKeys = Object.values(page.landmarks);
  const landmarksPresent = landmarkKeys.filter(Boolean).length;
  checks.push(
    makeCheck({
      id: "semantic.landmarks",
      category,
      label: "Semantic landmarks present",
      maxPoints: 4,
      verdicts: landmarkKeys.map((present): ItemVerdict => (present ? "pass" : "fail")),
      detail: `${landmarksPresent}/4 landmark regions present (header, nav, main, footer).`,
    })
  );

  // Meaningful image alt text — 3 pts
  if (page.images.length === 0) {
    checks.push({
      id: "semantic.image-alt",
      category,
      label: "Images have meaningful alt text",
      maxPoints: 3,
      earnedPoints: 0,
      status: "na",
      detail: "No <img> elements found on the page.",
    });
  } else {
    const verdicts: ItemVerdict[] = page.images.map((img) => (img.hasAlt ? "pass" : "fail"));
    const missing = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "semantic.image-alt",
        category,
        label: "Images have meaningful alt text",
        maxPoints: 3,
        verdicts,
        detail: `${missing}/${page.images.length} image(s) missing an alt attribute entirely.`,
      })
    );
  }

  // Interactive elements have accessible names — 4 pts (buttons; links are scored under Navigation)
  if (page.buttons.length === 0) {
    checks.push({
      id: "semantic.accessible-names",
      category,
      label: "Interactive elements have accessible names",
      maxPoints: 4,
      earnedPoints: 0,
      status: "na",
      detail: "No buttons found on the page.",
    });
  } else {
    const verdicts: ItemVerdict[] = page.buttons.map((b): ItemVerdict => (b.hasAccessibleName ? "pass" : "fail"));
    const unnamed = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "semantic.accessible-names",
        category,
        label: "Interactive elements have accessible names",
        maxPoints: 4,
        verdicts,
        detail: `${unnamed}/${page.buttons.length} button(s) with no readable text, aria-label, or aria-labelledby.`,
      })
    );
  }

  // DOM isn't "div soup" — 3 pts
  const totalInteractive = page.buttons.length + page.links.length + page.divSoupCount;
  checks.push(
    makeBinaryCheck({
      id: "semantic.no-div-soup",
      category,
      label: "DOM isn't “div soup”",
      maxPoints: 3,
      pass: page.divSoupCount === 0,
      detail:
        page.divSoupCount === 0
          ? "No clickable elements built as div/span onclick instead of a real control."
          : `${page.divSoupCount} clickable div/span found where a button or link should be used (of ${totalInteractive} interactive elements).`,
    })
  );

  return checks;
}
