import type { ParsedPage } from "@/lib/parser";
import type { CheckResult, CategoryId } from "./types";
import { CATEGORIES } from "./types";
import { runSemanticStructureChecks } from "./semanticStructure";
import { runActionsControlsChecks } from "./actionsControls";
import { runFormsChecks } from "./forms";
import { runNavigationChecks } from "./navigation";
import { runMachineReadableDataChecks } from "./machineReadableData";
import { runTrustStateChecks } from "./trustState";

export * from "./types";

export function runAllChecks(page: ParsedPage): CheckResult[] {
  return [
    ...runSemanticStructureChecks(page),
    ...runActionsControlsChecks(page),
    ...runFormsChecks(page),
    ...runNavigationChecks(page),
    ...runMachineReadableDataChecks(page),
    ...runTrustStateChecks(page),
  ];
}

export interface CategoryChecks {
  id: CategoryId;
  label: string;
  weight: number;
  checks: CheckResult[];
}

/** Groups the flat check list by category, in the canonical ARS order. Scoring/aggregation is Etap 4. */
export function groupChecksByCategory(checks: CheckResult[]): CategoryChecks[] {
  return CATEGORIES.map((meta) => ({
    id: meta.id,
    label: meta.label,
    weight: meta.weight,
    checks: checks.filter((c) => c.category === meta.id),
  }));
}
