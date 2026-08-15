import type { ParsedPage } from "@/lib/parser";
import type { CheckResult } from "./types";
import type { ItemVerdict } from "./helpers";
import { makeCheck, makeBinaryCheck, makeNotApplicable } from "./helpers";
import { isAmbiguousPhrase, isDestructiveText } from "./wordlists";

export function runActionsControlsChecks(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];
  const category = "actions-controls" as const;

  // Descriptive button names — 6 pts
  if (page.buttons.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "actions.descriptive-names",
        category,
        label: "Buttons have descriptive names",
        maxPoints: 6,
        limitation: "No buttons found on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = page.buttons.map((b): ItemVerdict => {
      if (!b.hasAccessibleName) return "fail";
      if (isAmbiguousPhrase(b.text)) return "partial";
      return "pass";
    });
    const ambiguous = verdicts.filter((v) => v === "partial").length;
    const empty = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "actions.descriptive-names",
        category,
        label: "Buttons have descriptive names",
        maxPoints: 6,
        verdicts,
        detail: `${empty} unnamed, ${ambiguous} generic (e.g. “Click here”, “Continue”), ${
          page.buttons.length - empty - ambiguous
        } descriptive, of ${page.buttons.length} total.`,
      })
    );
  }

  // Correct HTML elements for actions — 4 pts (proxy: div-soup ratio)
  const totalActionable = page.buttons.length + page.links.length + page.divSoupCount;
  checks.push(
    makeBinaryCheck({
      id: "actions.correct-elements",
      category,
      label: "Actions use <button>, navigation uses <a href>",
      maxPoints: 4,
      pass: page.divSoupCount === 0,
      detail:
        page.divSoupCount === 0
          ? "No action was implemented as a bare clickable div/span."
          : `${page.divSoupCount} of ${totalActionable} interactive elements bypass semantic button/link markup.`,
    })
  );

  // Control state is exposed — 4 pts
  const statefulCandidates = page.buttons.filter((b) => b.disabled || b.hasExposedState);
  if (statefulCandidates.length === 0 && page.buttons.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "actions.state-exposed",
        category,
        label: "Control state is programmatically exposed",
        maxPoints: 4,
        limitation: "No buttons found on the page.",
      })
    );
  } else {
    // We can only confirm state IS exposed where it's present; we can't detect
    // "this control has state that should be exposed but isn't" from static HTML alone
    // (that requires knowing the control's intended behavior). Score on the
    // ratio of interactive controls that expose any state vs total, as a
    // coarse but honest proxy.
    const verdicts: ItemVerdict[] = page.buttons.map((b): ItemVerdict =>
      b.hasExposedState ? "pass" : "partial"
    );
    checks.push(
      makeCheck({
        id: "actions.state-exposed",
        category,
        label: "Control state is programmatically exposed",
        maxPoints: 4,
        verdicts,
        detail: `${statefulCandidates.length}/${page.buttons.length} button(s) expose disabled/expanded/checked/selected/pressed state via attributes.`,
      })
    );
  }

  // Critical (destructive) actions are distinguishable — 3 pts
  const destructiveButtons = page.buttons.filter((b) => isDestructiveText(b.text));
  if (destructiveButtons.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "actions.destructive-clarity",
        category,
        label: "Destructive actions are clearly labeled",
        maxPoints: 3,
        limitation: "No delete/remove/cancel-style actions were detected on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = destructiveButtons.map((b): ItemVerdict =>
      b.hasAccessibleName && b.text.trim().length > 2 ? "pass" : "fail"
    );
    checks.push(
      makeCheck({
        id: "actions.destructive-clarity",
        category,
        label: "Destructive actions are clearly labeled",
        maxPoints: 3,
        verdicts,
        detail: `${destructiveButtons.length} destructive-style action(s) found; checked for a clear, non-icon-only label.`,
      })
    );
  }

  // Icons have accessible names — 3 pts
  const iconButtons = page.buttons.filter((b) => b.containsIcon);
  if (iconButtons.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "actions.icon-labels",
        category,
        label: "Icon-only controls have accessible names",
        maxPoints: 3,
        limitation: "No icon-containing buttons were detected.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = iconButtons.map((b): ItemVerdict =>
      b.hasAccessibleName ? "pass" : "fail"
    );
    const unnamed = verdicts.filter((v) => v === "fail").length;
    checks.push(
      makeCheck({
        id: "actions.icon-labels",
        category,
        label: "Icon-only controls have accessible names",
        maxPoints: 3,
        verdicts,
        detail: `${unnamed}/${iconButtons.length} icon button(s) have no text or aria-label.`,
      })
    );
  }

  return checks;
}
