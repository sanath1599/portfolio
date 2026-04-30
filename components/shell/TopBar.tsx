"use client";

import { useConsole } from "./ConsoleProvider";
import { profile } from "@/lib/copy";

export function TopBar() {
  const { dispatch } = useConsole();

  return (
    <header
      className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-bg-0/85 px-4 backdrop-blur-md sm:px-6 lg:px-8"
      role="banner"
    >
      <span className="flex items-center gap-2 text-[13px]">
        <span className="block h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_8px_var(--color-glow-mint)] soft-pulse" />
        <span className="text-text-1">~/{profile.handle}</span>
      </span>
      <span className="hidden text-text-3 sm:inline">·</span>
      <span className="hidden text-[12.5px] text-text-2 sm:inline">
        {profile.tagline}
      </span>

      <button
        onClick={() => dispatch({ type: "palette/toggle", open: true })}
        data-pointer="true"
        className="ml-auto group flex items-center gap-2 rounded-md border border-border bg-bg-1/70 px-2.5 py-1.5 text-[12px] text-text-2 transition-colors hover:border-border-hot hover:text-warm"
        aria-label="Open command palette"
      >
        <kbd className="rounded border border-border bg-bg-2 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] text-text-3 group-hover:text-text-2">
          ⌘ K
        </kbd>
        <span className="hidden sm:inline">command palette</span>
      </button>
    </header>
  );
}
