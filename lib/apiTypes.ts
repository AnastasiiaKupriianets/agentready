import type { ParsedPage } from "./parser";
import type { CategoryChecks } from "./rules";
import type { ScoringResult } from "./scoring";
import type { Issue } from "./issues";
import type { AgentViewSection } from "./agentView";

export interface AnalyzeApiResult {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  fetchTimeMs: number;
  httpStatus: number;
  page: ParsedPage;
  categories: CategoryChecks[];
  scoring: ScoringResult;
  issues: Issue[];
  agentView: AgentViewSection[];
  agentViewMeta: { nodeCount: number; unreadableCount: number };
}

export interface AnalyzeApiError {
  error: string;
}
