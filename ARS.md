# ARS — Agent Readiness Score

**Version:** 0.1.0
**Status:** Draft Specification
**Project:** AgentReady

## 1. Overview

**ARS — Agent Readiness Score** is an open scoring methodology for measuring how well a website's structure and interface can be understood and operated by browser-based AI agents.

ARS produces a score between:

**0 and 100**

The score is designed to answer:

> **How structurally ready is this website for AI agents?**

ARS does not attempt to predict the performance of every possible AI model.

Instead, it measures whether the website provides the semantic structure, explicit controls, machine-readable information, and observable states that make reliable agent interaction possible.

---

# 2. What does "Agent Ready" mean?

A website is considered **agent-ready** when an automated browser agent can reasonably:

1. Understand what the page is about.
2. Identify the important sections of the page.
3. Discover available actions.
4. Understand what each action does.
5. Find and interpret navigation.
6. Understand form fields and their requirements.
7. Identify important structured information.
8. Observe the result of an action.
9. Distinguish current states such as selected, unavailable, expanded, completed, or failed.
10. Perform important tasks without relying exclusively on visual interpretation or guessing.

Agent readiness is therefore not the same as:

* SEO
* accessibility
* performance
* visual design quality

These areas overlap with agent readiness, but ARS evaluates them specifically from the perspective of **machine interaction and interpretation**.

---

# 3. Scope

ARS v0.1 measures:

## Structural Agent Readiness

It analyzes properties that can be determined from the website structure, DOM, accessibility information, metadata, and interface states.

ARS v0.1 does **not** claim to measure complete behavioral agent performance.

A future extension may introduce:

**Behavioral Agent Readiness**

where a real browser agent attempts tasks such as:

> Find the cheapest plan and begin registration.

or:

> Add the red size-M product to the basket.

Structural readiness and behavioral readiness should remain separate metrics.

---

# 4. Score

ARS produces a score:

`0 ≤ ARS ≤ 100`

The score consists of six categories.

| Category                     | Maximum |
| ---------------------------- | ------: |
| Semantic Structure           |      20 |
| Actions & Controls           |      20 |
| Forms                        |      20 |
| Navigation & Discoverability |      15 |
| Machine-Readable Data        |      15 |
| Trust & State Clarity        |      10 |
| **Total**                    | **100** |

Formula:

`ARS = S + A + F + N + M + T`

Where:

* `S` = Semantic Structure
* `A` = Actions & Controls
* `F` = Forms
* `N` = Navigation & Discoverability
* `M` = Machine-Readable Data
* `T` = Trust & State Clarity

---

# 5. Test Result Model

Every test returns one of four states:

### PASS

Requirement is satisfied.

Multiplier:

`1.0`

### PARTIAL

Requirement is partially satisfied.

Multiplier:

`0.5`

### FAIL

Requirement is not satisfied.

Multiplier:

`0.0`

### NOT APPLICABLE

The test does not apply to the analyzed page.

The test is removed from the category denominator.

A website should never lose points for functionality it does not contain.

For example:

A page without forms should not receive `0/20` for Forms.

Instead, the remaining applicable categories are normalized.

---

# 6. Element-Based Tests

Tests applying to multiple elements are calculated proportionally.

Example:

A page contains 20 interactive buttons.

* 16 pass
* 2 partially pass
* 2 fail

The normalized result is:

`(16 × 1.0 + 2 × 0.5 + 2 × 0.0) / 20`

Result:

`0.85`

If the test is worth 6 points:

`0.85 × 6 = 5.1`

The website receives:

**5.1 / 6**

This prevents one minor issue from invalidating an otherwise well-structured page.

---

# 7. Category 1 — Semantic Structure

Maximum:

**20 points**

The goal is to determine whether an agent can understand the page structure and the purpose of individual elements.

## S1 — Primary Heading

**3 points**

PASS:

* page has one clear primary H1

PARTIAL:

* multiple H1 elements exist but page structure remains interpretable

FAIL:

* no identifiable primary heading

---

## S2 — Heading Hierarchy

**3 points**

Checks logical heading structure.

Preferred:

`H1 → H2 → H3`

Potential problem:

`H1 → H4`

PASS:

* hierarchy is logical

PARTIAL:

* minor hierarchy inconsistencies

FAIL:

* headings provide little or misleading document structure

---

## S3 — Semantic Landmarks

**4 points**

Looks for meaningful landmarks such as:

* `header`
* `nav`
* `main`
* `aside`
* `footer`

Equivalent valid ARIA landmarks may also qualify.

PASS:

* primary page areas are semantically identifiable

PARTIAL:

* some major sections are identifiable

FAIL:

* important page areas cannot be programmatically distinguished

---

## S4 — Image Alternatives

**3 points**

Informative images should expose meaningful alternative text.

Decorative images may use:

`alt=""`

FAIL examples:

* meaningful image without alt
* filename used as alt
* generic alt such as `image`

Scoring should be calculated proportionally across applicable images.

---

## S5 — Accessible Names

**4 points**

Interactive elements should expose a meaningful accessible name.

Examples include:

* visible text
* `aria-label`
* `aria-labelledby`
* associated label

Applicable to elements such as:

* buttons
* links
* controls
* inputs

---

## S6 — Native Semantic Elements

**3 points**

Prefer native interactive semantics.

Preferred:

`<button>`

Instead of:

`<div onclick="...">`

Preferred:

`<a href="...">`

Instead of custom click navigation without link semantics.

PASS:

* native semantic elements are used appropriately

PARTIAL:

* isolated custom interactive elements exist

FAIL:

* large portions of the interface depend on non-semantic interaction patterns

---

# 8. Category 2 — Actions & Controls

Maximum:

**20 points**

The goal is to determine whether an agent understands what actions are available and what they will do.

## A1 — Descriptive Action Names

**6 points**

Controls should clearly communicate their action.

Good:

* `Add to cart`
* `Download invoice`
* `Create account`
* `Continue to checkout`

Potentially ambiguous:

* `Click here`
* `Go`
* `More`
* `Next`
* `Continue`

Context may reduce ambiguity.

Therefore the test should consider nearby text and accessible naming context.

---

## A2 — Correct Interactive Semantics

**4 points**

Navigation should normally use links.

Actions should normally use buttons.

PASS:

* interaction semantics match behavior

PARTIAL:

* some mismatches exist

FAIL:

* actions are broadly represented using incorrect or inaccessible semantics

---

## A3 — Programmatically Available State

**4 points**

Relevant controls should expose state when applicable.

Examples:

* `disabled`
* `checked`
* `selected`
* `expanded`
* `pressed`
* `current`

State communicated only by visual appearance should be considered insufficient.

---

## A4 — Critical Action Clarity

**3 points**

High-impact actions should be explicit.

Examples:

* purchase
* delete
* cancel
* publish
* send
* submit payment

A destructive icon button without a programmatic name should fail this test.

---

## A5 — Icon Control Labels

**3 points**

Interactive icon-only controls must expose meaningful names.

Examples:

Good:

`aria-label="Close dialog"`

Bad:

unlabeled SVG inside a button

---

# 9. Category 3 — Forms

Maximum:

**20 points**

Forms are evaluated because agents must understand:

* what information is requested
* which field receives it
* what format is expected
* which fields are required
* whether submission succeeded or failed

If no meaningful form exists on the page, this category is marked:

**NOT APPLICABLE**

---

## F1 — Field Labels

**6 points**

Every meaningful field should have a programmatically associated label.

Preferred:

`<label for="email">Email</label>`

Alternative valid methods include:

* `aria-label`
* `aria-labelledby`

Placeholder text alone should not receive full credit.

---

## F2 — Appropriate Input Types

**3 points**

Examples:

Email:

`type="email"`

Telephone:

`type="tel"`

Number:

`type="number"`

Date:

`type="date"`

Using meaningful types improves machine interpretation.

---

## F3 — Machine-Useful Field Metadata

**3 points**

Fields should provide appropriate metadata when useful.

Examples:

* `name`
* `autocomplete`
* meaningful IDs

Examples:

`name="email"`

`autocomplete="email"`

---

## F4 — Required State

**2 points**

Required fields should be programmatically identifiable.

Examples:

* `required`
* valid ARIA equivalent where necessary

A red asterisk alone is insufficient.

---

## F5 — Validation Feedback

**3 points**

Errors should explain what failed.

Good:

`Enter a valid email address.`

Bad:

`Error 422`

Error association with the relevant field should also be considered.

---

## F6 — Submit Action Clarity

**2 points**

The submission control should clearly communicate the action.

Good:

`Create account`

Less clear:

`Submit`

Bad:

unlabeled icon

---

## F7 — Logical Form Structure

**1 point**

Related fields should be grouped logically where appropriate.

The form should expose a coherent interaction sequence.

---

# 10. Category 4 — Navigation & Discoverability

Maximum:

**15 points**

The goal is to determine whether an agent can discover where it is and how to reach important destinations.

## N1 — Primary Navigation Structure

**3 points**

Primary navigation should be programmatically identifiable.

Preferred:

`<nav>`

or equivalent valid navigation semantics.

---

## N2 — Descriptive Links

**4 points**

Links should communicate their destination.

Good:

`View pricing`

Potentially ambiguous:

`Learn more`

Context should be considered.

Repeated ambiguous anchors pointing to different destinations should be penalized more strongly.

---

## N3 — Valid Navigation Targets

**2 points**

Detect:

* empty href
* invalid targets
* obvious broken internal links
* non-functional anchors

---

## N4 — Hierarchical Context

**2 points**

On hierarchical websites, users and agents should be able to identify contextual location.

Examples:

* breadcrumbs
* clear section hierarchy
* programmatically exposed current navigation item

For simple one-page websites this test may be:

**NOT APPLICABLE**

---

## N5 — Interaction Independence

**2 points**

Important navigation should not depend exclusively on:

* hover
* drag
* complex visual gestures

An alternative programmatically accessible mechanism should exist.

---

## N6 — Page Identity

**2 points**

The page should expose a meaningful identity using elements such as:

* document title
* H1
* contextual navigation state

---

# 11. Category 5 — Machine-Readable Data

Maximum:

**15 points**

This category measures whether important information is exposed in ways that machines can reliably interpret.

---

## M1 — Structured Data

**6 points**

Detect structured data such as JSON-LD / Schema.org.

Relevant examples:

* Product
* Organization
* Article
* Event
* BreadcrumbList
* LocalBusiness
* SoftwareApplication
* Offer

Structured data should be:

* syntactically valid
* relevant to the page
* internally consistent

Simply including irrelevant schema should not receive full credit.

For page types where structured data is not reasonably necessary, scoring may be normalized.

---

## M2 — Core Metadata

**3 points**

Checks useful document metadata such as:

* title
* meta description
* canonical when applicable

---

## M3 — Important Information Is Machine-Readable

**3 points**

Important information should exist in accessible page structure.

Examples:

* prices
* product names
* stock status
* dates
* primary actions

Information available only through:

* image pixels
* canvas
* decorative graphics

may reduce the score.

---

## M4 — Data Relationships

**3 points**

Important related information should be structurally understandable.

Example:

An agent should be able to determine that:

`€49`

belongs to:

`Pro Plan`

and not another product displayed nearby.

---

# 12. Category 6 — Trust & State Clarity

Maximum:

**10 points**

An agent must understand not only what actions exist, but what happened after an action was performed.

---

## T1 — Action Outcome Visibility

**3 points**

Important actions should expose observable outcomes.

Example:

After:

`Add to cart`

the interface should expose a clear state such as:

`Added to cart`

or an updated cart state.

A purely visual animation may not be sufficient.

---

## T2 — Important Decision Information

**2 points**

Important transactional information should be explicit when applicable.

Examples:

* price
* currency
* availability
* recurring billing
* quantity

---

## T3 — State Is Programmatically Understandable

**2 points**

Examples:

* In stock
* Out of stock
* Selected
* Expanded
* Disabled

State should not rely exclusively on color or layout.

---

## T4 — High-Impact Action Transparency

**2 points**

Financial, destructive, or irreversible actions should clearly communicate their consequence.

Examples:

Good:

`Delete account permanently`

Less clear:

`Confirm`

---

## T5 — Important Information Is Not Visual-Only

**1 point**

Key information should not rely solely on visual encoding.

Example:

Bad:

Green means available, red means unavailable, with no textual or semantic state.

---

# 13. Critical Agent Blockers

ARS separates numerical scoring from severe structural failures.

A website may have a relatively high score while still containing one issue that prevents an important agent task.

Therefore ARS also reports:

# Critical Agent Blockers

A Critical Blocker may be created when, for example:

* more than 25% of meaningful form fields lack programmatic labels
* the primary CTA has no accessible name
* major navigation cannot be interpreted programmatically
* a core action exists only as an inaccessible custom element
* a blocking dialog cannot be dismissed programmatically
* critical transactional information is unavailable in machine-readable form
* a major task requires an interaction with no accessible alternative
* a critical form cannot be reliably completed
* the result of a high-impact action cannot be determined

Critical detection should remain conservative.

Not every failed test should become a Critical Blocker.

---

# 14. Status Levels

Raw ARS scores map to the following levels.

## 90–100

**Agent Ready**

The website provides strong structural support for browser agents.

---

## 75–89

**Mostly Ready**

Agents should be able to interpret most of the interface, although some friction remains.

---

## 50–74

**Agent Friction**

Important ambiguities or structural weaknesses may cause unreliable agent interaction.

---

## 25–49

**Poor Agent Support**

Agents are likely to struggle with multiple important parts of the interface.

---

## 0–24

**Agent Blocked**

The interface provides insufficient structure for reliable agent interaction.

---

# 15. Critical Blocker Override

A website with one or more Critical Agent Blockers cannot receive the final status:

**Agent Ready**

Example:

Raw score:

`94 / 100`

Critical Blockers:

`1`

Final result:

**94 / 100 — Mostly Ready ⚠️**

Reason:

`1 Critical Agent Blocker`

The numerical score is preserved for transparency.

Only the readiness label is capped.

---

# 16. Not Applicable Tests and Normalization

Not every test applies to every website.

For example:

A documentation page may have no form.

A simple landing page may not require breadcrumbs.

A blog post may not contain transactional state.

ARS must not penalize websites for missing features that they do not need.

For each category:

`Category Score = Earned Applicable Points / Maximum Applicable Points × Category Weight`

Example:

Forms category normally weighs:

`20`

Only tests totaling 12 raw points apply.

Website earns:

`9`

Normalized Forms score:

`9 / 12 × 20 = 15`

Final:

**15 / 20**

If an entire category is genuinely not applicable, its weight should be redistributed proportionally across applicable categories.

---

# 17. Score Confidence

ARS should report a confidence level alongside the score.

Example:

**ARS: 81/100**

**Analysis confidence: High**

Suggested levels:

### High

Most relevant DOM and page information was successfully inspected.

### Medium

Some dynamic or inaccessible content could not be fully evaluated.

### Low

Major portions of the website were unavailable to the analyzer.

Examples:

* authentication wall
* anti-bot protection
* incomplete rendering
* blocked scripts
* unavailable DOM
* timeout

ARS should never present a precise-looking score without communicating analysis limitations.

---

# 18. Suggested Report Format

Example:

## Agent Readiness Score

**72 / 100**

**Agent Friction**

Confidence: **High**

### Categories

Semantic Structure
`17 / 20`

Actions & Controls
`13 / 20`

Forms
`10 / 20`

Navigation & Discoverability
`12 / 15`

Machine-Readable Data
`12 / 15`

Trust & State Clarity
`8 / 10`

### Critical Agent Blockers

**1**

### Issues

🔴 Critical — Checkout input lacks a programmatic label

🟠 Warning — Multiple buttons use ambiguous text: "Continue"

🟠 Warning — Product availability is communicated only by color

🟢 Passed — Primary navigation uses semantic landmarks

---

# 19. Machine-Readable ARS Output

AgentReady should make its audit result available in a structured format.

Example:

```json
{
  "arsVersion": "0.1.0",
  "url": "https://example.com",
  "score": 72,
  "status": "agent-friction",
  "confidence": "high",
  "criticalBlockers": 1,
  "categories": {
    "semanticStructure": {
      "score": 17,
      "max": 20
    },
    "actionsControls": {
      "score": 13,
      "max": 20
    },
    "forms": {
      "score": 10,
      "max": 20
    },
    "navigationDiscoverability": {
      "score": 12,
      "max": 15
    },
    "machineReadableData": {
      "score": 12,
      "max": 15
    },
    "trustStateClarity": {
      "score": 8,
      "max": 10
    }
  }
}
```

---

# 20. Issue Object

Each detected issue should use a standardized structure.

Example:

```json
{
  "id": "F1",
  "category": "forms",
  "severity": "critical",
  "title": "Form field has no programmatic label",
  "element": "input#shipping-address",
  "whyItMatters": "An agent may not reliably determine what value should be entered into this field.",
  "recommendation": "Associate the input with a descriptive label using a native label element or another valid accessible naming mechanism."
}
```

This makes ARS reports reusable by:

* dashboards
* CI tools
* browser extensions
* developer tooling
* automated quality checks

---

# 21. Design Principles

ARS follows five principles.

## 1. Explainable

Every point gained or lost should have a reason.

No opaque AI-generated score.

---

## 2. Deterministic

The same page structure should produce the same score under equivalent conditions.

---

## 3. Actionable

Every failure should ideally answer:

**What is wrong?**

**Why does it matter to an agent?**

**How can the developer improve it?**

---

## 4. Agent-Specific

ARS should not become another generic:

* SEO score
* accessibility score
* performance score

Every rule should connect directly to an agent's ability to:

**understand, navigate, decide, or act.**

---

## 5. Conservative

ARS should not claim that a structurally agent-ready website guarantees successful operation by every AI agent.

ARS evaluates structural readiness.

Actual agent behavior also depends on:

* model capabilities
* browser tooling
* task complexity
* runtime environment
* permissions
* authentication
* external services

---

# 22. ARS Rule IDs

Every rule has a permanent identifier.

### Semantic Structure

`S1` Primary Heading
`S2` Heading Hierarchy
`S3` Semantic Landmarks
`S4` Image Alternatives
`S5` Accessible Names
`S6` Native Semantic Elements

### Actions & Controls

`A1` Descriptive Action Names
`A2` Correct Interactive Semantics
`A3` Programmatic State
`A4` Critical Action Clarity
`A5` Icon Control Labels

### Forms

`F1` Field Labels
`F2` Input Types
`F3` Field Metadata
`F4` Required State
`F5` Validation Feedback
`F6` Submit Action Clarity
`F7` Logical Form Structure

### Navigation

`N1` Primary Navigation Structure
`N2` Descriptive Links
`N3` Valid Navigation Targets
`N4` Hierarchical Context
`N5` Interaction Independence
`N6` Page Identity

### Machine-Readable Data

`M1` Structured Data
`M2` Core Metadata
`M3` Machine-Readable Critical Information
`M4` Data Relationships

### Trust & State

`T1` Action Outcome Visibility
`T2` Important Decision Information
`T3` Programmatic State Clarity
`T4` High-Impact Action Transparency
`T5` Non-Visual Information Availability

Rule IDs should remain stable between minor specification versions.

---

# 23. Versioning

ARS uses semantic versioning.

Example:

`ARS 0.1.0`

### Patch

`0.1.0 → 0.1.1`

Bug fixes or clarifications that do not materially change scoring.

### Minor

`0.1.0 → 0.2.0`

New rules or scoring improvements.

Scores between minor versions may differ.

### Major

`0.x → 1.0`

Major methodology change or first stable specification.

Every AgentReady report should display which version of ARS produced it.

Example:

**Scored using ARS v0.1.0**

---

# 24. Future Extensions

Potential future ARS modules include:

## Behavioral Readiness

A browser agent performs real tasks.

Metrics could include:

* task completion
* number of retries
* incorrect actions
* navigation failures
* completion time
* recovery from errors

## Agent Journey Testing

Define tasks such as:

`Homepage → Pricing → Pro Plan → Signup`

and test whether an agent can complete the full journey.

## ARS CI

Run AgentReady automatically on every deployment.

Example:

`ARS dropped from 89 → 73`

Build warning:

`New Critical Agent Blocker detected.`

## ARS Comparison

Compare two versions of a website.

Example:

**Before**

`58`

**After**

`87`

## Page-Type Profiles

Future versions may provide specialized checks for:

* e-commerce
* SaaS
* documentation
* news
* booking
* forms
* dashboards

---

# 25. Core Principle

ARS is based on one simple question:

> **Can an AI agent understand what this interface means, determine what actions are available, perform the intended action, and understand what happened afterward?**

If the answer increasingly becomes **yes**, the website becomes increasingly:

# Agent Ready
