/**
 * Exact-match (after trim + lowercase) phrases with no surrounding context
 * to disambiguate them. Pulled directly from the ARS spec's own bad
 * examples (§ Actions & Controls).
 */
export const AMBIGUOUS_ACTION_PHRASES = new Set([
  "click here",
  "here",
  "go",
  "more",
  "continue",
  "submit",
  "learn more",
  "read more",
  "ok",
  "yes",
  "no",
  "link",
  "details",
]);

export const DESTRUCTIVE_KEYWORDS = [
  "delete",
  "remove",
  "cancel subscription",
  "cancel account",
  "deactivate",
  "unsubscribe",
];

export function isAmbiguousPhrase(text: string): boolean {
  return AMBIGUOUS_ACTION_PHRASES.has(text.trim().toLowerCase());
}

export function isDestructiveText(text: string): boolean {
  const t = text.toLowerCase();
  return DESTRUCTIVE_KEYWORDS.some((k) => t.includes(k));
}
