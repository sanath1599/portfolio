"use client";

import type { ReactNode } from "react";
import { ConsoleProvider } from "./ConsoleProvider";
import { TopBar } from "./TopBar";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { TerminalChat } from "@/components/terminal/TerminalChat";
import { Whoami } from "@/components/sections/Whoami";
import { Projects } from "@/components/sections/Projects";
import { Quote } from "@/components/sections/Quote";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { ProjectModal } from "@/components/sections/ProjectModal";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { useGlobalShortcuts } from "@/lib/hooks/useGlobalShortcuts";

export function Shell({ blogSlot }: { blogSlot: ReactNode }) {
  return (
    <ConsoleProvider>
      <ShellInner blogSlot={blogSlot} />
    </ConsoleProvider>
  );
}

function ShellInner({ blogSlot }: { blogSlot: ReactNode }) {
  useGlobalShortcuts();

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <TopBar />

        {/* full-page grid: sticky sidebar (left) + all content (right) */}
        <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr] lg:gap-6">
            {/* LEFT: sticky sidebar */}
            <div className="order-2 lg:order-1 min-w-0">
              <Sidebar />
            </div>

            {/* RIGHT: terminal + sections */}
            <div className="order-1 lg:order-2 min-w-0">
              <div className="h-[64vh] min-h-[440px] max-h-[820px] lg:h-[78vh]">
                <TerminalChat />
              </div>
              {/* disclaimer */}
              <p className="mt-2 mb-10 px-1 text-[10.5px] text-text-3 leading-relaxed">
                <span className="text-warm">*</span>{" "}
                &ldquo;Claude Code&rdquo; is a trademark of Anthropic. This terminal is a creative
                recreation inspired by that interface and is not affiliated with Anthropic.
                AI responses may contain errors — always verify important information.
              </p>
              <div>
                <Whoami />
                <Projects />
                <Quote />
                <Experience />
                {blogSlot}
                <Contact />
              </div>
            </div>
          </div>
        </div>

        <ProjectModal />
        <CommandPalette />
      </div>
    </>
  );
}
