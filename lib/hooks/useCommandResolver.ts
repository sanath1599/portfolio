"use client";

import { useCallback } from "react";
import { commandsList } from "@/lib/commands";
import { resolve } from "@/lib/resolver";
import { answerFor } from "@/lib/chat";
import { NIM_MODELS, type NimModel, type StreamChunk } from "@/lib/types";
import type { CommandId } from "@/lib/types";
import type { ProjectId } from "@/lib/projects";
import { getProject } from "@/lib/projects";
import { useConsole, eid } from "@/components/shell/ConsoleProvider";
import type { NimMessage } from "@/lib/ai/nimClient";

export const SECTION_FOR: Partial<Record<CommandId, string>> = {
  whoami: "whoami",
  projects: "projects",
  experience: "experience",
  blog: "blog",
  contact: "contact",
};

const CLIENT_SLASH_IDS: CommandId[] = ["clear", "theme", "open", "ls", "help", "coffee", "sudo", "model"];

export function useCommandResolver() {
  const { state, dispatch, appendOutput, openProject } = useConsole();

  const submit = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const result = resolve(trimmed, commandsList);

      // Handle known client-side slash commands
      if (result.match && result.via === "slash" && CLIENT_SLASH_IDS.includes(result.match.id)) {
        dispatch({ type: "submit", raw: trimmed, result });
        const cmd = result.match;

        if (cmd.id === "clear") {
          dispatch({ type: "history/clear" });
          return;
        }

        if (cmd.id === "theme") {
          const mode =
            (result.arg as "default" | "retro" | undefined) ??
            (state.theme === "default" ? "retro" : "default");
          dispatch({ type: "theme/set", mode });
          appendOutput(trimmed, null, {
            type: "chat",
            lines: answerFor("theme", mode) ?? [`theme · ${mode}.`],
          });
          return;
        }

        if (cmd.id === "model") {
          const alias = result.arg ?? "";
          const picked = NIM_MODELS.find((m) => m.alias === alias || m.label.startsWith(alias));
          if (!picked) {
            appendOutput(trimmed, null, { type: "model-picker", current: state.model });
            return;
          }
          dispatch({ type: "model/set", model: picked.id as NimModel });
          appendOutput(trimmed, null, {
            type: "chat",
            lines: [`model switched · ${picked.label}`, `using ${picked.id}`],
          });
          return;
        }

        if (cmd.id === "open") {
          const projectId = (result.arg ?? "") as ProjectId;
          const lines = answerFor("open", projectId);
          if (getProject(projectId)) {
            appendOutput(trimmed, null, {
              type: "chat",
              lines: lines ?? [`launching ${projectId}…`],
            });
            openProject(projectId, `/open ${projectId}`);
            return;
          }
          appendOutput(trimmed, null, {
            type: "chat",
            lines: lines ?? ["specify a project: antm | c0py | motiv8 | ellie | aipt"],
          });
          return;
        }

        if (cmd.id === "ls") {
          appendOutput(trimmed, null, { type: "chat", lines: answerFor("ls") ?? [] });
          return;
        }

        if (cmd.id === "help") {
          appendOutput(trimmed, null, { type: "chat", lines: answerFor("help") ?? [] });
          return;
        }

        if (cmd.id === "coffee") {
          appendOutput(trimmed, null, { type: "chat", lines: answerFor("coffee") ?? [] });
          return;
        }

        if (cmd.id === "sudo") {
          appendOutput(trimmed, null, { type: "chat", lines: answerFor("sudo") ?? [] });
          return;
        }
      }

      // Everything else → AI
      dispatch({ type: "submit", raw: trimmed, result: { match: null, confidence: 0, via: "none", alternates: [] } });
      await streamAI(trimmed, state.model, state.history, dispatch);
    },
    [state, dispatch, appendOutput, openProject],
  );

  return { submit };
}

async function streamAI(
  message: string,
  model: NimModel,
  history: ReturnType<typeof useConsole>["state"]["history"],
  dispatch: ReturnType<typeof useConsole>["dispatch"],
) {
  const streamId = eid();
  dispatch({ type: "stream/start", id: streamId });

  // Build conversation history (last 20 turns, text only)
  const nimHistory: NimMessage[] = [];
  for (const e of history.slice(-20)) {
    if (e.kind === "command") {
      nimHistory.push({ role: "user", content: e.raw });
    } else if (e.kind === "output" && e.payload.type === "chat") {
      nimHistory.push({ role: "assistant", content: e.payload.lines.join("\n") });
    } else if (e.kind === "streaming" && e.done) {
      const content = e.contentTokens.join("");
      if (content) nimHistory.push({ role: "assistant", content });
    }
  }

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model, history: nimHistory }),
    });

    if (!res.ok || !res.body) {
      dispatch({ type: "stream/chunk", id: streamId, chunk: { type: "content", token: "⚠ connection error — try again." } });
      dispatch({ type: "stream/done", id: streamId });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const dataLine = part.split("\n").find((l) => l.startsWith("data: "));
        if (!dataLine) continue;
        const raw = dataLine.slice(6).trim();
        if (raw === "[DONE]") {
          dispatch({ type: "stream/done", id: streamId });
          return;
        }
        try {
          const chunk = JSON.parse(raw) as StreamChunk;
          dispatch({ type: "stream/chunk", id: streamId, chunk });
        } catch {
          // malformed chunk
        }
      }
    }
  } catch {
    dispatch({ type: "stream/chunk", id: streamId, chunk: { type: "content", token: "⚠ network error — try again." } });
  }
  dispatch({ type: "stream/done", id: streamId });
}

export function scrollToSection(id: string) {
  if (typeof window === "undefined") return;
  const el = document.getElementById(`section-${id}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
