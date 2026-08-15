import { SiteChrome } from "@/components/SiteChrome";
import { DocsShell, DocSection, CodeBlock, SpecTable, Callout } from "@/components/docs/DocsShell";

const SECTIONS = [
  { id: "status", label: "Status" },
  { id: "install", label: "Install" },
  { id: "analyze", label: "agentready analyze" },
  { id: "flags", label: "Flags" },
  { id: "output-formats", label: "Output formats" },
  { id: "exit-codes", label: "Exit codes" },
  { id: "ci", label: "CI / CD" },
];

export default function CliPage() {
  return (
    <SiteChrome>
      <DocsShell
        eyebrow="CLI"
        title="agentready — from the terminal"
        description="A command-line interface for running ARS analysis in CI pipelines and pre-deploy checks, so a regression in agent readiness is caught before it ships."
        sections={SECTIONS}
      >
        <DocSection id="status" title="Status">
          <Callout tone="planned" label="Not implemented yet">
            The CLI is on the roadmap, after the web MVP (URL → score → issues → Agent View)
            is solid. Everything on this page describes the planned interface, not a shipped
            tool — command names and flags may change before v1.
          </Callout>
        </DocSection>

        <DocSection id="install" title="Install (planned)">
          <CodeBlock>{`npx agentready analyze https://example.com`}</CodeBlock>
          <p>Or installed globally once published:</p>
          <CodeBlock>{`npm install -g agentready`}</CodeBlock>
        </DocSection>

        <DocSection id="analyze" title="agentready analyze">
          <p>Runs the same ARS engine as the web app against a single URL.</p>
          <CodeBlock>{`agentready analyze https://acme-shop.com

Scanning website...
✓ Structure detected
✓ Navigation mapped
✓ Actions identified
✓ Forms inspected
✓ Agent compatibility calculated

Agent Readiness: 72/100 — Agent Friction

Semantic Structure     17/20
Actions & Controls     13/20
Forms                  10/20
Navigation              12/15
Machine-Readable Data   12/15
Trust & State Clarity    8/10

🔴 1 Critical Agent Blocker
  Form field has no programmatic label`}</CodeBlock>
        </DocSection>

        <DocSection id="flags" title="Flags">
          <SpecTable
            head={["Flag", "Description"]}
            rows={[
              ["--format <table|json|md>", "Output format. Defaults to table."],
              ["--output <file>", "Write the report to a file instead of stdout."],
              ["--category <name>", "Only run one category's checks."],
              ["--threshold <score>", "Exit non-zero if the score falls below this value."],
              ["--ci", "CI mode: no colors/animation, exits non-zero on any Critical Blocker."],
            ]}
          />
        </DocSection>

        <DocSection id="output-formats" title="Output formats">
          <p>
            <span className="font-mono text-ink">json</span> mirrors the same{" "}
            <span className="font-mono text-ink">ReportSummary</span> shape the web dashboard
            renders from, so a CI step can parse it directly without scraping text.
          </p>
          <CodeBlock>
{`{
  "url": "acme-shop.com",
  "overallScore": 72,
  "categories": [
    { "label": "Semantic Structure", "score": 85 },
    { "label": "Forms", "score": 50 }
  ],
  "criticalBlockers": [
    { "message": "Form field has no programmatic label" }
  ]
}`}
          </CodeBlock>
        </DocSection>

        <DocSection id="exit-codes" title="Exit codes">
          <SpecTable
            head={["Code", "Meaning"]}
            rows={[
              ["0", "Passed — score at/above --threshold, no Critical Blockers"],
              ["1", "Failed — below threshold, or a Critical Blocker was found"],
              ["2", "Error — page unreachable, timeout, or invalid URL"],
            ]}
          />
        </DocSection>

        <DocSection id="ci" title="CI / CD">
          <p>The intended use is a pre-deploy check that flags regressions, not just a snapshot:</p>
          <CodeBlock>
{`Previous ARS: 89
Current ARS: 71

⚠ New Critical Agent Blocker detected.`}</CodeBlock>
          <p>Planned: a GitHub Action that comments this diff directly on a pull request.</p>
        </DocSection>
      </DocsShell>
    </SiteChrome>
  );
}
