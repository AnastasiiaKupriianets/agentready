"use client";

import { useEffect, useRef, useState } from "react";

const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreGauge({
  score,
  title,
  subtitle,
}: {
  score: number;
  title: string;
  subtitle: string;
}) {
  const [display, setDisplay] = useState(0);
  const arcRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const offset = CIRCUMFERENCE - (CIRCUMFERENCE * score) / 100;
    const raf = requestAnimationFrame(() => {
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = String(offset);
      }
    });

    const step = () => {
      setDisplay((cur) => {
        const next = cur + Math.ceil((score - cur) / 8 || (cur < score ? 1 : 0));
        return next >= score ? score : next;
      });
    };
    const interval = setInterval(() => {
      step();
    }, 30);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [score]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative h-45 w-45">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="10"
          />
          <circle
            ref={arcRef}
            cx="90"
            cy="90"
            r={RADIUS}
            fill="none"
            stroke="var(--color-green)"
            strokeWidth="10"
            strokeLinecap="square"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-[44px] font-bold leading-none text-ink">
            {display}
          </div>
          <div className="mt-1 font-mono text-[11px] text-ink-faint">/ 100</div>
        </div>
      </div>
      <div className="mt-4.5 font-sans text-[15px] font-bold text-ink">{title}</div>
      <div className="mt-1 font-sans text-xs text-ink-dim">{subtitle}</div>
    </div>
  );
}
