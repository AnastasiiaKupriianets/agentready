import type { AiControlContext, AiControlInsight, AiProvider } from "./provider";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";
const TIMEOUT_MS = 10000;

const SYSTEM_PROMPT = `You audit whether a single UI control on a website would be understandable to an autonomous browser agent (not a human) that only sees its accessible name and nearby structural context — no visual styling, no color, no icon shape.

Judge ambiguity strictly from what an agent could read programmatically. A short label is fine if the surrounding heading makes the destination unambiguous; it's ambiguous if an agent genuinely couldn't predict what happens next.

Respond with ONLY a JSON object, no other text, in exactly this shape:
{"isAmbiguous": boolean, "explanation": "one or two sentences on why, from an agent's perspective", "recommendation": "one concrete alternative label or fix, or empty string if not ambiguous"}`;

function buildUserPrompt(ctx: AiControlContext): string {
  const lines = [`Control text: "${ctx.controlText}"`];
  lines.push(`Nearest preceding heading: ${ctx.nearestHeading ? `"${ctx.nearestHeading}"` : "(none found)"}`);
  lines.push(`Page title: ${ctx.pageTitle ? `"${ctx.pageTitle}"` : "(none)"}`);
  return lines.join("\n");
}

function isValidInsightShape(x: unknown): x is { isAmbiguous: boolean; explanation: string; recommendation: string } {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return (
    typeof obj.isAmbiguous === "boolean" &&
    typeof obj.explanation === "string" &&
    obj.explanation.trim().length > 0 &&
    typeof obj.recommendation === "string"
  );
}

async function explainControl(context: AiControlContext): Promise<AiControlInsight | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 700,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(context) },
        ],
      }),
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "(couldn't read body)");
      console.log("[AI DEBUG] Groq response not ok. Status:", res.status, "Body:", bodyText);
      return null;
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    console.log("[AI DEBUG] Groq raw content:", raw);
    if (typeof raw !== "string") return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }

    if (!isValidInsightShape(parsed)) {
      console.log("[AI DEBUG] Parsed JSON failed shape validation:", JSON.stringify(parsed));
      return null;
    }

    return {
      controlText: context.controlText,
      nearestHeading: context.nearestHeading,
      isAmbiguous: parsed.isAmbiguous,
      explanation: parsed.explanation.trim(),
      recommendation: parsed.recommendation.trim(),
    };
  } catch (err) {
    console.log("[AI DEBUG] fetch to Groq threw:", err);
    // Network error, timeout, abort — the audit continues without this insight.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const groqProvider: AiProvider = { explainControl };
