import type { ParsedPage } from "@/lib/parser";
import type { CheckResult } from "./types";
import type { ItemVerdict } from "./helpers";
import { makeCheck, makeBinaryCheck, makeNotApplicable } from "./helpers";
import { isAmbiguousPhrase } from "./wordlists";

export function runNavigationChecks(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];
  const category = "navigation" as const;

  // Primary navigation is semantic — 3 pts
  checks.push(
    makeBinaryCheck({
      id: "nav.semantic-nav",
      category,
      label: "Primary navigation is semantic",
      maxPoints: 3,
      pass: page.landmarks.nav,
      detail: page.landmarks.nav ? "A <nav> landmark (or role=navigation) is present." : "No <nav> landmark found.",
    })
  );

  // Descriptive anchor text — 4 pts
  if (page.links.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "nav.descriptive-links",
        category,
        label: "Links have descriptive anchor text",
        maxPoints: 4,
        limitation: "No links found on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = page.links.map((l): ItemVerdict => {
      if (l.isEmpty) return "fail";
      if (isAmbiguousPhrase(l.text)) return "partial";
      return "pass";
    });
    const ambiguous = verdicts.filter((v) => v === "partial").length;
    checks.push(
      makeCheck({
        id: "nav.descriptive-links",
        category,
        label: "Links have descriptive anchor text",
        maxPoints: 4,
        verdicts,
        detail: `${ambiguous} link(s) use context-free text like “Learn more” with nothing nearby to disambiguate.`,
      })
    );
  }

  // No empty / broken links — 2 pts
  if (page.links.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "nav.no-broken-links",
        category,
        label: "No empty or broken links",
        maxPoints: 2,
        limitation: "No links found on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = page.links.map((l): ItemVerdict => {
      const brokenHref = !l.href || l.href === "#" || l.href.trim() === "";
      return brokenHref || l.isEmpty ? "fail" : "pass";
    });
    const broken = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "nav.no-broken-links",
        category,
        label: "No empty or broken links",
        maxPoints: 2,
        verdicts,
        detail: `${broken}/${page.links.length} link(s) have no href, an empty href, or href="#".`,
      })
    );
  }

  // Breadcrumbs on complex pages — 2 pts
  const hasBreadcrumbData = page.structuredData.some(
    (sd) => sd.valid && sd.type === "BreadcrumbList"
  );
  checks.push(
    hasBreadcrumbData
      ? makeBinaryCheck({
          id: "nav.breadcrumbs",
          category,
          label: "Breadcrumbs are machine-readable",
          maxPoints: 2,
          pass: true,
          detail: "A BreadcrumbList JSON-LD block was found.",
        })
      : makeNotApplicable({
          id: "nav.breadcrumbs",
          category,
          label: "Breadcrumbs are machine-readable",
          maxPoints: 2,
          limitation:
            "No BreadcrumbList JSON-LD found. A visual breadcrumb trail without structured data can't be reliably detected from static HTML, and breadcrumbs aren't expected on every page.",
        })
  );

  // Key functionality isn't hover-only — 2 pts
  checks.push(
    makeNotApplicable({
      id: "nav.no-hover-only",
      category,
      label: "Key functionality isn't hover-only",
      maxPoints: 2,
      limitation: "Requires executing CSS/JS to see what's reachable without a pointer — not visible in static HTML.",
    })
  );

  // Logical page title / identity — 2 pts
  const titleOk = Boolean(page.title && page.title.length > 8 && !/^untitled/i.test(page.title));
  checks.push(
    makeBinaryCheck({
      id: "nav.page-identity",
      category,
      label: "Page has a logical title / identity",
      maxPoints: 2,
      pass: titleOk,
      detail: page.title
        ? `<title>: “${page.title}”`
        : "No <title> element found.",
    })
  );

  return checks;
}
