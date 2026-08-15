import type { ParsedPage } from "@/lib/parser";
import type { CheckResult } from "./types";
import type { ItemVerdict } from "./helpers";
import { makeCheck, makeNotApplicable } from "./helpers";
import { isDestructiveText } from "./wordlists";

/**
 * Trust & State Clarity is the category most dependent on runtime behavior —
 * whether an action confirms its result, whether "in stock" reflects the
 * true current state, whether a click actually did something. Static HTML
 * can only speak to one piece of it: whether destructive/financial actions
 * are labeled clearly enough to recognize before clicking. The rest is
 * honestly marked n/a rather than guessed at.
 */
export function runTrustStateChecks(page: ParsedPage): CheckResult[] {
  const checks: CheckResult[] = [];
  const category = "trust-state" as const;

  // Destructive / financial actions clearly described — 2 pts
  const destructiveButtons = page.buttons.filter((b) => isDestructiveText(b.text));
  if (destructiveButtons.length === 0) {
    checks.push(
      makeNotApplicable({
        id: "trust.destructive-described",
        category,
        label: "Destructive / financial actions are clearly described",
        maxPoints: 2,
        limitation: "No delete/remove/cancel-style actions were detected on the page.",
      })
    );
  } else {
    const verdicts: ItemVerdict[] = destructiveButtons.map((b): ItemVerdict =>
      b.hasAccessibleName && b.text.trim().length > 2 ? "pass" : "fail"
    );
    checks.push(
      makeCheck({
        id: "trust.destructive-described",
        category,
        label: "Destructive / financial actions are clearly described",
        maxPoints: 2,
        verdicts,
        detail: `${destructiveButtons.length} destructive-style action(s) found and checked for a clear label.`,
      })
    );
  }

  checks.push(
    makeNotApplicable({
      id: "trust.action-confirmation",
      category,
      label: "Actions confirm their outcome",
      maxPoints: 3,
      limitation: "Requires performing the action and observing the resulting DOM/state change at runtime.",
    })
  );

  checks.push(
    makeNotApplicable({
      id: "trust.state-clarity",
      category,
      label: "State has a clear current value (not color-only)",
      maxPoints: 2,
      limitation: "Distinguishing a text-based state from a color-only signal needs rendered/visual inspection.",
    })
  );

  checks.push(
    makeNotApplicable({
      id: "trust.price-availability-explicit",
      category,
      label: "Price / availability / key terms are explicit",
      maxPoints: 2,
      limitation: "Requires linking specific price/availability text to a specific product or offer — content understanding beyond structural extraction.",
    })
  );

  checks.push(
    makeNotApplicable({
      id: "trust.no-visual-only-info",
      category,
      label: "No critical info hidden by visuals only",
      maxPoints: 1,
      limitation: "Needs a rendered comparison between what's visible and what's in the accessibility tree.",
    })
  );

  return checks;
}
