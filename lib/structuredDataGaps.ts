import type { StructuredDataNode } from "./parser";

export interface SchemaGap {
  type: string;
  missing: string[];
}

/**
 * A conservative, non-exhaustive check for a handful of high-value fields on
 * common Schema.org types. Only flags a gap when the type itself was
 * declared — we don't require every page to have every schema type.
 */
export function findSchemaGaps(structuredData: StructuredDataNode[]): SchemaGap[] {
  const gaps: SchemaGap[] = [];

  for (const sd of structuredData) {
    if (!sd.valid || typeof sd.raw !== "object" || sd.raw === null) continue;
    const raw = sd.raw as Record<string, unknown>;
    const type = (raw["@type"] as string | undefined) ?? sd.type;
    if (!type) continue;

    const missing: string[] = [];

    if (type === "Product") {
      const offers = raw["offers"] as Record<string, unknown> | undefined;
      if (!offers) {
        missing.push("offers");
      } else {
        if (offers["availability"] === undefined) missing.push("offers.availability");
        if (offers["price"] === undefined) missing.push("offers.price");
      }
      if (raw["aggregateRating"] === undefined) missing.push("aggregateRating");
    }

    if (type === "Article" || type === "NewsArticle" || type === "BlogPosting") {
      if (raw["datePublished"] === undefined) missing.push("datePublished");
      if (raw["author"] === undefined) missing.push("author");
    }

    if (type === "Organization") {
      if (raw["url"] === undefined) missing.push("url");
      if (raw["logo"] === undefined) missing.push("logo");
    }

    if (missing.length > 0) gaps.push({ type, missing });
  }

  return gaps;
}
