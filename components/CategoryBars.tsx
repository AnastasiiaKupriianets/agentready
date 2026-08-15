"use client";

import { useEffect, useState } from "react";
import { CategoryScore, scoreTier } from "@/lib/types";

const TIER_TEXT: Record<string, string> = {
  green: "text-green",
  amber: "text-amber",
  red: "text-red",
};

const TIER_BG: Record<string, string> = {
  green: "bg-green",
  amber: "bg-amber",
  red: "bg-red",
};

export function CategoryBars({ categories }: { categories: CategoryScore[] }) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
      {categories.map((cat) => {
        const tier = scoreTier(cat.score);
        return (
          <div key={cat.label}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-sans text-sm text-ink">{cat.label}</span>
              <span className={`font-mono text-sm font-semibold ${TIER_TEXT[tier]}`}>
                {cat.score}
              </span>
            </div>
            <div className="h-1 overflow-hidden bg-white/6">
              <div
                className={`h-full ${TIER_BG[tier]} transition-[width] duration-1000 ease-[cubic-bezier(.16,1,.3,1)]`}
                style={{ width: filled ? `${cat.score}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
