import { SiteChrome } from "@/components/SiteChrome";
import { DocsShell, DocSection, CodeBlock, SpecTable, Callout } from "@/components/docs/DocsShell";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "semantic-structure", label: "1. Semantic Structure" },
  { id: "actions-controls", label: "2. Actions & Controls" },
  { id: "forms", label: "3. Forms" },
  { id: "navigation", label: "4. Navigation" },
  { id: "machine-readable-data", label: "5. Machine-Readable Data" },
  { id: "trust-state", label: "6. Trust & State Clarity" },
  { id: "scoring-formula", label: "Scoring formula" },
  { id: "critical-blockers", label: "Critical blockers" },
  { id: "interpretation", label: "Interpretation" },
  { id: "structural-vs-behavioral", label: "Structural vs. Behavioral" },
];

export default function SpecPage() {
  return (
    <SiteChrome>
      <DocsShell
        eyebrow="Spec — ARS v0.1"
        title="Agent Readiness Score methodology"
        description="Agent-ready means an AI agent can understand a page, locate the right elements, perform the intended action, and evaluate the result — without guessing. ARS scores that in six weighted categories, deterministically."
        sections={SECTIONS}
      >
        <DocSection id="overview" title="Overview">
          <SpecTable
            head={["Category", "Points"]}
            rows={[
              ["1. Semantic Structure", 20],
              ["2. Actions & Controls", 20],
              ["3. Forms", 20],
              ["4. Navigation & Discoverability", 15],
              ["5. Machine-Readable Data", 15],
              ["6. Trust & State Clarity", 10],
              ["Total", "100"],
            ]}
          />
          <p>
            Agents typically read a page through the DOM and accessibility tree, so semantic
            HTML, correct roles, labels, and heading hierarchy carry outsized weight in how
            reliably a page can be interpreted.
          </p>
        </DocSection>

        <DocSection id="semantic-structure" title="1. Semantic Structure — 20 pts">
          <p>Whether an agent can tell what each part of the page is.</p>
          <SpecTable
            head={["Check", "Points", "Notes"]}
            rows={[
              ["Exactly one H1", "3", "0 pts if missing, 1.5 if multiple"],
              ["Correct heading hierarchy", "3", "No skipped levels, e.g. H1 → H4"],
              ["Semantic landmarks", "4", "<header> <nav> <main> <footer> or equivalent ARIA roles"],
              ["Meaningful image alt text", "3", "Decorative images may use alt=\"\"; meaningful ones may not"],
              ["Interactive elements have accessible names", "4", "button / link / input via text, aria-label, aria-labelledby"],
              ["No “div soup”", "3", "Interactive elements built as button/link, not div onclick"],
            ]}
          />
        </DocSection>

        <DocSection id="actions-controls" title="2. Actions & Controls — 20 pts">
          <p>Whether an agent knows what happens after it clicks.</p>
          <SpecTable
            head={["Check", "Points", "Notes"]}
            rows={[
              ["Descriptive button names", "6", "Good: “Add to cart”, “Continue to checkout”. Weak: “Click here”, “Go”, “More”"],
              ["Correct HTML elements", "4", "Action → <button>, navigation → <a href>"],
              ["Control state is exposed", "4", "disabled, checked, selected, expanded — programmatically readable"],
              ["Critical actions are distinguishable", "3", "E.g. “Delete account” can&rsquo;t be an unlabeled icon"],
              ["Icons have accessible names", "3", "A bare SVG with no name on its button is a fail"],
            ]}
          />
        </DocSection>

        <DocSection id="forms" title="3. Forms — 20 pts">
          <p>Forms are where an agent most needs to know what to enter, and where.</p>
          <SpecTable
            head={["Check", "Points", "Notes"]}
            rows={[
              ["Every field has a label", "6", "<label for> or valid aria-label / aria-labelledby"],
              ["Correct input type", "3", "type=\"email\", type=\"tel\", etc."],
              ["Name / autocomplete hints", "3", "name=\"email\" autocomplete=\"email\""],
              ["Required state is programmatic", "2", ""],
              ["Validation returns a clear message", "3", "Bad: “Error 422”. Good: “Enter a valid email address.”"],
              ["Submit has an unambiguous name", "2", ""],
              ["Form has a logical structure", "1", ""],
            ]}
          />
        </DocSection>

        <DocSection id="navigation" title="4. Navigation & Discoverability — 15 pts">
          <p>Whether an agent can find its way to a goal.</p>
          <SpecTable
            head={["Check", "Points", "Notes"]}
            rows={[
              ["Primary navigation is semantic", "3", "<nav>"],
              ["Links have descriptive anchor text", "4", "Only penalized when context truly can&rsquo;t be inferred, e.g. bare “Learn more”"],
              ["No empty / broken links", "2", ""],
              ["Breadcrumbs on complex pages", "2", ""],
              ["Key functionality isn&rsquo;t hover-only", "2", ""],
              ["Logical page title / identity", "2", ""],
            ]}
          />
        </DocSection>

        <DocSection id="machine-readable-data" title="5. Machine-Readable Data — 15 pts">
          <p>This is what separates AgentReady from a plain accessibility checker.</p>
          <SpecTable
            head={["Check", "Points", "Notes"]}
            rows={[
              ["JSON-LD / Schema.org", "up to 6", "Scored on whether it actually matches the page — Product, Organization, Article, BreadcrumbList, FAQPage — not merely present"],
              ["Basic metadata", "3", "<title>, meta description, canonical when relevant"],
              ["Business-critical data is text, not pixels", "3", "E.g. a price can&rsquo;t exist only inside a canvas or as an image"],
              ["Machine-recognizable relationships", "3", "Price + currency + availability are sensibly tied to a specific product"],
            ]}
          />
        </DocSection>

        <DocSection id="trust-state" title="6. Trust & State Clarity — 10 pts">
          <p>Whether an agent can tell what just happened.</p>
          <SpecTable
            head={["Check", "Points", "Notes"]}
            rows={[
              ["Actions confirm their outcome", "3", "After “Add to cart”, a programmatically readable “Added to cart” state — not just a subtle animation"],
              ["Price / availability / key terms are explicit", "2", ""],
              ["State has a clear current value", "2", "“In stock” / “Out of stock”, not only a color change"],
              ["Destructive / financial actions are clearly described", "2", ""],
              ["No critical info hidden by visuals only", "1", ""],
            ]}
          />
        </DocSection>

        <DocSection id="scoring-formula" title="Scoring formula">
          <p>No arbitrary point deductions. Every check resolves to one of three outcomes:</p>
          <CodeBlock>
{`PASS     = 100% of the check's points
PARTIAL  =  50% of the check's points
FAIL     =   0% of the check's points`}
          </CodeBlock>
          <p>Example — a 6-point check evaluated against 20 buttons on a page:</p>
          <CodeBlock>
{`16 good      × 1.0
 2 partial   × 0.5
 2 bad       × 0.0
------------------------------
(16×1 + 2×0.5 + 2×0) / 20 = 0.85

score = 0.85 × 6 pts = 5.1 / 6 pts`}
          </CodeBlock>
          <p>The same page, run twice, always produces the same score.</p>
        </DocSection>

        <DocSection id="critical-blockers" title="Critical blockers">
          <p>
            A page can score 78/100 overall and still have one catastrophic checkout form.
            Critical Agent Blockers are reported separately from the numeric score whenever:
          </p>
          <ul className="flex flex-col gap-2">
            <li>— 25%+ of form fields have no label</li>
            <li>— the primary CTA has no accessible name</li>
            <li>— navigation is not programmatically reachable</li>
            <li>— a key action exists only as a div onclick</li>
            <li>— an important form cannot be unambiguously filled in</li>
            <li>— a modal blocks interaction with no accessible way to close it</li>
            <li>— price or other critical info isn&rsquo;t present in the DOM</li>
            <li>— an interaction requires hover/drag only, with no alternative</li>
          </ul>
          <Callout tone="critical" label="Reported separately">
            Example: <span className="font-mono">Score: 81/100 — 🔴 2 Critical Agent Blockers</span>.
            The score alone is not the full picture.
          </Callout>
        </DocSection>

        <DocSection id="interpretation" title="Interpretation">
          <SpecTable
            head={["Score", "Status", "Meaning"]}
            rows={[
              ["90–100", "Agent Ready", "The page is very well prepared"],
              ["75–89", "Mostly Ready", "An agent will likely manage, with some risk areas"],
              ["50–74", "Agent Friction", "An agent can complete part of the task but hits ambiguity"],
              ["25–49", "Poor Agent Support", "Many basic interactions are hard to interpret"],
              ["0–24", "Agent Blocked", "Structure and interactions are largely unreadable programmatically"],
            ]}
          />
          <Callout tone="note" label="Rule">
            If ≥1 Critical Blocker exists, the status can never read “Agent Ready” — even at a
            score of 90 or above. E.g. <span className="font-mono">92/100 — Mostly Ready ⚠ 1 Critical Blocker</span>.
          </Callout>
        </DocSection>

        <DocSection id="structural-vs-behavioral" title="Structural vs. Behavioral Readiness">
          <p>
            ARS as specified above measures <b className="text-ink">Structural Readiness</b> —
            everything observable from HTML, DOM, accessibility tree, and structured data,
            without executing a task.
          </p>
          <p>
            A future <b className="text-ink">Behavioral Readiness</b> score would give a real
            agent a task — e.g. <i>“find the cheapest plan and begin signup”</i> — and measure
            task completion, steps, errors, and retries. That&rsquo;s materially harder, likely
            requires a model or API in the loop, and is deliberately out of scope for the MVP.
          </p>
          <p>
            A high structural score does not guarantee any specific agent succeeds at any
            specific task — actual behavior also depends on model capability, browser tooling,
            authentication, and task complexity. AgentReady says so explicitly rather than
            implying a guarantee.
          </p>
        </DocSection>
      </DocsShell>
    </SiteChrome>
  );
}
