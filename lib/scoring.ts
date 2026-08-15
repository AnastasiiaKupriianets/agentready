import type { ParsedPage } from "./parser";
import type { CategoryChecks } from "./rules";
import type { CategoryId } from "./rules/types";

export interface CategoryScoreResult {
  id: CategoryId;
  label: string;
  weight: number;
  /** False when every check in this category is "na" — nothing here could be statically verified. */
  hasData: boolean;
  /** This category's own internal percentage (earned/possible among applicable checks only). Meaningless when hasData is false. */
  percentage: number;
  /** This category's contribution to the weighted sum, before renormalizing by scorable weight. */
  weightedPoints: number;
  possiblePoints: number;
  passCount: number;
  partialCount: number;
  failCount: number;
  naCount: number;
}

export interface CriticalBlocker {
  id: string;
  title: string;
  detail: string;
}

export type ReadinessStatus =
  | "Agent Ready"
  | "Mostly Ready"
  | "Agent Friction"
  | "Poor Agent Support"
  | "Agent Blocked";

export interface ScoringResult {
  overallScore: number;
  status: ReadinessStatus;
  /** True when a Critical Blocker prevented the score from reading "Agent Ready" despite a 90+ score. */
  downgradedByBlocker: boolean;
  categories: CategoryScoreResult[];
  criticalBlockers: CriticalBlocker[];
  /** Sum of weights for categories that had at least one statically-verifiable check. The score is out of this, then rescaled to 100 — a category that's entirely "na" is excluded rather than scored as a failure. */
  scoredWeight: number;
  passCount: number;
  partialCount: number;
  failCount: number;
  naCount: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function statusForScore(score: number): ReadinessStatus {
  if (score >= 90) return "Agent Ready";
  if (score >= 75) return "Mostly Ready";
  if (score >= 50) return "Agent Friction";
  if (score >= 25) return "Poor Agent Support";
  return "Agent Blocked";
}

/**
 * Detects the specific, severe conditions ARS defines as Critical Agent
 * Blockers (see /spec#critical-blockers). Only the conditions we can verify
 * from static HTML are checked here — each one maps to a real measurement,
 * not a guess.
 */
function detectCriticalBlockers(page: ParsedPage): CriticalBlocker[] {
  const blockers: CriticalBlocker[] = [];
  const allFields = page.forms.flatMap((f) => f.fields);

  if (allFields.length > 0) {
    const unlabeled = allFields.filter((f) => !f.hasLabel).length;
    const share = unlabeled / allFields.length;
    if (share >= 0.25) {
      blockers.push({
        id: "blocker.unlabeled-fields",
        title: "Form fields lack semantic labels",
        detail: `${unlabeled}/${allFields.length} field(s) (${Math.round(share * 100)}%) have no programmatic label — an agent can't reliably tell what to enter.`,
      });
    }
  }

  if (page.links.length > 0 && !page.landmarks.nav) {
    blockers.push({
      id: "blocker.no-nav-landmark",
      title: "Navigation isn't programmatically reachable",
      detail: "No <nav> landmark or role=\"navigation\" found, even though the page has links.",
    });
  }

  if (page.divSoupCount > 0) {
    blockers.push({
      id: "blocker.div-soup-action",
      title: "A key action exists only as a div, not a button",
      detail: `${page.divSoupCount} clickable div/span found with no button or link semantics — invisible to an agent reading the accessibility tree.`,
    });
  }

  if (page.forms.some((f) => f.fields.length > 0 && !f.hasSubmit)) {
    blockers.push({
      id: "blocker.form-no-submit",
      title: "A form has no discoverable submit control",
      detail: "An agent can fill in fields but has no reliable way to submit the form.",
    });
  }

  return blockers;
}

export function computeScoring(page: ParsedPage, checksByCategory: CategoryChecks[]): ScoringResult {
  const categories: CategoryScoreResult[] = checksByCategory.map((cat) => {
    const applicable = cat.checks.filter((c) => c.status !== "na");
    const earned = applicable.reduce((sum, c) => sum + c.earnedPoints, 0);
    const possible = applicable.reduce((sum, c) => sum + c.maxPoints, 0);
    const hasData = possible > 0;
    const percentage = hasData ? (earned / possible) * 100 : 0;

    return {
      id: cat.id,
      label: cat.label,
      weight: cat.weight,
      hasData,
      percentage: round1(percentage),
      weightedPoints: round1((percentage / 100) * cat.weight),
      possiblePoints: cat.weight,
      passCount: cat.checks.filter((c) => c.status === "pass").length,
      partialCount: cat.checks.filter((c) => c.status === "partial").length,
      failCount: cat.checks.filter((c) => c.status === "fail").length,
      naCount: cat.checks.filter((c) => c.status === "na").length,
    };
  });

  const scorable = categories.filter((c) => c.hasData);
  const scoredWeight = scorable.reduce((sum, c) => sum + c.weight, 0);
  const weightedSum = scorable.reduce((sum, c) => sum + c.weightedPoints, 0);
  const overallScore = scoredWeight > 0 ? Math.round((weightedSum / scoredWeight) * 100) : 0;

  const criticalBlockers = detectCriticalBlockers(page);

  let status = statusForScore(overallScore);
  const downgradedByBlocker = status === "Agent Ready" && criticalBlockers.length > 0;
  if (downgradedByBlocker) status = "Mostly Ready";

  return {
    overallScore,
    status,
    downgradedByBlocker,
    categories,
    criticalBlockers,
    scoredWeight,
    passCount: categories.reduce((s, c) => s + c.passCount, 0),
    partialCount: categories.reduce((s, c) => s + c.partialCount, 0),
    failCount: categories.reduce((s, c) => s + c.failCount, 0),
    naCount: categories.reduce((s, c) => s + c.naCount, 0),
  };
}
