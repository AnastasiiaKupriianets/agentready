# AgentReady — Frontend

Landing page + docs (Etap 1.1 / 1.2) — Next.js 16 (App Router), TypeScript, Tailwind CSS v4.

## Uruchomienie

```bash
npm install
npm run dev
```

Otwórz http://localhost:3000

## Trasy

```
/          — landing page (hero, example report card, Detect/See/Fix)
/docs      — przegląd: quickstart, jak liczony jest wynik, kategorie, poziomy, Agent View, roadmap
/spec      — pełna specyfikacja ARS v0.1: 6 kategorii z punktacją, formuła PASS/PARTIAL/FAIL,
             critical blockers, interpretacja wyniku, structural vs behavioral readiness
/cli       — planowany interfejs CLI (jawnie oznaczony jako "not implemented yet")
```

## Struktura

```
app/
  layout.tsx           — fonty (Space Grotesk / Manrope / IBM Plex Mono), metadata
  page.tsx              — landing page
  docs/page.tsx
  spec/page.tsx
  cli/page.tsx
  globals.css           — design tokens (kolory, tło-grid, animacje)
components/
  SiteChrome.tsx         — wspólny layout: tło-grid + Navbar + Footer, używany przez wszystkie strony
  Navbar.tsx              — routing next/link, podświetlenie aktywnej strony (usePathname)
  Hero.tsx                — URL input + "Analyze Website"
  ReportCard.tsx          — karta przykładowego raportu (browser chrome)
  ScoreGauge.tsx          — animowany pierścień wyniku 0–100
  CategoryBars.tsx        — 6 kategorii ARS z progami kolorów
  FeatureCards.tsx        — 01 Detect / 02 See / 03 Fix
  Footer.tsx
  docs/DocsShell.tsx      — layout podstron: sticky sidebar + DocSection/CodeBlock/SpecTable/Callout
lib/
  types.ts               — typy CategoryScore/ReportSummary + scoreTier() (progi zgodne z ARS.md: ≥80 zielony, 60–79 bursztyn, <60 czerwony)
```

`lib/types.ts` → `exampleReport` to obecnie dane statyczne.
W Etapie 2/3 wystarczy podmienić `exampleReport` na realny wynik z `/api/analyze`, żeby cała reszta UI (gauge, paski, kolory) działała automatycznie bez zmian.

## Design system

- Tło `#0a0b0c`, karty `#111314`, linie `rgba(255,255,255,.09)`, zero border-radius.
- Zielony `#35e0a1` / bursztyn `#f2a93c` / czerwony `#f2604c` — progi wg ARS.md.
- Space Grotesk (nagłówki), Manrope (body), IBM Plex Mono (nav, dane liczbowe, URL, kod).

## Etap 2 — Website fetcher

`POST /api/analyze` z body `{ "url": "example.com" }`:

1. `lib/fetcher.ts` — pobiera stronę: 10s timeout, limit 3MB, wymusza `text/html`,
   zwraca czytelny błąd zamiast wyjątku (status niedostępny, zły content-type, timeout, przekroczony limit).
2. `lib/parser.ts` (cheerio) — parsuje HTML do struktury: title, meta description, canonical,
   landmarki (header/nav/main/footer), heading-i z poziomami, linki (z accessible name + wyliczonym
   absolute href), przyciski (z accessible name), formularze (pola: type/name/id/hasLabel/required/autocomplete),
   obrazy (alt), JSON-LD (parsowany + walidowany), licznik "div soup" (klikalne divy/spany zamiast buttona).
3. Endpoint zwraca `{ url, finalUrl, fetchedAt, fetchTimeMs, httpStatus, page }` — surową strukturę,
   **bez scoringu** (to Etap 3/4).

`components/AnalyzeResult.tsx` pokazuje to od razu na stronie głównej po kliknięciu "Analyze Website":
liczniki (headings/links/buttons/forms/pola/obrazy/JSON-LD), status landmarków, kilka szybkich flag
(pola bez labela, puste linki, brak alt, div-soup) i podgląd surowego JSON.

Przetestowane end-to-end na github.com (parsuje realną stronę), oraz na ścieżkach błędów:
zły URL, brak URL, nie-HTML content-type, URL bez protokołu, strona zwracająca 4xx.

## Etap 3 — Analysis Engine

`lib/rules/` — reguły ARS uruchamiane na `ParsedPage`, bez agregacji do jednego wyniku (to Etap 4).

```
lib/rules/
  types.ts       — CheckResult, CategoryId, CATEGORIES (wagi 20/20/20/15/15/10 zgodnie z ARS.md)
  helpers.ts      — scoreItems() = formuła PASS/PARTIAL/FAIL (100%/50%/0%), makeCheck / makeBinaryCheck / makeNotApplicable
  wordlists.ts     — AMBIGUOUS_ACTION_PHRASES ("click here", "continue", "more"...), DESTRUCTIVE_KEYWORDS ("delete", "cancel"...)
  semanticStructure.ts   — H1, hierarchia nagłówków, landmarki, alt, accessible names, div soup
  actionsControls.ts     — nazwy przycisków, poprawne elementy, stan (disabled/aria-expanded...), akcje destrukcyjne, ikony
  forms.ts                — labelki, typ pola (heuristyka po name/id), name/autocomplete, submit
  navigation.ts            — <nav>, opisowe linki, puste/broken linki, breadcrumbs (JSON-LD), tytuł strony
  machineReadableData.ts   — JSON-LD, podstawowe metadata
  trustState.ts             — akcje destrukcyjne (reszta kategorii wymaga runtime)
  index.ts                   — runAllChecks() + groupChecksByCategory()
```

**Ważne — uczciwość scoringu:** część checków z ARS.md wymaga renderowania strony lub interakcji
(np. "czy komunikat walidacji jest zrozumiały", "czy funkcja jest dostępna tylko po hover",
"czy cena jest widoczna tylko wizualnie") — tego nie da się sprawdzić z samego statycznego HTML.
Te checki dostają status **`"na"`** z polem `limitation` tłumaczącym dlaczego, zamiast zgadywać
i fałszywie punktować. Widać to w panelu na stronie głównej po rozwinięciu kategorii.

`POST /api/analyze` zwraca teraz też `categories: CategoryChecks[]` — każda kategoria z listą
checków (id, label, maxPoints, earnedPoints, status, detail/limitation).

Przetestowane: github.com (bogata strona — mix pass/partial/fail/na), minimalna syntetyczna
strona bez formularzy/przycisków/obrazów/landmarków (same "na"/"fail", **zero wyjątków** —
kluczowe pod ETAP 8 "testujemy celowo źle przygotowaną stronę").

## Etap 4/5/6 — Scoring, Issues, Agent View + pełny raport

Po kliknięciu "Analyze Website" strona przenosi na `/report?url=...`: animacja skanowania
(kosmetyczny pacing kroków, ale prawdziwe zapytanie leci równolegle), a potem pełny raport
z 5 zakładkami: **Overview / Issues / Agent View / Structure / Recommendations**.

```
lib/scoring.ts     — agreguje checki z Etapu 3 do % per kategoria i wyniku 0–100.
                       WAŻNE: kategoria w 100% "na" (np. Trust & State Clarity na większości
                       stron — wymaga runtime) jest WYKLUCZANA z mianownika, nie liczona jako
                       porażka. Bez tego każda strona miałaby sztucznie zaniżony wynik.
                       Wykrywa też Critical Blockers wprost z ARS.md (≥25% pól bez labela,
                       brak <nav> mimo linków, div zamiast buttona, formularz bez submit) —
                       blokują status "Agent Ready" nawet przy wyniku 90+.
lib/issues.ts        — zamienia nie-przechodzące checki na Problem/Why/Fix, z realnymi
                        przykładami wyciągniętymi z tej konkretnej strony (np. faktyczny
                        name/id niepolabelowanego pola, faktyczny tekst niejednoznacznego linku).
lib/agentView.ts      — grupuje realne dane na sekcje NAVIGATION/MAIN CONTENT/FORM/IMAGES,
                         flaguje unreadable (brak accessible name) i duplicate (dwa linki nav
                         do tego samego URL).
lib/structuredDataGaps.ts — sprawdza czy JSON-LD typu Product/Article/Organization ma
                              kluczowe pola (np. Product bez offers.availability).

components/report/  — ScanningView, ReportHeader (+taby), OverviewTab, IssuesTab, AgentViewTab,
                        StructureTab, RecommendationsTab (interaktywny — realna symulacja
                        "projected score" po zaznaczeniu fixów, nie fejkowa).
```

**Świadome uproszczenie:** kroki animacji skanowania to kosmetyczny pacing (nasz silnik liczy
wszystko synchronicznie w jednym request/response), a nie osobne fazy backendu — realne dane
w raporcie są w 100% prawdziwe, tylko wizualne tempo jest symulowane.

Przetestowane end-to-end na github.com: wynik 87/100 "Mostly Ready", 6 kategorii, Trust & State
Clarity poprawnie wykluczone z mianownika (0 sprawdzalnych statycznie checków), realne issues
z przykładami z samej strony (np. link "Reload" bez href).

## New scan / Export report

`ReportHeader` ma teraz dwa przyciski (prawy górny róg, jak w mockupie):

- **New scan** — wraca na `/` (nowe wyszukiwanie).
- **Export report** — dropdown z dwoma formatami:
  - **Markdown (.md)** — czytelny raport: score, tabela kategorii, critical blockers,
    pełna lista issues (Problem/Why/Fix + przykład ze strony), podsumowanie struktury.
  - **JSON (.json)** — surowa odpowiedź API 1:1 (przydatne pod przyszłe porównania/CI z ETAP 10/CLI).

`lib/exportReport.ts` — `buildMarkdownReport()` + `downloadTextFile()` (Blob, bez zależności).
