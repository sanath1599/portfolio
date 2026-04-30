"use client";

import { useEffect, useState } from "react";

type Bar = { label: string; value: number };

const INITIAL: Bar[] = [
  { label: "cpu", value: 28 },
  { label: "memory", value: 73 },
  { label: "gpu", value: 93 },
];

function jitter(prev: number, range = 6) {
  const drift = (Math.random() - 0.5) * range;
  return Math.max(8, Math.min(98, prev + drift));
}

function barColor(value: number): { fg: string; glow: string } {
  if (value >= 80) return { fg: "#f38ba8", glow: "rgba(243,139,168,0.35)" };
  if (value >= 50) return { fg: "#f5a06b", glow: "rgba(245,160,107,0.30)" };
  return { fg: "#5ee6a8", glow: "rgba(94,230,168,0.30)" };
}

function barTextClass(value: number): string {
  if (value >= 80) return "text-rose";
  if (value >= 50) return "text-amber";
  return "text-mint";
}

export function ProcessBars() {
  const [bars, setBars] = useState<Bar[]>(INITIAL);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBars((prev) => prev.map((b) => ({ ...b, value: jitter(b.value) })));
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ul className="space-y-2 px-1 py-1">
      {bars.map((b) => {
        const { fg, glow } = barColor(b.value);
        return (
          <li key={b.label} className="space-y-1">
            <div className="flex items-baseline justify-between text-[10.5px] uppercase tracking-[0.06em]">
              <span className="text-text-3">{b.label}</span>
              <span className={`tabular-nums normal-case tracking-normal ${barTextClass(b.value)}`}>
                {Math.round(b.value)}%
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-sm bg-bg-2">
              <div
                className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                style={{
                  width: `${b.value}%`,
                  background: `linear-gradient(90deg, ${fg} 0%, ${fg}cc 100%)`,
                  boxShadow: `0 0 8px ${glow}`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
