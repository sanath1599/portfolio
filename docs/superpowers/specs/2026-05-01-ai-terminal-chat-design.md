# AI Terminal Chat — Design Spec
**Date:** 2026-05-01  
**Status:** Approved

---

## Overview

Replace the portfolio terminal's hardcoded keyword-matching with a live agentic AI chat backed by NVIDIA NIM. Visitors type natural questions; the AI answers using a rich system prompt built from Sanath's real data. Two tools give the AI agency: one to look up project details, one to send a contact email via Resend. Responses stream token-by-token into the terminal UI.

---

## Architecture

```
Browser (Prompt.tsx)
  │  user types → submit()
  ▼
useCommandResolver
  ├─ slash commands (/clear, /model, /open, /theme) → handled client-side unchanged
  └─ all other input → POST /api/chat
        │  body: { message, model, history[] }
        ▼
   app/api/chat/route.ts  (Next.js Route Handler, Node runtime)
        │
        ├─ Build messages: systemPrompt + conversation history + new user msg
        ├─ Call NVIDIA NIM  (OpenAI-compatible, stream: true, tools: [...])
        │
        │  if response contains tool_calls:
        │    ├─ execute tool synchronously (browse_projects | send_email)
        │    ├─ append tool result to messages
        │    └─ loop (max 3 hops)
        │
        └─ pipe final text tokens back as SSE (text/event-stream)
              │
              ▼
   ConsoleProvider  ← stream/start + stream/append actions
        │
        ▼
   ChatHistory.tsx  ← renders streaming entry with blinking cursor
```

---

## New Files

### `lib/ai/systemPrompt.ts`
Builds the system prompt string from live data in `lib/copy.ts` and `lib/projects.ts`. Covers:
- Identity: Sanath Swaroop Mulky, Sr. AI Engineer, 8+ years experience
- Full experience list (Excelerate, Motiv8, StaTwig, NPCI, Buildup)
- All 5 projects with blurbs and URLs
- Stack, honors, contact info
- Tool usage instructions: always confirm before calling `send_email`; use `browse_projects` when asked for detail on a specific project or role

### `lib/ai/tools.ts`
Exports two OpenAI-format tool definitions and their executor functions:

**`browse_projects`**
```ts
{ query?: string }  // optional filter, e.g. "antm" or "blockchain"
```
Returns JSON: matching projects + experience roles from static data. No network call.

**`send_email`**
```ts
{ from_name: string, from_email: string, message: string }
```
Calls Resend API to send to `CONTACT_EMAIL` env var. Returns `{ sent: true }` or `{ error: string }`.

### `lib/ai/nimClient.ts`
Thin wrapper around the NVIDIA NIM OpenAI-compatible endpoint:
- Base URL: `https://integrate.api.nvidia.com/v1`
- Auth: `Bearer ${process.env.AI_API_KEY}`
- Supported models:
  - `z-ai/glm-4.7` (default)
  - `google/gemma-3n-e4b-it`
  - `mistralai/mistral-medium-3.5-128b`
- Exports `streamChat(messages, model, tools)` → `ReadableStream<string>`

### `app/api/chat/route.ts`
POST handler. Runs the agentic loop (max 3 tool hops), then pipes the final stream back as `text/event-stream`. Each SSE event is `data: <token>\n\n`. Final event is `data: [DONE]\n\n`.

---

## Modified Files

### `lib/types.ts`
Add `kind: "streaming"` to `HistoryEntry` with `tokens: string[]` and `done: boolean`.

### `components/shell/ConsoleProvider.tsx`
New reducer actions:
- `stream/start` — caller pre-generates an `id` (e.g. `eid()`), passes it in the action; reducer appends a `streaming` entry with that id
- `stream/append` — pushes token(s) into the streaming entry by `id`
- `stream/done` — marks the entry `done: true` (cursor disappears)

### `lib/hooks/useCommandResolver.ts`
Routing rule: if input starts with `/` AND resolves to a known slash command → handle client-side as before (clear, theme, open, model, ls, help, etc.). Everything else — unrecognised slash commands, keyword-matched freeform, plain English — routes to the AI (replacing both `freeformAnswer` and `answerFor` for non-slash paths).
1. Dispatch `submit` to log the command entry
2. Dispatch `stream/start` to create the streaming slot
3. `fetch('/api/chat', { method: 'POST', body: ... })`
4. Read the SSE stream, dispatch `stream/append` per token
5. On `[DONE]`, dispatch `stream/done`

The `conversationHistory` sent to the API is the last 20 non-welcome, non-streaming entries from `state.history`.

### `components/terminal/ChatHistory.tsx`
Render `kind: "streaming"` entries: join `tokens` into a single string, append a `▋` cursor if `!done`.

### `components/terminal/TerminalChat.tsx`
Replace the `<header>` window chrome with a **welcome splash** as the first visual element (not a history entry — a static JSX block above the scrollback):
- Left column: `sanath.swaroop`, tagline, active model badge, `~/portfolio`
- Right column: "Ask me anything" heading + 4 example question chips

Example chips (clicking fires as user message):
1. "Tell me about your work at NPCI"
2. "What did you build at StaTwig?"
3. "What does antm.ai do?"
4. "How does c0py.me work?"

The macOS traffic-light dots + `claude-code · ~/portfolio` title bar move above the splash.

### `components/sidebar/Sidebar.tsx`
- Outer `<aside>` gets `sticky top-4 self-start` (already inside a grid column)
- "Ask Claude" added as the **first item** in `MENU` (before whoami)
- `id: "ask"` — onClick: scroll page to top (so terminal is visible) then focus the prompt input
- `focusPrompt` is a callback passed down from `Shell` via a ref on the prompt input

### `components/shell/Shell.tsx`
- Pass a `focusPromptRef` (forwarded `RefObject<() => void>`) down to `Sidebar` and `TerminalChat`/`Prompt`

---

## Model Selection

New slash command `model`:
- `/model` — lists available models, shows current
- `/model glm` | `/model gemma` | `/model mistral` — switches model, stored in `ConsoleState.model`
- Current model shown as a badge in the terminal title bar

Add `model` to `ConsoleState` (default `"z-ai/glm-4.7"`), new action `model/set`.

---

## Tools — Detailed Behaviour

### `browse_projects`
The AI calls this when the visitor asks about a specific project or role with more depth than the system prompt covers. Returns a serialized subset of `lib/projects.ts` + `lib/copy.ts`. No network request — pure in-process data access.

### `send_email`
Flow enforced by system prompt instructions:
1. AI collects `from_name`, `from_email`, `message` conversationally (may take 2–3 turns)
2. AI shows a confirmation summary and asks "Shall I send this?"
3. Only after user confirms does the AI call `send_email`
4. On `{ sent: true }` → AI reports success. On error → AI reports failure and suggests `sanathswaroopmulky@gmail.com` directly.

Resend sends from `onboarding@resend.dev` (free tier) or a verified domain if configured.

---

## Environment Variables

| Key | Purpose |
|-----|---------|
| `AI_API_KEY` | NVIDIA NIM bearer token (already present) |
| `RESEND_API_KEY` | Resend API key for email |
| `CONTACT_EMAIL` | Destination email (sanathswaroopmulky@gmail.com) |

---

## Error Handling

- NIM API error (non-200) → stream an error line: `⚠ model error — try again or use /model to switch.`
- Tool loop exceeds 3 hops → break and stream current partial answer
- Resend failure → AI informs visitor and offers direct email address
- Empty input — ignored (no API call)

---

## Out of Scope

- Persistent conversation across page reloads (history lives in React state only)
- Authentication / rate limiting on `/api/chat`
- Blog section changes
- Any section below the terminal (Whoami, Projects, Experience, Contact remain unchanged)
