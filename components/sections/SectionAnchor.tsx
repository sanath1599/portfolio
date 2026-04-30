"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { SectionId } from "@/lib/types";

/**
 * Section header rendered as a CLI prompt:
 *   ➜  ~  <command>▮
 * Each portfolio section below the hero begins with one.
 */
export function SectionAnchor({
  id,
  command,
  children,
  meta,
}: {
  id: SectionId;
  command: string;
  children?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header
      id={`section-${id}`}
      className="scroll-mt-16 border-t border-border/60 bg-gradient-to-b from-bg-0 to-bg-0/60 px-4 pt-12 pb-6 sm:px-8 lg:px-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] sm:text-[14px]"
      >
        <span className="text-mint">➜</span>
        <span className="text-text-3">~</span>
        <span className="text-text-1">{command}</span>
        <span
          className="ml-0.5 inline-block h-[16px] w-[8px] translate-y-[2px] bg-warm"
          style={{ animation: "caret-blink 1.05s steps(1, end) infinite" }}
          aria-hidden
        />
        {meta && <span className="ml-auto text-[11px] text-text-3">{meta}</span>}
      </motion.div>
      {children}
    </header>
  );
}
