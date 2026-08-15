import { NextRequest, NextResponse } from "next/server";
import { fetchWebsite } from "@/lib/fetcher";
import { parsePage } from "@/lib/parser";
import { runAllChecks, groupChecksByCategory } from "@/lib/rules";
import { computeScoring } from "@/lib/scoring";
import { buildIssues } from "@/lib/issues";
import { buildAgentView, countNodes, countUnreadable } from "@/lib/agentView";

function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawUrl = typeof body?.url === "string" ? body.url : null;

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing 'url' in request body." }, { status: 400 });
  }

  const target = normalizeUrl(rawUrl);
  if (!target || !["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  const fetchResult = await fetchWebsite(target.toString());
  if (!fetchResult.ok) {
    return NextResponse.json({ error: fetchResult.error }, { status: fetchResult.status });
  }

  const parsed = parsePage(fetchResult.html, fetchResult.finalUrl);
  const checks = runAllChecks(parsed);
  const categories = groupChecksByCategory(checks);
  const scoring = computeScoring(parsed, categories);
  const issues = buildIssues(categories, parsed);
  const agentView = buildAgentView(parsed);

  return NextResponse.json({
    url: target.toString(),
    finalUrl: fetchResult.finalUrl,
    fetchedAt: new Date().toISOString(),
    fetchTimeMs: fetchResult.fetchTimeMs,
    httpStatus: fetchResult.status,
    page: parsed,
    categories,
    scoring,
    issues,
    agentView,
    agentViewMeta: {
      nodeCount: countNodes(agentView),
      unreadableCount: countUnreadable(agentView),
    },
  });
}
