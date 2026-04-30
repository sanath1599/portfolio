"use client";

import { useEffect, useRef, useCallback } from "react";
import { useConsole } from "@/components/shell/ConsoleProvider";
import { useCommandResolver } from "@/lib/hooks/useCommandResolver";
import { NIM_MODELS } from "@/lib/types";
import { ChatHistory } from "./ChatHistory";
import { Prompt } from "./Prompt";

const EXAMPLE_CHIPS = [
  "Tell me about your work at NPCI",
  "What did you build at StaTwig?",
  "What does antm.ai do?",
  "How does c0py.me work?",
];

// Compact ASCII art — standard # chars only for reliable monospace alignment
const ASCII_ART = `
 ###  #     ##   #  #  ###   ####
#     #    #  #  #  #  #  #  #
#     #    ####  #  #  #  #  ###
#     #    #  #  #  #  #  #  #
 ###  ##### #  #   ##   ###   ####`.trim();

export function TerminalChat() {
  const { state } = useConsole();
  const { submit } = useCommandResolver();
  const scrollRef = useRef<HTMLDivElement>(null);
  const promptFocusRef = useRef<(() => void) | null>(null);

  const activeModel = NIM_MODELS.find((m) => m.id === state.model);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [state.history.length]);

  useEffect(() => {
    const handler = () => promptFocusRef.current?.();
    window.addEventListener("focus-prompt", handler);
    return () => window.removeEventListener("focus-prompt", handler);
  }, []);

  const registerFocus = useCallback((fn: () => void) => {
    promptFocusRef.current = fn;
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-bg-1/40 backdrop-blur-sm">
      {/* window chrome */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-bg-2/40 px-3 py-2">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <span className="font-mono text-[12px] text-text-2">
          claude-code <span className="text-text-3">·</span> ~/portfolio
        </span>
        <span className="ml-1 rounded border border-border bg-bg-2/60 px-1.5 py-0.5 text-[10px] text-amber tracking-wide">
          {activeModel?.label ?? state.model}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.08em] text-mint">
          <span className="block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_6px_var(--color-glow-mint)] soft-pulse" />
          assistant online
        </span>
      </header>

      {/* welcome splash */}
      {state.history.length === 0 && (
        <div className="shrink-0 border-b border-border">
          {/* ASCII art banner */}
          <div className="border-b border-border bg-bg-2/30 px-4 py-3 overflow-x-auto">
            <pre
              className="text-warm select-none leading-[1.15] whitespace-pre"
              style={{ fontSize: "clamp(5px, 1.1vw, 9px)" }}
              aria-hidden
            >
              {ASCII_ART}
            </pre>
            <p className="mt-1.5 text-[10px] text-text-3 tracking-[0.06em]">
              v1.4.0 · portfolio assistant · ~/sanath-swaroop-mulky
            </p>
          </div>

          {/* identity + chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* left: identity */}
            <div className="px-4 py-4 sm:px-5 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.1em] text-text-3">context loaded</p>
              <div className="space-y-0.5 text-[12.5px]">
                <p className="text-text-1 font-medium">Sanath Swaroop Mulky</p>
                <p className="text-text-2">AI Engineer · Systems · Security</p>
                <p className="text-text-3 text-[11px]">5 projects · 5 roles · 8+ years</p>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-text-3 uppercase tracking-wide">model</span>
                <span className="rounded border border-border bg-bg-2/80 px-1.5 py-0.5 text-[10px] text-amber">
                  {activeModel?.label ?? state.model}
                </span>
                <span className="text-[10px] text-text-3">·</span>
                <span className="text-[10px] text-text-3">type /model to switch</span>
              </div>
            </div>
            {/* right: example chips */}
            <div className="px-4 py-4 sm:px-5 space-y-2.5">
              <p className="text-[11px] uppercase tracking-[0.1em] text-text-3">ask me anything</p>
              <div className="flex flex-col gap-1.5">
                {EXAMPLE_CHIPS.map((q) => (
                  <button
                    key={q}
                    data-pointer="true"
                    onClick={() => submit(q)}
                    className="w-full text-left rounded border border-border bg-bg-2/40 px-2.5 py-1.5 text-[12px] text-text-2 transition-colors hover:border-border-hot hover:text-warm-soft hover:bg-bg-2/80"
                  >
                    <span className="text-warm mr-1.5">›</span>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* scrollback */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <ChatHistory />
      </div>

      {/* prompt */}
      <div className="border-t border-border bg-bg-1/60">
        <Prompt autoFocus registerFocus={registerFocus} />
      </div>
    </div>
  );
}
