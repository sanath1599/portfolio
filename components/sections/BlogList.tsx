"use client";

import { motion } from "motion/react";
import type { BlogPost } from "@/lib/blog";

export function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-bg-1/50 backdrop-blur-sm">
      {posts.map((post, i) => (
        <motion.li
          key={post.url}
          initial={{ opacity: 0, y: 4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.24, delay: i * 0.04, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            data-pointer="true"
            className="group block px-4 py-3.5 transition-colors hover:bg-bg-2/50"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-[10.5px] uppercase tracking-[0.1em] text-text-3 tabular-nums">
                {post.dateLabel}
              </span>
              <span className="text-text-3">·</span>
              <span className="flex-1 text-[14px] leading-snug text-text-1 transition-colors group-hover:text-warm">
                {post.title}
              </span>
              <span className="opacity-60 transition-all group-hover:translate-x-0.5 group-hover:text-warm group-hover:opacity-100">
                ↗
              </span>
            </div>
            {post.excerpt && (
              <p className="mt-1.5 line-clamp-2 max-w-[80ch] text-[12.5px] leading-[1.55] text-text-2">
                {post.excerpt}
              </p>
            )}
          </a>
        </motion.li>
      ))}
      <li className="bg-bg-1/50 px-4 py-3 text-center text-[11.5px] text-text-3">
        more on{" "}
        <a
          href="https://blog.sanathswaroop.com"
          target="_blank"
          rel="noopener noreferrer"
          data-pointer="true"
          className="text-warm underline-offset-4 hover:underline"
        >
          blog.sanathswaroop.com →
        </a>
      </li>
    </ul>
  );
}
