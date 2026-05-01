"use client";

import { useConsole } from "@/components/shell/ConsoleProvider";
import { commandsList } from "@/lib/commands";
import type { CommandSpec, HistoryEntry, NimModel, OutputPayload } from "@/lib/types";
import { NIM_MODELS } from "@/lib/types";
import { motion } from "motion/react";

export function ChatHistory() {
  const { state } = useConsole();

  return (
    <div className="space-y-4 text-[13.5px] leading-[1.6] sm:text-[14px]">
      {state.history.map((entry) => {
        if (entry.kind === "command") {
          return <UserMessage key={entry.id} entry={entry} />;
        }
        if (entry.kind === "streaming") {
          return <StreamingMessage key={entry.id} entry={entry} />;
        }
        return <AssistantMessage key={entry.id} entry={entry} />;
      })}
    </div>
  );
}

function UserMessage({ entry }: { entry: Extract<HistoryEntry, { kind: "command" }> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex items-baseline gap-2"
    >
      <span className="select-none text-warm">❯</span>
      <span className="text-text-1">{entry.raw}</span>
    </motion.div>
  );
}

function StreamingMessage({
  entry,
}: {
  entry: Extract<HistoryEntry, { kind: "streaming" }>;
}) {
  const hasThinking = entry.thinkingTokens.length > 0;
  const hasContent = entry.contentTokens.length > 0;
  const isThinking = !entry.done && !hasContent;
  const thinkingText = entry.thinkingTokens.join("");
  const contentText = entry.contentTokens.join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex gap-3"
    >
      <span className="mt-[2px] shrink-0 select-none text-warm">●</span>
      <div className="flex-1 min-w-0 space-y-2">
        {/* Thinking / reasoning block */}
        {hasThinking && (
          <details open={isThinking} className="group">
            <summary className="cursor-pointer select-none list-none flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-text-3 hover:text-text-2 transition-colors">
              <span className={isThinking ? "text-amber soft-pulse" : "text-text-3"}>◆</span>
              {isThinking ? "thinking…" : "reasoning"}
              <span className="ml-auto text-[10px] opacity-50 group-open:hidden">[show]</span>
              <span className="ml-auto text-[10px] opacity-50 hidden group-open:inline">[hide]</span>
            </summary>
            <div className="mt-1.5 border-l-2 border-border pl-3">
              <p
                className="text-text-3 text-[12px] leading-[1.5] whitespace-pre-wrap break-words"
                style={{ wordBreak: "break-word" }}
              >
                {thinkingText}
                {isThinking && <span className="animate-pulse opacity-70 text-warm">▋</span>}
              </p>
            </div>
          </details>
        )}

        {/* Main content */}
        {hasContent ? (
          <p
            className="text-warm-soft whitespace-pre-wrap"
            style={{ wordBreak: "break-word" }}
          >
            {contentText}
            {!entry.done && <span className="animate-pulse text-warm">▋</span>}
          </p>
        ) : isThinking && !hasThinking ? (
          <p className="text-text-3 text-[12px] flex items-center gap-1.5">
            <span className="animate-pulse text-amber">◆</span>
            thinking…
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}

function AssistantMessage({
  entry,
}: {
  entry: Extract<HistoryEntry, { kind: "output" }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
      className="flex gap-3"
    >
      <span className="mt-[2px] shrink-0 select-none text-warm">●</span>
      <div className="flex-1 min-w-0">
        <Payload payload={entry.payload} />
      </div>
    </motion.div>
  );
}

function Payload({ payload }: { payload: OutputPayload }) {
  switch (payload.type) {
    case "chat":
      return <ChatLines lines={payload.lines} />;
    case "section":
      return (
        <p className="text-text-2">
          rendered <span className="text-warm">/{payload.sectionId}</span> · scroll down to view ↓
        </p>
      );
    case "open":
      return (
        <p className="text-text-2">
          opening <span className="text-warm">{payload.projectId}</span> in the live viewer · esc to close.
        </p>
      );
    case "alternates":
      return <Alternates raw={payload.raw} alternates={payload.alternates} />;
    case "model-picker":
      return <ModelPicker current={payload.current} />;
  }
}

function ChatLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => (
        <p
          key={i}
          className={i === 0 ? "text-warm-soft" : "text-amber"}
          style={{ wordBreak: "break-word" }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function ModelPicker({ current }: { current: NimModel }) {
  const { state, dispatch } = useConsole();
  const active = state.model;
  return (
    <div className="space-y-2.5">
      <p className="text-warm-soft">select a model:</p>
      <div className="flex flex-col gap-1.5">
        {NIM_MODELS.map((m) => {
          const isCurrent = m.id === active;
          return (
            <button
              key={m.id}
              data-pointer="true"
              onClick={() => dispatch({ type: "model/set", model: m.id as NimModel })}
              className={[
                "flex items-center gap-3 rounded border px-3 py-2 text-left text-[12px] transition-colors",
                isCurrent
                  ? "border-warm/50 bg-warm/10 text-warm"
                  : "border-border bg-bg-2/40 text-text-2 hover:border-border-hot hover:text-warm-soft hover:bg-bg-2/80",
              ].join(" ")}
            >
              <span className={isCurrent ? "text-warm" : "text-text-3"}>
                {isCurrent ? "◆" : "◇"}
              </span>
              <span className="font-medium">{m.label}</span>
              <span className="ml-auto text-[10.5px] text-text-3 font-mono">{m.alias}</span>
              {isCurrent && (
                <span className="text-[10px] uppercase tracking-wide text-warm/70">active</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-text-3">or type <span className="text-text-2">/model glm</span> · <span className="text-text-2">/model gemma</span> · <span className="text-text-2">/model deepseek</span></p>
    </div>
  );
}

function Alternates({
  raw,
  alternates,
}: {
  raw: string;
  alternates: CommandSpec[];
}) {
  const { dispatch } = useConsole();
  const fallback = alternates.length > 0 ? alternates : commandsList.slice(0, 4);
  return (
    <div className="space-y-2">
      <p className="text-warm-soft">
        hmm — i didn&apos;t catch that. did you mean:
      </p>
      <div className="flex flex-wrap gap-2">
        {fallback.slice(0, 4).map((cmd) => (
          <button
            key={cmd.id}
            data-pointer="true"
            onClick={() => dispatch({ type: "input/set", value: `/${cmd.id}` })}
            className="rounded border border-border bg-bg-2 px-2 py-1 text-[12px] text-text-1 transition-colors hover:border-border-hot hover:text-warm"
          >
            <span className="text-warm">/</span>
            {cmd.id}
          </button>
        ))}
      </div>
    </div>
  );
}
