"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Project } from "@/lib/projects";
import { projects } from "@/lib/projects";
import { useConsole } from "@/components/shell/ConsoleProvider";
import { SectionAnchor } from "./SectionAnchor";

export function Projects() {
  return (
    <section className="bg-bg-0">
      <SectionAnchor
        id="projects"
        command="ls ./projects"
        meta={`${projects.length} entries`}
      />
      <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectTile key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectTile({ project, index }: { project: Project; index: number }) {
  const { openProject } = useConsole();

  return (
    <motion.button
      onClick={() => openProject(project.id)}
      data-pointer="true"
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.2, 0.7, 0.2, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-bg-1 text-left transition-all duration-200 hover:border-border-hot hover:shadow-[0_0_0_1px_var(--color-border-hot),0_24px_60px_-30px_var(--color-glow-warm)]"
      aria-label={`Open ${project.title} in viewer`}
    >
      {/* image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-2">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 2}
          className="object-cover object-top transition-all duration-300 will-change-transform group-hover:scale-[1.025] [filter:brightness(0.78)_saturate(0.92)] group-hover:[filter:brightness(1)_saturate(1)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-0 via-bg-0/60 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-70" />
      </div>

      {/* row 1: title + open hint */}
      <div className="flex items-baseline gap-2 px-4 pb-1.5 pt-3">
        <span className="text-text-3 normal-case tracking-normal">{project.pathLabel}</span>
        <span className="ml-auto text-[11.5px] text-text-3 transition-colors group-hover:text-warm">
          open <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
      <div className="flex items-baseline gap-2 px-4 pb-2">
        <span className="text-[16px] text-text-1 group-hover:text-warm">
          {project.title}
        </span>
      </div>

      {/* blurb */}
      <p className="px-4 pb-3 text-[12.5px] leading-[1.55] text-text-2">
        {project.blurb}
      </p>

      {/* stack */}
      <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="rounded-sm border border-border px-1.5 py-px text-[10px] uppercase tracking-[0.06em] text-text-3"
          >
            {s}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
