"use client";

import { useEffect, useRef, useState } from "react";
import { useConsole } from "@/components/shell/ConsoleProvider";
import { useCommandResolver } from "@/lib/hooks/useCommandResolver";
import { commandsList } from "@/lib/commands";

const ALL_SLASH_ALIASES = commandsList.flatMap((c) => c.slashAliases).sort();

function tabComplete(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;
  const [first, ...rest] = trimmed.split(/\s+/);
  if (rest.length === 0) {
    const matches = ALL_SLASH_ALIASES.filter((a) => a.startsWith(first));
    if (matches.length === 1 && matches[0] !== first) return matches[0] + " ";
    return null;
  }
  const cmd = commandsList.find((c) => c.slashAliases.includes(first));
  if (cmd?.arg) {
    const stub = (rest[0] ?? "").toLowerCase();
    const argMatches = cmd.arg.values.filter((v) => v.startsWith(stub));
    if (argMatches.length === 1 && argMatches[0] !== stub)
      return `${first} ${argMatches[0]}`;
  }
  return null;
}

export function Prompt({
  autoFocus = true,
  registerFocus,
}: {
  autoFocus?: boolean;
  registerFocus?: (fn: () => void) => void;
}) {
  const { state, dispatch } = useConsole();
  const { submit } = useCommandResolver();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerFocus?.(() => inputRef.current?.focus());
  }, [registerFocus]);

  // bind global "/" to focus the prompt
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 100);
      return () => window.clearTimeout(t);
    }
  }, [autoFocus]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Enter": {
        e.preventDefault();
        submit(state.currentInput);
        break;
      }
      case "ArrowUp": {
        if (state.inputHistory.length === 0) break;
        e.preventDefault();
        dispatch({ type: "input/historyBack" });
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        dispatch({ type: "input/historyForward" });
        break;
      }
      case "Tab": {
        const completion = tabComplete(state.currentInput);
        if (completion) {
          e.preventDefault();
          dispatch({ type: "input/set", value: completion });
        }
        break;
      }
      case "l": {
        if (e.ctrlKey) {
          e.preventDefault();
          dispatch({ type: "history/clear" });
        }
        break;
      }
    }
  };

  const isSlash = state.currentInput.trimStart().startsWith("/");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(state.currentInput);
      }}
      className="group flex items-center gap-2 px-4 py-3 sm:px-6"
      data-pointer="true"
    >
      <span aria-hidden className="select-none text-warm">
        ❯
      </span>
      <input
        ref={inputRef}
        value={state.currentInput}
        onChange={(e) => dispatch({ type: "input/set", value: e.target.value })}
        onKeyDown={onKeyDown}
        placeholder="ask anything — e.g. 'tell me about AIPT'"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Console prompt"
        className={[
          "w-full border-0 bg-transparent text-[14px] outline-none",
          "placeholder:text-text-3 placeholder:italic",
          isSlash ? "text-warm" : "text-text-1",
        ].join(" ")}
        style={{ caretColor: "var(--color-warm)" }}
      />
      <kbd className="hidden select-none items-center gap-1 rounded border border-border bg-bg-1 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-text-3 sm:flex">
        ↵
      </kbd>
    </form>
  );
}
