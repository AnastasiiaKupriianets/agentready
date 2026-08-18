import type { ParsedPage } from "../parser";
import type { AiControlInsight } from "./provider";
import { selectAiCandidates } from "./selectCandidates";
import { groqProvider } from "./groqProvider";

export interface AiAnalysisResult {
  /** False only when no API key is configured — distinct from "ran but found nothing ambiguous". */
  available: boolean;
  insights: AiControlInsight[];
}

const EMPTY_UNAVAILABLE: AiAnalysisResult = { available: false, insights: [] };

export async function runAiAnalysis(page: ParsedPage): Promise<AiAnalysisResult> {
  try {
    if (!process.env.GROQ_API_KEY) return EMPTY_UNAVAILABLE;

    const candidates = selectAiCandidates(page);
    if (candidates.length === 0) return { available: true, insights: [] };

    const settled = await Promise.allSettled(candidates.map((c) => groqProvider.explainControl(c)));

    const insights = settled
      .filter((r): r is PromiseFulfilledResult<AiControlInsight | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v): v is AiControlInsight => v !== null);

    return { available: true, insights };
  } catch {
    // Whatever went wrong, the deterministic ARS report must still ship.
    return EMPTY_UNAVAILABLE;
  }
}
