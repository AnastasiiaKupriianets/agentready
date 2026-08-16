import type { ParsedPage } from "../parser";
import type { AiControlContext } from "./provider";
import { isAmbiguousPhrase } from "../rules/wordlists";

const MAX_CANDIDATES = 3;

/**
 * Picks controls worth spending an AI call on: no accessible name at all, or
 * text matching the deterministic ambiguous-phrase list. Deduplicated by
 * text so identical "Continue" buttons across a page don't burn multiple
 * calls on the same question.
 */
export function selectAiCandidates(page: ParsedPage, max = MAX_CANDIDATES): AiControlContext[] {
  const seen = new Set<string>();
  const candidates: AiControlContext[] = [];

  for (const button of page.buttons) {
    const isCandidate = !button.hasAccessibleName || isAmbiguousPhrase(button.text);
    if (!isCandidate) continue;

    const key = button.text.trim().toLowerCase() || "(empty)";
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      controlText: button.text || "(no visible text)",
      nearestHeading: button.nearestHeading,
      pageTitle: page.title,
    });

    if (candidates.length >= max) break;
  }

  return candidates;
}
