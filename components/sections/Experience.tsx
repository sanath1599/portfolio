"use client";

import { motion } from "motion/react";
import { experience, honors, pillars } from "@/lib/copy";
import { SectionAnchor } from "./SectionAnchor";

export function Experience() {
  return (
    <section className="bg-bg-0">
      <SectionAnchor
        id="experience"
        command="cat experience.log"
        meta={`./career.log · ${experience.length} entries`}
      />
      <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-8 lg:px-12">
        {/* roles */}
        <ol className="space-y-6">
          {experience.map((role, i) => (
            <motion.li
              key={role.id}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
              className="relative grid gap-4 rounded-md border border-border bg-bg-1/50 p-5 backdrop-blur-sm sm:grid-cols-[200px_1fr] sm:gap-6"
            >
              {/* left meta */}
              <div className="space-y-1">
                <div className="text-[10.5px] uppercase tracking-[0.08em] text-text-3">
                  {role.period}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-text-2">
                  <span>{role.location}</span>
                  {role.current && (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-mint/40 px-1.5 py-px text-[10px] text-mint">
                      <span className="h-1 w-1 rounded-full bg-mint shadow-[0_0_4px_var(--color-glow-mint)] soft-pulse" />
                      now
                    </span>
                  )}
                </div>
              </div>

              {/* right body */}
              <div className="min-w-0 space-y-3">
                <header>
                  <h3 className="text-[15px] font-semibold text-text-1">
                    {role.title}{" "}
                    <span className="text-text-3">@ {role.company}</span>
                  </h3>
                </header>
                <ul className="space-y-1.5 text-[13px] leading-[1.6] text-text-2">
                  {role.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-warm" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {role.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border border-border px-1.5 py-px text-[10px] uppercase tracking-[0.06em] text-text-3"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* pillars */}
        <SubAnchor command="./pillars" />
        <div className="grid gap-4 pt-2 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.28, delay: i * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
              className="rounded-md border border-border bg-bg-1/50 p-4 backdrop-blur-sm"
            >
              <div className="text-[13px] font-semibold text-text-1">{p.title}</div>
              <ul className="mt-2 space-y-1.5 text-[12.5px] text-text-2">
                {p.items.map((x, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-[7px] text-warm">▸</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* honors */}
        <SubAnchor command="./honors" />
        <ul className="grid gap-2 pt-2 sm:grid-cols-2">
          {honors.map((h, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -4 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.24, delay: i * 0.04 }}
              className="flex items-start gap-3 rounded-md border border-border bg-bg-1/50 px-4 py-2.5 text-[13px] text-text-2 backdrop-blur-sm"
            >
              <span className="mt-[2px] text-warm">★</span>
              <span>{h}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SubAnchor({ command }: { command: string }) {
  return (
    <div className="mt-12 mb-2 flex items-baseline gap-3 text-[13px]">
      <span className="text-mint">➜</span>
      <span className="text-text-3">~</span>
      <span className="text-text-1">{command}</span>
    </div>
  );
}
