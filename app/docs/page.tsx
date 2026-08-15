import { SiteChrome } from "@/components/SiteChrome";
import { DocsShell, DocSection, CodeBlock, SpecTable, Callout } from "@/components/docs/DocsShell";
import Link from "next/link";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quickstart" },
  { id: "how-scoring-works", label: "How scoring works" },
  { id: "categories", label: "Categories" },
  { id: "score-levels", label: "Score levels" },
  { id: "agent-view", label: "Agent View" },
  { id: "roadmap", label: "Roadmap" },
];

export default function DocsPage() {
  return (
    <SiteChrome>
      <DocsShell
        eyebrow="Documentation"
        title="Understand what AgentReady measures"
        description="AgentReady analyzes structural agent readiness — what a browser agent can observe in the HTML, DOM, and accessibility tree — and turns it into a 0–100 score with concrete, explainable fixes."
        sections={SECTIONS}
      >
        <DocSection id="overview" title="Overview">
          <p>
            Websites have traditionally been designed for human users. AI and browser agents
            are increasingly navigating those same pages — reading content, filling forms,
            comparing products, and completing tasks on a person&rsquo;s behalf.
          </p>
          <p>
            A page can look perfectly clear to a human while still being genuinely difficult
            for an agent to operate: an ambiguous <code className="font-mono text-ink">Continue</code>{" "}
            button, a form field with no programmatic label, a price rendered only inside a
            canvas element. AgentReady finds those gaps and explains, in plain terms, why they
            matter and how to fix them.
          </p>
          <Callout tone="note" label="Scope">
            AgentReady v1 measures <b className="text-ink">structural</b> agent readiness — what
            can be observed from HTML, DOM, accessibility metadata and structured data. It does
            not claim that a high score guarantees success for every model, task, or browser
            tool. See{" "}
            <Link href="/spec#structural-vs-behavioral" className="text-green hover:underline">
              Structural vs. Behavioral Readiness
            </Link>{" "}
            in the spec.
          </Callout>
        </DocSection>

        <DocSection id="quickstart" title="Quickstart">
          <p>The core flow is intentionally a single, well-worn path:</p>
          <ol className="flex flex-col gap-3">
            <li className="flex gap-3">
              <span className="font-mono text-green">01</span>
              <span>
                <b className="text-ink">Enter a URL</b> on the home page and press{" "}
                <span className="font-mono text-ink">Analyze Website</span>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-green">02</span>
              <span>
                AgentReady fetches the page and parses HTML, headings, landmarks, links,
                buttons, forms, inputs, images, and any JSON-LD it can find.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-green">03</span>
              <span>
                You get an <b className="text-ink">Agent Readiness Score</b>, a category
                breakdown, a list of issues ranked by severity, and{" "}
                <Link href="#agent-view" className="text-green hover:underline">
                  Agent View
                </Link>
                .
              </span>
            </li>
          </ol>
        </DocSection>

        <DocSection id="how-scoring-works" title="How scoring works">
          <p>
            Every check resolves to <span className="font-mono text-ink">PASS</span>,{" "}
            <span className="font-mono text-ink">PARTIAL</span>, or{" "}
            <span className="font-mono text-ink">FAIL</span> — worth 100%, 50%, and 0% of that
            check&rsquo;s points. Nothing is deducted arbitrarily, and every score is
            reproducible from the same page.
          </p>
          <p>Example — a 6-point check evaluated across 20 buttons on a page:</p>
          <CodeBlock>
{`16 good buttons   ×  1.0
 2 partial buttons ×  0.5
 2 bad buttons     ×  0.0
------------------------------
(16×1 + 2×0.5 + 2×0) / 20 = 0.85

score = 0.85 × 6 pts = 5.1 / 6 pts`}
          </CodeBlock>
          <p>
            Full weighting and every individual check live in{" "}
            <Link href="/spec" className="text-green hover:underline">
              the ARS spec →
            </Link>
          </p>
        </DocSection>

        <DocSection id="categories" title="Categories">
          <p>ARS evaluates six categories, weighted by how much each affects an agent&rsquo;s ability to act:</p>
          <SpecTable
            head={["Category", "Weight"]}
            rows={[
              ["Semantic Structure", "20 pts"],
              ["Actions & Controls", "20 pts"],
              ["Forms", "20 pts"],
              ["Navigation & Discoverability", "15 pts"],
              ["Machine-Readable Data", "15 pts"],
              ["Trust & State Clarity", "10 pts"],
            ]}
          />
        </DocSection>

        <DocSection id="score-levels" title="Score levels">
          <SpecTable
            head={["Score", "Status"]}
            rows={[
              ["90–100", "Agent Ready"],
              ["75–89", "Mostly Ready"],
              ["50–74", "Agent Friction"],
              ["25–49", "Poor Agent Support"],
              ["0–24", "Agent Blocked"],
            ]}
          />
          <Callout tone="critical" label="Critical Agent Blockers">
            A page cannot be reported as <b>Agent Ready</b> while a Critical Agent Blocker
            exists — even at a score of 90+. A blocker is reported separately from the numeric
            score, e.g. <span className="font-mono">92/100 — Mostly Ready ⚠ 1 Critical Blocker</span>.
          </Callout>
        </DocSection>

        <DocSection id="agent-view" title="Agent View">
          <p>
            Agent View is the feature AgentReady is built around: instead of the rendered page,
            it shows the structural tree an agent actually receives — landmarks, headings,
            actions, and form fields — with ambiguous or inaccessible elements flagged in
            place.
          </p>
          <CodeBlock>
{`NAVIGATION
├── Home
├── Products
├── Pricing
└── Login

MAIN
├── H1: Build faster
├── Paragraph
├── CTA: Start free trial
└── Button: Continue ⚠

FORM
├── Email ✅
├── Unknown input ⚠
└── Submit`}
          </CodeBlock>
          <p>
            The goal is a single moment of recognition: <i>&ldquo;now I see why an agent gets
            stuck here.&rdquo;</i>
          </p>
        </DocSection>

        <DocSection id="roadmap" title="Roadmap">
          <p>Structural readiness is the MVP. Planned next:</p>
          <ul className="flex flex-col gap-2">
            <li>— Behavioral Agent Testing (a real agent attempts a task, we measure completion)</li>
            <li>— ARS history and before/after comparison between two analyses</li>
            <li>— CI/CD integration and pull request checks — see the planned{" "}
              <Link href="/cli" className="text-green hover:underline">CLI →</Link>
            </li>
            <li>— Specialized profiles for e-commerce, SaaS, and documentation sites</li>
            <li>— Shareable, exportable reports</li>
          </ul>
        </DocSection>
      </DocsShell>
    </SiteChrome>
  );
}
