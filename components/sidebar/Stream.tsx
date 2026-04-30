"use client";

import { useEffect, useRef, useState } from "react";

type StreamLine = { id: number; tag: string; tagColor: string; text: string };

const TEMPLATES: Array<Omit<StreamLine, "id">> = [
  { tag: "rag", tagColor: "var(--color-warm)", text: "retrieved k=8 docs in {ms}" },
  { tag: "ok", tagColor: "var(--color-mint)", text: "deploy edge fn rev-{rev}" },
  { tag: "llm", tagColor: "var(--color-warm-soft)", text: "tokens/s: {tps}" },
  { tag: "sec", tagColor: "var(--color-amber)", text: "scan complete · vulns={vulns}" },
  { tag: "infra", tagColor: "var(--color-cyan)", text: "scaling pod replica → {replica}" },
  { tag: "agent", tagColor: "var(--color-warm)", text: "embedding chunk #{chunk}" },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(t: string): string {
  return t
    .replace("{ms}", String(Math.floor(Math.random() * 9000) + 200))
    .replace("{rev}", String(Math.floor(Math.random() * 9000) + 100))
    .replace("{tps}", String(Math.floor(Math.random() * 400) + 80))
    .replace("{vulns}", String(Math.floor(Math.random() * 9000) + 100))
    .replace("{replica}", String(Math.floor(Math.random() * 9000) + 1000))
    .replace("{chunk}", String(Math.floor(Math.random() * 9000) + 100));
}

const MAX = 7;

export function Stream() {
  const [lines, setLines] = useState<StreamLine[]>([]);
  const idRef = useRef(0);
  const seededRef = useRef(false);

  useEffect(() => {
    // seed initial buffer (client-only, so no hydration mismatch)
    if (seededRef.current) return;
    seededRef.current = true;
    const seed: StreamLine[] = [];
    for (let i = 0; i < MAX; i++) {
      const t = pickRandom(TEMPLATES);
      seed.push({ id: idRef.current++, tag: t.tag, tagColor: t.tagColor, text: fillTemplate(t.text) });
    }
    setLines(seed);

    const id = window.setInterval(() => {
      const t = pickRandom(TEMPLATES);
      setLines((prev) => {
        const next = [
          ...prev.slice(-(MAX - 1)),
          { id: idRef.current++, tag: t.tag, tagColor: t.tagColor, text: fillTemplate(t.text) },
        ];
        return next;
      });
    }, 1800 + Math.random() * 800);

    return () => window.clearInterval(id);
  }, []);

  return (
    <ul className="space-y-1 px-1 py-1 font-mono text-[10.5px] leading-[1.4] text-text-2">
      {lines.map((line) => (
        <li key={line.id} className="flex gap-1.5 truncate line-in">
          <span
            className="shrink-0 normal-case tracking-normal"
            style={{ color: line.tagColor }}
          >
            [{line.tag}]
          </span>
          <span className="truncate text-text-3">{line.text}</span>
        </li>
      ))}
    </ul>
  );
}
