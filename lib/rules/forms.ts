import type { ParsedPage, FormFieldNode } from "@/lib/parser";
import type { CheckResult } from "./types";
import type { ItemVerdict } from "./helpers";
import { makeCheck, makeNotApplicable, makeBinaryCheck } from "./helpers";

const TYPE_HINTS: { pattern: RegExp; expectedType: string }[] = [
  { pattern: /e-?mail/i, expectedType: "email" },
  { pattern: /phone|tel(?:ephone)?/i, expectedType: "tel" },
  { pattern: /password/i, expectedType: "password" },
  { pattern: /url|website/i, expectedType: "url" },
];

function allFields(page: ParsedPage): FormFieldNode[] {
  return page.forms.flatMap((f) => f.fields);
}

export function runFormsChecks(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];
  const category = "forms" as const;
  const fields = allFields(page);

  // Every field has a label — 6 pts
  if (fields.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "forms.labels",
        category,
        label: "Every field has a label",
        maxPoints: 6,
        limitation: "No form fields found on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = fields.map((f): ItemVerdict => (f.hasLabel ? "pass" : "fail"));
    const unlabeled = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "forms.labels",
        category,
        label: "Every field has a label",
        maxPoints: 6,
        verdicts,
        detail: `${unlabeled}/${fields.length} field(s) with no <label>, aria-label, or aria-labelledby.`,
      })
    );
  }

  // Correct input type — 3 pts (heuristic: name/id implies a type)
  const typeHinted = fields
    .map((f) => {
      const key = `${f.name ?? ""} ${f.id ?? ""}`;
      const hint = TYPE_HINTS.find((h) => h.pattern.test(key));
      return hint ? { field: f, expectedType: hint.expectedType } : null;
    })
    .filter((x): x is { field: FormFieldNode; expectedType: string } => x !== null);

  if (typeHinted.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "forms.input-types",
        category,
        label: "Input type matches the data requested",
        maxPoints: 3,
        limitation:
          "No field names/ids matched a recognizable pattern (email, phone, password, url) to check against.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = typeHinted.map(({ field, expectedType }): ItemVerdict =>
      field.type === expectedType ? "pass" : "fail"
    );
    const mismatched = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "forms.input-types",
        category,
        label: "Input type matches the data requested",
        maxPoints: 3,
        verdicts,
        detail: `${mismatched}/${typeHinted.length} field(s) whose name suggests a type (email/tel/password/url) don't use it.`,
      })
    );
  }

  // Name / autocomplete hints — 3 pts
  if (fields.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "forms.name-autocomplete",
        category,
        label: "Fields expose name/autocomplete",
        maxPoints: 3,
        limitation: "No form fields found on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = fields.map((f): ItemVerdict => {
      if (f.name && f.autocomplete) return "pass";
      if (f.name || f.autocomplete) return "partial";
      return "fail";
    });
    checks.push(
      makeCheck({
        id: "forms.name-autocomplete",
        category,
        label: "Fields expose name/autocomplete",
        maxPoints: 3,
        verdicts,
        detail: `Scored on presence of a "name" attribute and "autocomplete" hint across ${fields.length} field(s).`,
      })
    );
  }

  // Required is programmatically marked — 2 pts
  checks.push(
    makeNotApplicable({
      id: "forms.required-marked",
      category,
      label: "Required fields are programmatically marked",
      maxPoints: 2,
      limitation:
        "Static HTML can confirm the required attribute is present where used, but can't tell whether a field that looks required (e.g. a visual asterisk) is missing it — that needs visual/DOM-render inspection.",
    })
  );

  // Validation returns a clear message — 3 pts
  checks.push(
    makeNotApplicable({
      id: "forms.validation-messages",
      category,
      label: "Validation returns a clear message",
      maxPoints: 3,
      limitation: "Requires submitting the form and reading the runtime response — not visible in static HTML.",
    })
  );

  // Submit has an unambiguous name — 2 pts
  if (page.forms.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "forms.submit-clarity",
        category,
        label: "Submit action has an unambiguous name",
        maxPoints: 2,
        limitation: "No forms found on the page.",
      })
    );
  } else {
    checks.push(
      makeBinaryCheck({
        id: "forms.submit-clarity",
        category,
        label: "Submit action has an unambiguous name",
        maxPoints: 2,
        pass: page.forms.every((f) => f.hasSubmit),
        detail: `${page.forms.filter((f) => f.hasSubmit).length}/${page.forms.length} form(s) have a clear submit control.`,
      })
    );
  }

  // Form has a logical structure — 1 pt
  checks.push(
    makeNotApplicable({
      id: "forms.logical-structure",
      category,
      label: "Form has a logical structure",
      maxPoints: 1,
      limitation: "Field grouping and reading order are best judged visually or with fieldset/legend inspection, planned for a later pass.",
    })
  );

  return checks;
}
