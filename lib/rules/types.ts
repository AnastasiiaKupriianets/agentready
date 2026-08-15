export type CheckStatus = "pass" | "partial" | "fail" | "na";

export type CategoryId =
  | "semantic-structure"
  | "actions-controls"
  | "forms"
  | "navigation"
  | "machine-readable-data"
  | "trust-state";

export interface CheckResult {
  /** Stable machine id, e.g. "semantic.h1-exists" — used as a React key and for future diffing. */
  id: string;
  category: CategoryId;
  label: string;
  maxPoints: number;
  /** 0 when status is "na" — an inapplicable check contributes to neither the earned nor the possible total. */
  earnedPoints: number;
  status: CheckStatus;
  /** Short, human explanation of what was found on this specific page. */
  detail: string;
  /** Present only when status === "na": why this couldn't be verified from static HTML alone. */
  limitation?: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  weight: number;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "semantic-structure", label: "Semantic Structure", weight: 20 },
  { id: "actions-controls", label: "Actions & Controls", weight: 20 },
  { id: "forms", label: "Forms", weight: 20 },
  { id: "navigation", label: "Navigation & Discoverability", weight: 15 },
  { id: "machine-readable-data", label: "Machine-Readable Data", weight: 15 },
  { id: "trust-state", label: "Trust & State Clarity", weight: 10 },
];
