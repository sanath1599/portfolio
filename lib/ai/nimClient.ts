import type { NimModel } from "@/lib/types";

const NIM_BASE = "https://integrate.api.nvidia.com/v1";

export type NimMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: NimToolCall[];
  tool_call_id?: string;
};

export type NimToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type NimResponse = {
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: NimToolCall[];
    };
    finish_reason: string;
  }>;
};

export async function callNIM(
  messages: NimMessage[],
  model: NimModel,
  tools: unknown[],
): Promise<NimResponse> {
  const res = await fetch(`${NIM_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
      stream: false,
      max_tokens: 2048,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NIM ${res.status}: ${text}`);
  }

  return res.json() as Promise<NimResponse>;
}

export async function streamNIM(
  messages: NimMessage[],
  model: NimModel,
  tools: unknown[],
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${NIM_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? "auto" : undefined,
      stream: true,
      max_tokens: 2048,
      temperature: 0.6,
      reasoning_effort: "low",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NIM ${res.status}: ${text}`);
  }

  return res.body!;
}
