import * as cheerio from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { Element } from "domhandler";

export interface HeadingNode {
  level: number;
  text: string;
}

export interface LinkNode {
  text: string;
  href: string | null;
  absoluteHref: string | null;
  isEmpty: boolean;
}

export interface ButtonNode {
  text: string;
  tag: string;
  hasAccessibleName: boolean;
  disabled: boolean;
  hasExposedState: boolean;
  containsIcon: boolean;
  /** Text of the nearest preceding heading in document order, or null. Real DOM proximity, not a guess. */
  nearestHeading: string | null;
}

export interface FormFieldNode {
  tag: string;
  type: string;
  name: string | null;
  id: string | null;
  hasLabel: boolean;
  required: boolean;
  autocomplete: string | null;
}

export interface FormNode {
  fields: FormFieldNode[];
  hasSubmit: boolean;
}

export interface ImageNode {
  src: string | null;
  hasAlt: boolean;
  alt: string | null;
}

export interface StructuredDataNode {
  type: string | null;
  valid: boolean;
  raw: unknown;
}

export interface ParsedPage {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  landmarks: { header: boolean; nav: boolean; main: boolean; footer: boolean };
  headings: HeadingNode[];
  links: LinkNode[];
  navLinks: LinkNode[];
  buttons: ButtonNode[];
  forms: FormNode[];
  images: ImageNode[];
  structuredData: StructuredDataNode[];
  divSoupCount: number;
  counts: {
    headings: number;
    links: number;
    buttons: number;
    forms: number;
    formFields: number;
    images: number;
    structuredData: number;
  };
}

/**
 * Like $el.text(), but joins sibling/child text with spaces. Plain .text()
 * concatenates every descendant text node with nothing between them, so
 * markup like <span>Foo</span><span>Bar</span> (common in real-world
 * component-heavy sites) reads as "FooBar" instead of "Foo Bar".
 */
function readableText($el: Cheerio<Element>, $: CheerioAPI): string {
  const parts: string[] = [];
  $el.contents().each((_, node) => {
    if (node.type === "text") {
      const t = $(node).text().trim();
      if (t) parts.push(t);
    } else if (node.type === "tag") {
      const t = readableText($(node) as Cheerio<Element>, $);
      if (t) parts.push(t);
    }
  });
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function accessibleName($el: Cheerio<Element>, $: CheerioAPI): string {
  const ariaLabel = $el.attr("aria-label");
  if (ariaLabel?.trim()) return ariaLabel.trim();

  const labelledBy = $el.attr("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => readableText($(`#${id}`) as Cheerio<Element>, $))
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }

  return readableText($el, $);
}

function resolveHref(href: string | undefined, baseUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

/**
 * Parses raw HTML into the structural shape the ARS analysis engine (Etap 3)
 * will run its checks against. This step does no scoring — just extraction.
 */
export function parsePage(html: string, baseUrl: string): ParsedPage {
  const $ = cheerio.load(html);

  const title = readableText($("title").first(), $) || null;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const canonical = resolveHref($('link[rel="canonical"]').attr("href"), baseUrl);

  const landmarks = {
    header: $("header, [role='banner']").length > 0,
    nav: $("nav, [role='navigation']").length > 0,
    main: $("main, [role='main']").length > 0,
    footer: $("footer, [role='contentinfo']").length > 0,
  };

  const headings: HeadingNode[] = [];
  $("h1, h2, h3, h4, h5, h6").each((_, el) => {
    headings.push({
      level: Number(el.tagName.slice(1)),
      text: readableText($(el), $),
    });
  });

  const links: LinkNode[] = [];
  $("a").each((_, el) => {
    const $el = $(el);
    const text = accessibleName($el, $);
    const href = $el.attr("href");
    links.push({
      text,
      href: href ?? null,
      absoluteHref: resolveHref(href, baseUrl),
      isEmpty: text.length === 0,
    });
  });

  const navLinks: LinkNode[] = [];
  $("nav a, [role='navigation'] a").each((_, el) => {
    const $el = $(el);
    const text = accessibleName($el, $);
    const href = $el.attr("href");
    navLinks.push({
      text,
      href: href ?? null,
      absoluteHref: resolveHref(href, baseUrl),
      isEmpty: text.length === 0,
    });
  });

  const headingBeforeButton = new Map<Element, string | null>();
  {
    let lastHeading: string | null = null;
    $("h1, h2, h3, h4, h5, h6, button, [role='button'], input[type='submit'], input[type='button']").each(
      (_, el) => {
        if (/^h[1-6]$/.test(el.tagName)) {
          const text = readableText($(el), $);
          if (text) lastHeading = text;
        } else {
          headingBeforeButton.set(el, lastHeading);
        }
      }
    );
  }

  const buttons: ButtonNode[] = [];
  $('button, [role="button"], input[type="submit"], input[type="button"]').each((_, el) => {
    const $el = $(el);
    const text =
      el.tagName === "input" ? ($el.attr("value") ?? "").trim() : accessibleName($el, $);
    const disabled = $el.attr("disabled") !== undefined || $el.attr("aria-disabled") === "true";
    const hasExposedState =
      disabled ||
      $el.attr("aria-expanded") !== undefined ||
      $el.attr("aria-checked") !== undefined ||
      $el.attr("aria-selected") !== undefined ||
      $el.attr("aria-pressed") !== undefined;
    const containsIcon = $el.find("svg, img").length > 0;
    buttons.push({
      text,
      tag: el.tagName,
      hasAccessibleName: text.length > 0,
      disabled,
      hasExposedState,
      containsIcon,
      nearestHeading: headingBeforeButton.get(el) ?? null,
    });
  });

  const forms: FormNode[] = [];
  $("form").each((_, formEl) => {
    const $form = $(formEl);
    const fields: FormFieldNode[] = [];

    $form.find("input, select, textarea").each((_, fieldEl) => {
      const $field = $(fieldEl);
      const rawType = $field.attr("type");
      const type =
        rawType ?? (fieldEl.tagName === "textarea" ? "textarea" : fieldEl.tagName === "select" ? "select" : "text");
      if (["hidden", "submit", "button"].includes(type)) return;

      const id = $field.attr("id") ?? null;
      const hasLabelFor = id ? $form.find(`label[for="${id}"]`).length > 0 : false;
      const wrappedInLabel = $field.closest("label").length > 0;
      const hasAriaLabel = Boolean($field.attr("aria-label") || $field.attr("aria-labelledby"));

      fields.push({
        tag: fieldEl.tagName,
        type,
        name: $field.attr("name") ?? null,
        id,
        hasLabel: hasLabelFor || wrappedInLabel || hasAriaLabel,
        required: $field.attr("required") !== undefined || $field.attr("aria-required") === "true",
        autocomplete: $field.attr("autocomplete") ?? null,
      });
    });

    const hasSubmit =
      $form.find('button[type="submit"], input[type="submit"]').length > 0 ||
      $form.find("button").not('[type="button"], [type="reset"]').length > 0;

    forms.push({ fields, hasSubmit });
  });

  const images: ImageNode[] = [];
  $("img").each((_, el) => {
    const $el = $(el);
    const alt = $el.attr("alt");
    images.push({ src: resolveHref($el.attr("src"), baseUrl), hasAlt: alt !== undefined, alt: alt ?? null });
  });

  const structuredData: StructuredDataNode[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).text();
    try {
      const parsed = JSON.parse(raw);
      const type = Array.isArray(parsed) ? (parsed[0]?.["@type"] ?? null) : (parsed?.["@type"] ?? null);
      structuredData.push({ type: type ?? null, valid: true, raw: parsed });
    } catch {
      structuredData.push({ type: null, valid: false, raw });
    }
  });

  const divSoupCount = $("div[onclick], span[onclick]").length;

  return {
    title,
    metaDescription,
    canonical,
    landmarks,
    headings,
    links,
    navLinks,
    buttons,
    forms,
    images,
    structuredData,
    divSoupCount,
    counts: {
      headings: headings.length,
      links: links.length,
      buttons: buttons.length,
      forms: forms.length,
      formFields: forms.reduce((sum, f) => sum + f.fields.length, 0),
      images: images.length,
      structuredData: structuredData.length,
    },
  };
}
