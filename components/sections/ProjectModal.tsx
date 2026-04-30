"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useConsole } from "@/components/shell/ConsoleProvider";
import { useIframeProbe } from "@/lib/hooks/useIframeProbe";
import { getProject, projects } from "@/lib/projects";

export function ProjectModal() {
  const { state, dispatch } = useConsole();
  const { projectId, fullscreen } = state.modal;
  const project = projectId ? getProject(projectId) : undefined;
  const containerRef = useRef<HTMLDivElement>(null);

  // restore body scroll on close
  useEffect(() => {
    if (!projectId) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [projectId]);

  // keyboard shortcuts
  useEffect(() => {
    if (!projectId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "modal/close" });
        return;
      }
      if (e.key === "f" || e.key === "F") {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            (target as HTMLElement).isContentEditable)
        )
          return;
        e.preventDefault();
        dispatch({ type: "modal/fullscreen", on: !fullscreen });
        return;
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (project) window.open(project.url, "_blank", "noopener,noreferrer");
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [projectId, fullscreen, dispatch, project]);

  // focus trap (light)
  useEffect(() => {
    if (!projectId) return;
    const prev = document.activeElement as HTMLElement | null;
    containerRef.current?.focus();
    return () => {
      prev?.focus?.();
    };
  }, [projectId]);

  return (
    <AnimatePresence>
      {projectId && project && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-bg-glass backdrop-blur-2xl"
          onClick={() => dispatch({ type: "modal/close" })}
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} live viewer`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={[
              "relative flex flex-col overflow-hidden rounded-md border border-border-strong bg-bg-1 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.7)]",
              fullscreen
                ? "h-[96vh] w-[98vw]"
                : "h-[min(86vh,820px)] w-[min(94vw,1180px)]",
            ].join(" ")}
          >
            <ChromeBar
              title={`${project.title}.live`}
              fullscreen={fullscreen}
              onToggleFullscreen={() =>
                dispatch({ type: "modal/fullscreen", on: !fullscreen })
              }
              onOpenExternal={() =>
                window.open(project.url, "_blank", "noopener,noreferrer")
              }
              onClose={() => dispatch({ type: "modal/close" })}
            />

            <ProjectViewer key={projectId} url={project.url} />

            {/* meta strip */}
            <footer className="flex items-center gap-3 border-t border-border bg-bg-1/80 px-3 py-2 text-[11px] text-text-3">
              <span className="text-text-2">{project.title}</span>
              <span className="text-text-3">·</span>
              <span className="truncate">{project.url}</span>
              <span className="ml-auto hidden items-center gap-3 sm:flex">
                <span>
                  <kbd className="rounded border border-border bg-bg-2 px-1 py-px text-[10px]">
                    Esc
                  </kbd>{" "}
                  close
                </span>
                <span>
                  <kbd className="rounded border border-border bg-bg-2 px-1 py-px text-[10px]">
                    F
                  </kbd>{" "}
                  fullscreen
                </span>
                <span>
                  <kbd className="rounded border border-border bg-bg-2 px-1 py-px text-[10px]">
                    ⌘↵
                  </kbd>{" "}
                  open externally
                </span>
              </span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChromeBar({
  title,
  fullscreen,
  onToggleFullscreen,
  onOpenExternal,
  onClose,
}: {
  title: string;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenExternal: () => void;
  onClose: () => void;
}) {
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-border bg-bg-2 px-3 py-2">
      <div className="flex items-center gap-1.5" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-mint shadow-[0_0_6px_var(--color-glow-mint)]" />
        <span className="h-2.5 w-2.5 rounded-full bg-warm" />
        <span className="h-2.5 w-2.5 rounded-full bg-violet" />
      </div>
      <span className="font-mono text-[12px] text-text-2">{title}</span>
      <span className="ml-auto flex items-center gap-1">
        <ChromeButton onClick={onToggleFullscreen} aria-label="Toggle fullscreen">
          {fullscreen ? "⤡" : "⤢"}
        </ChromeButton>
        <ChromeButton onClick={onOpenExternal} aria-label="Open externally">
          ↗
        </ChromeButton>
        <ChromeButton onClick={onClose} aria-label="Close" variant="rose">
          ×
        </ChromeButton>
      </span>
    </header>
  );
}

function ChromeButton({
  children,
  onClick,
  variant = "default",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "rose";
}) {
  const hover =
    variant === "rose"
      ? "hover:border-rose/40 hover:text-rose"
      : "hover:border-border-hot hover:text-mint";
  return (
    <button
      data-pointer="true"
      onClick={onClick}
      className={`flex h-6 w-6 items-center justify-center rounded border border-border bg-bg-1 text-[12px] text-text-2 transition-colors ${hover}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function ProjectViewer({ url }: { url: string }) {
  const { state, iframeRef } = useIframeProbe(url, 2800);

  return (
    <div className="relative flex-1 bg-bg-0">
      {/* loading bar */}
      {state === "loading" && (
        <div
          aria-hidden
          className="shimmer absolute left-0 right-0 top-0 z-10 h-[2px] overflow-hidden bg-bg-2"
        />
      )}

      {/* iframe (always mounted while not blocked) */}
      {state !== "blocked" && (
        <iframe
          ref={iframeRef}
          src={url}
          title="project live preview"
          className="h-full w-full border-0 bg-bg-0"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {/* blocked fallback */}
      {state === "blocked" && <BlockedFallback url={url} />}
    </div>
  );
}

function BlockedFallback({ url }: { url: string }) {
  // Best-effort: surface the project image as the preview by parsing the URL host.
  // We resolve it through getProject by URL match.
  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-bg-0 p-8 text-center">
      <BlockedPreview url={url} />
      <div className="space-y-2 max-w-[40ch]">
        <p className="text-[14px] text-text-1">
          this site doesn't allow embedding inside another page.
        </p>
        <p className="text-[12.5px] text-text-3">
          {host} ships <code>X-Frame-Options</code> · open it directly to view.
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        data-pointer="true"
        className="group inline-flex items-center gap-2 rounded-md border border-border-hot bg-bg-2 px-4 py-2 text-[13px] text-mint transition-colors hover:bg-mint hover:text-bg-0"
      >
        open in new tab
        <span className="transition-transform group-hover:translate-x-0.5">↗</span>
      </a>
    </div>
  );
}

function BlockedPreview({ url }: { url: string }) {
  // resolve project image by URL matching project records
  const project = getProjectByUrl(url);
  if (!project) return null;
  return (
    <div className="relative aspect-[16/10] w-full max-w-[640px] overflow-hidden rounded-md border border-border bg-bg-1">
      <Image
        src={project.image}
        alt={`${project.title} preview`}
        fill
        sizes="(max-width: 768px) 90vw, 640px"
        className="object-cover object-top opacity-90"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-0/70 via-bg-0/20 to-transparent" />
    </div>
  );
}

function getProjectByUrl(url: string) {
  const norm = (u: string) => u.replace(/\/+$/, "");
  return projects.find((p) => norm(p.url) === norm(url));
}
