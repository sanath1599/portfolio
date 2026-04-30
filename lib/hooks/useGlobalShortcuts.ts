"use client";

import { useEffect } from "react";
import { useConsole } from "@/components/shell/ConsoleProvider";
import { useCommandResolver } from "./useCommandResolver";
import { projects } from "@/lib/projects";

const isTextTarget = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.isContentEditable
  );
};

/**
 * Wires global single-key shortcuts that aren't handled by other components:
 *   - "?"   → opens /help
 *   - "1"–"5" → open project N
 *   - "g"   → followed by a letter, jumps to a section (g+p projects, g+w whoami, ...)
 *
 * Skipped when an input/textarea is focused.
 */
export function useGlobalShortcuts() {
  const { state } = useConsole();
  const { submit } = useCommandResolver();
  const { openProject } = useConsole();

  useEffect(() => {
    let chord: string | null = null;
    let chordTimer: number | undefined;

    const onKey = (e: KeyboardEvent) => {
      // ignore in inputs / when modal/palette open
      if (isTextTarget(e.target)) return;
      if (state.modal.projectId || state.palette.open) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // chord prefix
      if (chord === "g") {
        chord = null;
        window.clearTimeout(chordTimer);
        const map: Record<string, string> = {
          p: "/projects",
          w: "/whoami",
          e: "/experience",
          b: "/blog",
          c: "/contact",
          h: "/help",
        };
        const cmd = map[e.key.toLowerCase()];
        if (cmd) {
          e.preventDefault();
          submit(cmd);
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        submit("/help");
        return;
      }

      if (e.key === "g") {
        chord = "g";
        chordTimer = window.setTimeout(() => {
          chord = null;
        }, 800);
        return;
      }

      if (/^[1-5]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const project = projects[idx];
        if (project) {
          e.preventDefault();
          openProject(project.id);
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (chordTimer) window.clearTimeout(chordTimer);
    };
  }, [state.modal.projectId, state.palette.open, submit, openProject]);
}
