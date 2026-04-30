"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useConsole } from "@/components/shell/ConsoleProvider";
import { useCommandResolver } from "@/lib/hooks/useCommandResolver";
import { visibleCommands } from "@/lib/commands";
import { projects } from "@/lib/projects";
import type { ProjectId } from "@/lib/projects";

type PaletteItem = {
  id: string;
  group: "sections" | "commands" | "projects";
  label: string;
  hint: string;
  /** action ID to dispatch on Enter */
  exec: () => void;
  /** searchable haystack */
  searchText: string;
};

function fuzzyScore(query: string, target: string): number {
  if (!query) return 0.001; // include all
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (t.includes(q)) {
    // direct substring is best; earlier match scores higher
    const idx = t.indexOf(q);
    return 1.5 - idx / Math.max(t.length, 1) - q.length * 0.001;
  }
  // ordered char match
  let score = 0;
  let ti = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const found = t.indexOf(ch, ti);
    if (found < 0) return 0;
    score += 1 - (found - ti) / Math.max(t.length, 1);
    ti = found + 1;
  }
  return score / q.length;
}

export function CommandPalette() {
  const { state, dispatch, openProject } = useConsole();
  const { submit } = useCommandResolver();
  const open = state.palette.open;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        dispatch({ type: "palette/toggle" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  // reset input + selection when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // microtask focus to ensure portal mounted
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const sectionIds = ["whoami", "projects", "experience", "blog", "contact"] as const;
    const sectionItems: PaletteItem[] = sectionIds.map((id) => {
      const cmd = visibleCommands.find((c) => c.id === id);
      return {
        id: `section:${id}`,
        group: "sections",
        label: `/${id}`,
        hint: cmd?.description ?? "",
        searchText: `${id} ${cmd?.description ?? ""} ${cmd?.slashAliases.join(" ") ?? ""}`,
        exec: () => submit(`/${id}`),
      };
    });

    const otherCommands: PaletteItem[] = visibleCommands
      .filter((c) => !sectionIds.includes(c.id as (typeof sectionIds)[number]))
      .map((c) => ({
        id: `command:${c.id}`,
        group: "commands",
        label: `/${c.id}`,
        hint: c.description,
        searchText: `${c.id} ${c.description} ${c.slashAliases.join(" ")}`,
        exec: () => submit(`/${c.id}`),
      }));

    const projectItems: PaletteItem[] = projects.map((p) => ({
      id: `project:${p.id}`,
      group: "projects",
      label: p.title,
      hint: p.blurb,
      searchText: `${p.id} ${p.title} ${p.blurb} ${p.stack.join(" ")}`,
      exec: () => openProject(p.id as ProjectId),
    }));

    return [...sectionItems, ...otherCommands, ...projectItems];
  }, [submit, openProject]);

  const filtered = useMemo(() => {
    const scored = items
      .map((it) => ({ it, score: fuzzyScore(query, it.searchText) }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map((s) => s.it);
  }, [items, query]);

  // group filtered into sections (preserve order: sections, commands, projects)
  const grouped = useMemo(() => {
    const groups: Record<PaletteItem["group"], PaletteItem[]> = {
      sections: [],
      commands: [],
      projects: [],
    };
    for (const it of filtered) groups[it.group].push(it);
    const flat: PaletteItem[] = [];
    (["sections", "commands", "projects"] as const).forEach((g) => {
      flat.push(...groups[g]);
    });
    return { flat, groups };
  }, [filtered]);

  // clamp active to valid range when filter shrinks
  useEffect(() => {
    if (active >= grouped.flat.length) setActive(Math.max(0, grouped.flat.length - 1));
  }, [grouped.flat.length, active]);

  // ensure active item visible
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-active="true"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => dispatch({ type: "palette/toggle", open: false });
  const submitActive = () => {
    const it = grouped.flat[active];
    if (!it) return;
    close();
    // small delay so palette unmounts cleanly
    window.setTimeout(it.exec, 30);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(grouped.flat.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submitActive();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[90] flex items-start justify-center bg-bg-glass/80 px-4 pt-[14vh] backdrop-blur-2xl"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] overflow-hidden rounded-md border border-border-strong bg-bg-1 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.7)]"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* search header */}
            <div className="flex items-center gap-2 border-b border-border bg-bg-2/60 px-3 py-2.5">
              <span className="text-warm">▶</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKey}
                placeholder="search · projects · sections · commands"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full border-0 bg-transparent text-[14px] text-text-1 placeholder:italic placeholder:text-text-3 focus:outline-none"
                style={{ caretColor: "var(--color-mint)" }}
                aria-label="Palette search"
              />
              <kbd className="rounded border border-border bg-bg-1 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-text-3">
                Esc
              </kbd>
            </div>

            {/* results */}
            <ul
              ref={listRef}
              className="max-h-[55vh] overflow-y-auto py-1 text-[13px]"
            >
              {grouped.flat.length === 0 && (
                <li className="px-3 py-4 text-center text-text-3">no matches</li>
              )}

              {(["sections", "commands", "projects"] as const).map((g) => {
                const list = grouped.groups[g];
                if (list.length === 0) return null;
                return (
                  <li key={g}>
                    <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.1em] text-text-3">
                      {g}
                    </div>
                    <ul>
                      {list.map((it) => {
                        const isActive = grouped.flat[active]?.id === it.id;
                        return (
                          <li key={it.id}>
                            <button
                              data-pointer="true"
                              data-active={isActive}
                              onMouseEnter={() => {
                                const idx = grouped.flat.findIndex((x) => x.id === it.id);
                                if (idx >= 0) setActive(idx);
                              }}
                              onClick={submitActive}
                              className={[
                                "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                                isActive
                                  ? "bg-mint/10 text-text-1"
                                  : "text-text-2 hover:bg-bg-2/60",
                              ].join(" ")}
                            >
                              <span
                                className={isActive ? "text-mint" : "text-text-3"}
                              >
                                {it.group === "projects" ? "↗" : "/"}
                              </span>
                              <span className="text-text-1">{it.label.replace(/^\//, "")}</span>
                              <span className="ml-auto truncate text-[11.5px] text-text-3">
                                {it.hint}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>

            {/* footer hints */}
            <footer className="flex items-center gap-3 border-t border-border bg-bg-1 px-3 py-2 text-[10.5px] uppercase tracking-[0.06em] text-text-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-bg-2 px-1 py-px text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-bg-2 px-1 py-px text-[10px]">↵</kbd>
                select
              </span>
              <span className="ml-auto text-mint">
                ⌘K to toggle
              </span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
