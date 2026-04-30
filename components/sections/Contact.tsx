"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { contact } from "@/lib/copy";
import { SectionAnchor } from "./SectionAnchor";

export function Contact() {
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = async (id: string, value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied((c) => (c === id ? null : c)), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <section className="bg-bg-0">
      <SectionAnchor id="contact" command="./contact --send" />
      <div className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-8 lg:px-12">
        <p className="mb-6 text-[14px] text-text-2">
          <span className="text-warm">$</span> {contact.intro}
        </p>

        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-bg-1/50 backdrop-blur-sm">
          {contact.links.map((link, i) => (
            <motion.li
              key={link.id}
              initial={{ opacity: 0, x: -4 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.22, delay: i * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="w-20 text-[10.5px] uppercase tracking-[0.1em] text-text-3">
                {link.label}
              </span>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                data-pointer="true"
                className="flex-1 truncate text-[13.5px] text-text-1 underline-offset-4 hover:text-warm hover:underline"
              >
                {link.value}
              </a>
              <button
                onClick={() => onCopy(link.id, link.value)}
                data-pointer="true"
                className="rounded border border-border bg-bg-2 px-2 py-1 text-[10.5px] uppercase tracking-[0.06em] text-text-3 transition-colors hover:border-border-hot hover:text-warm"
                aria-label={`Copy ${link.label}`}
              >
                {copied === link.id ? <span className="text-warm">copied ✓</span> : "copy"}
              </button>
            </motion.li>
          ))}
        </ul>

        <p className="mt-10 text-[13px] text-text-2">
          <span className="text-warm">$</span> {contact.outro}
        </p>
        <p className="mt-1 text-[11.5px] text-text-3">
          press{" "}
          <kbd className="rounded border border-border bg-bg-2 px-1 py-px text-[10px]">
            ⌘K
          </kbd>{" "}
          anytime
        </p>
      </div>
    </section>
  );
}
