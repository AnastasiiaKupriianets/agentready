"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AnalyzeApiResult, AnalyzeApiError } from "@/lib/apiTypes";
import { ScanningView } from "./ScanningView";
import { ReportHeader, type ReportTab } from "./ReportHeader";
import { OverviewTab } from "./OverviewTab";
import { IssuesTab } from "./IssuesTab";
import { AgentViewTab } from "./AgentViewTab";
import { StructureTab } from "./StructureTab";
import { RecommendationsTab } from "./RecommendationsTab";

const MIN_SCAN_MS = 3200;

type State =
  | { status: "scanning" }
  | { status: "error"; message: string }
  | { status: "done"; result: AnalyzeApiResult };

/** Reads ?url= and remounts (via key) whenever it changes, so scan state always starts fresh. */
export function ReportRoute() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  return <ReportClient key={url ?? "none"} url={url} />;
}

function ReportClient({ url }: { url: string | null }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "scanning" });
  const [tab, setTab] = useState<ReportTab>("overview");

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const started = Date.now();

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then(async (res) => {
        const data = await res.json();
        const elapsed = Date.now() - started;
        const wait = Math.max(0, MIN_SCAN_MS - elapsed);
        await new Promise((r) => setTimeout(r, wait));
        if (cancelled) return;

        if (!res.ok) {
          setState({ status: "error", message: (data as AnalyzeApiError).error ?? "Analysis failed." });
          return;
        }
        setState({ status: "done", result: data as AnalyzeApiResult });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Couldn't reach the analyzer." });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!url) {
    return (
      <div className="py-24 text-center">
        <p className="font-sans text-sm text-ink-dim">No URL to analyze.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 font-mono text-sm text-green hover:underline"
        >
          ← Back to home
        </button>
      </div>
    );
  }

  if (state.status === "scanning") {
    return <ScanningView url={url} />;
  }

  if (state.status === "error") {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto max-w-[480px] border border-red/30 bg-red-dim px-5 py-4 font-mono text-sm text-red">
          {state.message}
        </div>
        <button
          onClick={() => router.push("/")}
          className="mt-6 font-mono text-sm text-green hover:underline"
        >
          ← Try another URL
        </button>
      </div>
    );
  }

  const { result } = state;

  return (
    <div>
      <ReportHeader result={result} activeTab={tab} onTabChange={setTab} />

      {tab === "overview" && <OverviewTab result={result} onNavigate={setTab} />}
      {tab === "issues" && <IssuesTab issues={result.issues} />}
      {tab === "agent-view" && <AgentViewTab sections={result.agentView} meta={result.agentViewMeta} />}
      {tab === "structure" && <StructureTab page={result.page} />}
      {tab === "recommendations" && (
        <RecommendationsTab issues={result.issues} scoring={result.scoring} />
      )}
    </div>
  );
}
