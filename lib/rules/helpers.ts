import type { CheckResult, CategoryId, CheckStatus } from "./types";

export type ItemVerdict = "pass" | "partial" | "fail";

/**
 * ARS's core formula: each item in a set (e.g. every button, every form
 * field) resolves to PASS / PARTIAL / FAIL worth 100% / 50% / 0% of the
 * check's points. The check's overall score is the average of its items.
 * See /spec#scoring-formula.
 */
export function scoreItems(verdicts: ItemVerdict[]): { fraction: number; status: CheckStatus } {
  if (verdicts.length === 0) {
    return { fraction: 0, status: "na" };
  }
  const total = verdicts.reduce((sum, v) => sum + (v === "pass" ? 1 : v === "partial" ? 0.5 : 0), 0);
  const fraction = total / verdicts.length;
  const status: CheckStatus = fraction === 1 ? "pass" : fraction === 0 ? "fail" : "partial";
  return { fraction, status };
}

export function makeCheck(params: {
  id: string;
  category: CategoryId;
  label: string;
  maxPoints: number;
  verdicts: ItemVerdict[];
  detail: string;
}): CheckResult {
  const { fraction, status } = scoreItems(params.verdicts);
  return {
    id: params.id,
    category: params.category,
    label: params.label,
    maxPoints: params.maxPoints,
    earnedPoints: round1(params.maxPoints * fraction),
    status,
    detail: params.detail,
  };
}

/** For binary, page-level checks (present/absent) rather than per-item sets. */
export function makeBinaryCheck(params: {
  id: string;
  category: CategoryId;
  label: string;
  maxPoints: number;
  pass: boolean;
  detail: string;
}): CheckResult {
  return {
    id: params.id,
    category: params.category,
    label: params.label,
    maxPoints: params.maxPoints,
    earnedPoints: params.pass ? params.maxPoints : 0,
    status: params.pass ? "pass" : "fail",
    detail: params.detail,
  };
}

/** For checks that genuinely can't be verified from static HTML alone. Honest > falsely precise. */
export function makeNotApplicable(params: {
  id: string;
  category: CategoryId;
  label: string;
  maxPoints: number;
  limitation: string;
}): CheckResult {
  return {
    id: params.id,
    category: params.category,
    label: params.label,
    maxPoints: params.maxPoints,
    earnedPoints: 0,
    status: "na",
    detail: "Not evaluated.",
    limitation: params.limitation,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
