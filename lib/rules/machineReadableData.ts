import type { ParsedPage } from "@/lib/parser";
import type { CheckResult } from "./types";
import type { ItemVerdict } from "./helpers";
import { makeCheck, makeNotApplicable } from "./helpers";

export function runMachineReadableDataChecks(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];
  const category = "machine-readable-data" as const;

  // JSON-LD / Schema.org — up to 6 pts
  if (page.structuredData.length === 0) {
    checks.push({
      id: "data.json-ld",
      category,
      label: "JSON-LD / Schema.org present",
      maxPoints: 6,
      earnedPoints: 0,
      status: "fail",
      detail: "No <script type=\"application/ld+json\"> blocks found.",
    });
  } else {
    const verdicts: ItemVerdict[] = page.structuredData.map((sd): ItemVerdict =>
      sd.valid && sd.type ? "pass" : sd.valid ? "partial" : "fail"
    );
    const invalid = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "data.json-ld",
        category,
        label: "JSON-LD / Schema.org present",
        maxPoints: 6,
        verdicts,
        detail: `${page.structuredData.length} JSON-LD block(s) found, ${invalid} invalid JSON. This checks presence and parseability — not yet whether the schema type matches the page's actual content.`,
      })
    );
  }

  // Basic metadata — 3 pts
  const metaVerdicts: ItemVerdict[] = [
    page.title ? "pass" : "fail",
    page.metaDescription ? "pass" : "fail",
  ];
  checks.push(
    makeCheck({
      id: "data.basic-metadata",
      category,
      label: "Basic metadata present",
      maxPoints: 3,
      verdicts: metaVerdicts,
      detail: `<title>: ${page.title ? "present" : "missing"}. meta description: ${
        page.metaDescription ? "present" : "missing"
      }.`,
    })
  );

  // Business-critical data available as text — 3 pts
  checks.push(
    makeNotApplicable({
      id: "data.text-not-pixels",
      category,
      label: "Business-critical data is text, not pixels",
      maxPoints: 3,
      limitation:
        "Confirming a price or key fact exists only inside a canvas or image requires rendering the page — not detectable from raw HTML alone.",
    })
  );

  // Machine-recognizable relationships — 3 pts
  checks.push(
    makeNotApplicable({
      id: "data.relationships",
      category,
      label: "Data has machine-recognizable relationships",
      maxPoints: 3,
      limitation:
        "Whether price + currency + availability are correctly tied to one product needs schema-aware content understanding beyond structural extraction.",
    })
  );

  return checks;
}
