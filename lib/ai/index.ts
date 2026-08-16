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
    // TEMP DEBUG — remove once AI calls are confirmed working.
    const key = process.env.GROQ_API_KEY;
    console.log("[AI DEBUG] GROQ_API_KEY present:", Boolean(key), "length:", key?.length ?? 0);

    if (!process.env.GROQ_API_KEY) return EMPTY_UNAVAILABLE;

    const candidates = selectAiCandidates(page);
    console.log("[AI DEBUG] candidates found:", candidates.length, JSON.stringify(candidates));
    if (candidates.length === 0) return { available: true, insights: [] };

    const settled = await Promise.allSettled(candidates.map((c) => groqProvider.explainControl(c)));
    console.log("[AI DEBUG] settled results:", JSON.stringify(settled, null, 2));

    const insights = settled
      .filter((r): r is PromiseFulfilledResult<AiControlInsight | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v): v is AiControlInsight => v !== null);

    console.log("[AI DEBUG] final insights count:", insights.length);
    return { available: true, insights };
  } catch (err) {
    console.log("[AI DEBUG] runAiAnalysis threw:", err);
    // Whatever went wrong, the deterministic ARS report must still ship.
    return EMPTY_UNAVAILABLE;
  }
}
