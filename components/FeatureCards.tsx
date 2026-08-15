const FEATURES = [
  {
    step: "01 — DETECT",
    title: "Not another SEO checker",
    body: "We evaluate what an autonomous browser agent can parse, decide on, and act upon — not what a crawler indexes.",
    accent: false,
  },
  {
    step: "02 — SEE",
    title: "Agent View",
    body: "Strip the pixels. See the structural tree an agent actually receives, with every ambiguity flagged in place.",
    accent: true,
  },
  {
    step: "03 — FIX",
    title: "Scored fixes",
    body: "Every recommendation carries a projected score delta, so you know what to ship first.",
    accent: false,
  },
];

export function FeatureCards() {
  return (
    <div className="mt-16 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
      {FEATURES.map((f) => (
        <div key={f.step} className="bg-bg p-8">
          <div
            className={`mb-4.5 font-mono text-[11px] tracking-[0.1em] ${
              f.accent ? "text-green" : "text-ink-faint"
            }`}
          >
            {f.step}
          </div>
          <h3 className="font-display text-[19px] font-semibold text-ink">{f.title}</h3>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{f.body}</p>
        </div>
      ))}
    </div>
  );
}
