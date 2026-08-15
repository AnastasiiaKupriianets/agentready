export type ScoreTier = "green" | "amber" | "red";

export interface CategoryScore {
  label: string;
  score: number;
}

export interface ReportSummary {
  url: string;
  overallScore: number;
  overallLabel: string;
  categories: CategoryScore[];
}

/**
 * Score tier thresholds, matching the ARS status bands:
 * >= 80 healthy, 60-79 friction, < 60 blocked.
 */
export function scoreTier(score: number): ScoreTier {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "red";
}

export const exampleReport: ReportSummary = {
  url: "agentready.dev/r/acme-shop",
  overallScore: 72,
  overallLabel: "Partially navigable by agents",
  categories: [
    { label: "Content Understanding", score: 91 },
    { label: "Navigation", score: 74 },
    { label: "Forms & Actions", score: 58 },
    { label: "Semantic Structure", score: 82 },
    { label: "Structured Data", score: 64 },
    { label: "Agent Accessibility", score: 69 },
  ],
};
