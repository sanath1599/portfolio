import type { ProjectId } from "./projects";

export type NimModel = "glm-4.7" | "gemma4:31b" | "deepseek-v3.2";

export const NIM_MODELS: { id: NimModel; label: string; alias: string }[] = [
  { id: "glm-4.7", label: "glm-4.7", alias: "glm" },
  { id: "gemma4:31b", label: "gemma 31b", alias: "gemma" },
  { id: "deepseek-v3.2", label: "deepseek-v3.2", alias: "deepseek" },
];

export const DEFAULT_MODEL: NimModel = "gemma4:31b";

// NIM fallback model IDs used when Ollama is rate-limited
export const NIM_FALLBACK_MODELS: Record<NimModel, string> = {
  "glm-4.7": "z-ai/glm4.7",
  "gemma4:31b": "google/gemma-3n-e4b-it",
  "deepseek-v3.2": "mistralai/mistral-medium-3.5-128b",
};

export type SectionId =
  | "whoami"
  | "projects"
  | "experience"
  | "blog"
  | "contact"
  | "help"
  | "boot";

export type CommandId =
  | "whoami"
  | "projects"
  | "experience"
  | "blog"
  | "contact"
  | "help"
  | "clear"
  | "open"
  | "theme"
  | "ls"
  | "coffee"
  | "sudo"
  | "model";

export type ResolverVia = "slash" | "regex" | "keywords" | "prefix" | "none";

export type CommandSpec = {
  id: CommandId;
  slashAliases: string[];
  patterns: RegExp[];
  keywords: string[];
  description: string;
  /** Optional positional arg metadata, used for tab-completion. */
  arg?: { name: string; values: string[] };
};

export type ResolveResult = {
  match: CommandSpec | null;
  confidence: number;
  via: ResolverVia;
  arg?: string;
  alternates: CommandSpec[];
};

export type StreamChunk =
  | { type: "thinking"; token: string }
  | { type: "content"; token: string };

export type HistoryEntry =
  | {
      kind: "command";
      id: string;
      raw: string;
      resolved: CommandId | null;
      via: ResolverVia;
      confidence: number;
      arg?: string;
      timestamp: number;
    }
  | {
      kind: "output";
      id: string;
      forCommand: string;
      sectionId: SectionId | null;
      payload: OutputPayload;
      timestamp: number;
    }
  | {
      kind: "streaming";
      id: string;
      thinkingTokens: string[];
      contentTokens: string[];
      done: boolean;
      timestamp: number;
    };

export type OutputPayload =
  | { type: "chat"; lines: string[] }
  | { type: "alternates"; raw: string; alternates: CommandSpec[] }
  | { type: "section"; sectionId: SectionId }
  | { type: "open"; projectId: ProjectId }
  | { type: "model-picker"; current: NimModel };

export type ConsoleState = {
  history: HistoryEntry[];
  inputHistory: string[];
  inputHistoryIndex: number;
  currentInput: string;
  activeSection: SectionId;
  modal: { projectId: ProjectId | null; fullscreen: boolean };
  palette: { open: boolean };
  theme: "default" | "retro";
  bootDone: boolean;
  model: NimModel;
};

export type ConsoleAction =
  | { type: "input/set"; value: string }
  | { type: "input/historyBack" }
  | { type: "input/historyForward" }
  | { type: "submit"; raw: string; result: ResolveResult }
  | { type: "history/append"; entry: HistoryEntry }
  | { type: "history/clear" }
  | { type: "section/set"; section: SectionId }
  | { type: "modal/open"; projectId: ProjectId }
  | { type: "modal/close" }
  | { type: "modal/fullscreen"; on: boolean }
  | { type: "palette/toggle"; open?: boolean }
  | { type: "theme/set"; mode: "default" | "retro" }
  | { type: "boot/done" }
  | { type: "stream/start"; id: string }
  | { type: "stream/chunk"; id: string; chunk: StreamChunk }
  | { type: "stream/done"; id: string }
  | { type: "model/set"; model: NimModel };
