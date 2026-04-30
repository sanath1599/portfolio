"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import type {
  ConsoleAction,
  ConsoleState,
  HistoryEntry,
  OutputPayload,
  SectionId,
} from "@/lib/types";
import { DEFAULT_MODEL } from "@/lib/types";
import type { ProjectId } from "@/lib/projects";

let nextEntryId = 1000;
export const eid = (): string => `e${nextEntryId++}`;

const initialState: ConsoleState = {
  history: [],
  inputHistory: [],
  inputHistoryIndex: -1,
  currentInput: "",
  activeSection: "whoami",
  modal: { projectId: null, fullscreen: false },
  palette: { open: false },
  theme: "default",
  bootDone: true,
  model: DEFAULT_MODEL,
};

function reducer(state: ConsoleState, action: ConsoleAction): ConsoleState {
  switch (action.type) {
    case "input/set":
      return { ...state, currentInput: action.value, inputHistoryIndex: -1 };

    case "input/historyBack": {
      if (state.inputHistory.length === 0) return state;
      const next = Math.min(
        state.inputHistory.length - 1,
        state.inputHistoryIndex + 1,
      );
      return {
        ...state,
        inputHistoryIndex: next,
        currentInput: state.inputHistory[state.inputHistory.length - 1 - next] ?? "",
      };
    }

    case "input/historyForward": {
      if (state.inputHistoryIndex <= 0) {
        return { ...state, inputHistoryIndex: -1, currentInput: "" };
      }
      const next = state.inputHistoryIndex - 1;
      return {
        ...state,
        inputHistoryIndex: next,
        currentInput: state.inputHistory[state.inputHistory.length - 1 - next] ?? "",
      };
    }

    case "submit": {
      const { raw, result } = action;
      const cmdEntry: HistoryEntry = {
        kind: "command",
        id: eid(),
        raw,
        resolved: result.match?.id ?? null,
        via: result.via,
        confidence: result.confidence,
        arg: result.arg,
        timestamp: Date.now(),
      };
      return {
        ...state,
        currentInput: "",
        inputHistory: [...state.inputHistory, raw].slice(-50),
        inputHistoryIndex: -1,
        history: [...state.history, cmdEntry],
      };
    }

    case "history/append":
      return { ...state, history: [...state.history, action.entry] };

    case "history/clear":
      return { ...state, history: [] };

    case "section/set":
      return { ...state, activeSection: action.section };

    case "modal/open":
      return { ...state, modal: { projectId: action.projectId, fullscreen: false } };

    case "modal/close":
      return { ...state, modal: { projectId: null, fullscreen: false } };

    case "modal/fullscreen":
      return { ...state, modal: { ...state.modal, fullscreen: action.on } };

    case "palette/toggle":
      return {
        ...state,
        palette: { open: action.open ?? !state.palette.open },
      };

    case "theme/set": {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("retro", action.mode === "retro");
      }
      return { ...state, theme: action.mode };
    }

    case "boot/done":
      return { ...state, bootDone: true };

    case "stream/start":
      return {
        ...state,
        history: [
          ...state.history,
          {
            kind: "streaming",
            id: action.id,
            thinkingTokens: [],
            contentTokens: [],
            done: false,
            timestamp: Date.now(),
          },
        ],
      };

    case "stream/chunk": {
      return {
        ...state,
        history: state.history.map((entry) => {
          if (entry.kind !== "streaming" || entry.id !== action.id) return entry;
          if (action.chunk.type === "thinking") {
            return { ...entry, thinkingTokens: [...entry.thinkingTokens, action.chunk.token] };
          }
          return { ...entry, contentTokens: [...entry.contentTokens, action.chunk.token] };
        }),
      };
    }

    case "stream/done":
      return {
        ...state,
        history: state.history.map((entry) =>
          entry.kind === "streaming" && entry.id === action.id
            ? { ...entry, done: true }
            : entry,
        ),
      };

    case "model/set":
      return { ...state, model: action.model };

    default:
      return state;
  }
}

type Ctx = {
  state: ConsoleState;
  dispatch: React.Dispatch<ConsoleAction>;
  appendOutput: (forCommand: string, sectionId: SectionId | null, payload: OutputPayload) => void;
  openProject: (id: ProjectId, viaCommand?: string) => void;
};

const ConsoleContext = createContext<Ctx | null>(null);

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const appendOutput: Ctx["appendOutput"] = useCallback(
    (forCommand, sectionId, payload) => {
      dispatch({
        type: "history/append",
        entry: {
          kind: "output",
          id: eid(),
          forCommand,
          sectionId,
          payload,
          timestamp: Date.now(),
        },
      });
    },
    [],
  );

  const openProject: Ctx["openProject"] = useCallback(
    (id, viaCommand = "/open") => {
      dispatch({ type: "modal/open", projectId: id });
      dispatch({
        type: "history/append",
        entry: {
          kind: "output",
          id: eid(),
          forCommand: viaCommand,
          sectionId: null,
          payload: { type: "open", projectId: id },
          timestamp: Date.now(),
        },
      });
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ state, dispatch, appendOutput, openProject }),
    [state, appendOutput, openProject],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}

export function useConsole(): Ctx {
  const ctx = useContext(ConsoleContext);
  if (!ctx) throw new Error("useConsole must be used inside ConsoleProvider");
  return ctx;
}

export function useOnce(key: string, run: () => void) {
  const ran = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (ran.current.has(key)) return;
    ran.current.add(key);
    run();
  }, [key, run]);
}
