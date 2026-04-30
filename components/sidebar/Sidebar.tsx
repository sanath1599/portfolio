"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { scrollToSection } from "@/lib/hooks/useCommandResolver";
import type { SectionId } from "@/lib/types";
import { ProcessBars } from "./ProcessBars";
import { Stream } from "./Stream";

type MenuItem =
  | { kind: "section"; id: SectionId; label: string; tag: string }
  | { kind: "action"; id: "ask"; label: string; tag: string };

const MENU: MenuItem[] = [
  { kind: "action", id: "ask", label: "Ask Claude", tag: "chat" },
  { kind: "section", id: "whoami", label: "$ whoami", tag: "about" },
  { kind: "section", id: "projects", label: "$ projects", tag: "work" },
  { kind: "section", id: "experience", label: "$ experience", tag: "log" },
  { kind: "section", id: "blog", label: "$ blog", tag: "feed" },
  { kind: "section", id: "contact", label: "$ contact", tag: "ping" },
];

function focusPrompt() {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  window.dispatchEvent(new CustomEvent("focus-prompt"));
}

export function Sidebar() {
  const [active, setActive] = useState<SectionId>("whoami");

  // observe scroll to update active section
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ids: SectionId[] = ["whoami", "projects", "experience", "blog", "contact"];
    const elements = ids
      .map((id) => ({ id, el: document.getElementById(`section-${id}`) }))
      .filter((x): x is { id: SectionId; el: HTMLElement } => Boolean(x.el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id.replace("section-", "") as SectionId;
          setActive(id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.1, 0.5, 1] },
    );
    elements.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="flex flex-col gap-4 text-[12px] lg:sticky lg:top-4">
      {/* menu */}
      <Block label="./menu">
        <ul className="space-y-1">
          {MENU.map((item, i) => {
            const isAsk = item.kind === "action" && item.id === "ask";
            const isActive = item.kind === "section" && active === item.id;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.05 + i * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <button
                  onClick={() =>
                    isAsk
                      ? focusPrompt()
                      : scrollToSection((item as { kind: "section"; id: SectionId }).id)
                  }
                  data-pointer="true"
                  className={[
                    "group flex w-full items-baseline gap-3 rounded px-2 py-1.5 text-left transition-colors",
                    isAsk
                      ? "bg-warm/10 text-warm hover:bg-warm/20"
                      : isActive
                        ? "bg-warm/10 text-text-1"
                        : "text-text-2 hover:bg-bg-2/50 hover:text-text-1",
                  ].join(" ")}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className={isAsk ? "text-warm" : isActive ? "text-warm" : "text-text-3 group-hover:text-warm"}>
                    {isAsk ? "❯" : "$"}
                  </span>
                  <span className="flex-1 normal-case tracking-normal">
                    {isAsk ? item.label : item.label.replace("$ ", "")}
                  </span>
                  <span className="text-[10.5px] uppercase tracking-[0.08em] text-text-3">
                    {item.tag}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </Block>

      {/* processes */}
      <Block label="system.processes" rightLabel={<LiveDot />}>
        <ProcessBars />
      </Block>

      {/* stream */}
      <Block label="stream">
        <Stream />
      </Block>
    </aside>
  );
}

function Block({
  label,
  rightLabel,
  children,
}: {
  label: string;
  rightLabel?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-bg-1/50 backdrop-blur-sm">
      <header className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[10.5px] uppercase tracking-[0.08em] text-text-3">
        <span>{label}</span>
        {rightLabel}
      </header>
      <div className="px-2 py-2">{children}</div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em] text-mint">
      <span className="block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_var(--color-glow-mint)] soft-pulse" />
      live
    </span>
  );
}
