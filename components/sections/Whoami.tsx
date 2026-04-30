"use client";

import { motion } from "motion/react";
import { whoami } from "@/lib/copy";
import { SectionAnchor } from "./SectionAnchor";

const TONE_CLASS: Record<string, string> = {
  ember: "text-warm",
  amber: "text-amber",
};

export function Whoami() {
  return (
    <section className="bg-bg-0">
      <SectionAnchor id="whoami" command="whoami" />

      <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-2 sm:px-8 lg:px-12">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.36, ease: [0.2, 0.7, 0.2, 1] }}
          className="balance text-[44px] font-bold leading-[1.04] tracking-[-0.02em] text-text-1 sm:text-[64px] md:text-[80px] lg:text-[96px]"
          style={{ whiteSpace: "pre-line" }}
        >
          {whoami.headline.parts.map((part, i) => (
            <span
              key={i}
              className={part.tone ? TONE_CLASS[part.tone] : undefined}
              style={
                part.tone
                  ? { textShadow: "0 0 30px var(--color-glow-warm)" }
                  : undefined
              }
            >
              {part.text}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.32, delay: 0.12, ease: [0.2, 0.7, 0.2, 1] }}
          className="mt-8 max-w-[68ch] text-[15px] leading-[1.7] text-text-2 sm:text-[16px]"
        >
          {whoami.bio}
        </motion.p>

        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.32, delay: 0.2 }}
          className="mt-8 flex flex-wrap gap-2"
        >
          {whoami.stack.map((s, i) => (
            <motion.li
              key={s}
              initial={{ opacity: 0, y: 4 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.22, delay: 0.22 + i * 0.04 }}
              className="rounded-md border border-border bg-bg-1 px-2.5 py-1 text-[11.5px] uppercase tracking-[0.06em] text-text-2"
            >
              {s}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
