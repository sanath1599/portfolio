import type { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { TOOL_DEFINITIONS, runTool } from "@/lib/ai/tools";
import { streamNIM, type NimMessage, type NimToolCall } from "@/lib/ai/nimClient";
import { streamOllama, RateLimitError, type OllamaMessage } from "@/lib/ai/ollamaClient";
import { isNimFallbackActive, activateNimFallback } from "@/lib/ai/providerState";
import { NIM_FALLBACK_MODELS } from "@/lib/types";
import type { NimModel } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { message, model, history } = (await req.json()) as {
    message: string;
    model: NimModel;
    history: NimMessage[];
  };

  const systemPrompt = buildSystemPrompt();
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      if (!isNimFallbackActive()) {
        // Primary: Ollama Cloud
        const ollamaMessages: OllamaMessage[] = [
          { role: "system", content: systemPrompt },
          ...history
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content ?? "",
            })),
          { role: "user", content: message },
        ];

        let ollamaStream: ReadableStream<Uint8Array>;
        try {
          ollamaStream = await streamOllama(ollamaMessages, model);
        } catch (err) {
          if (err instanceof RateLimitError) {
            activateNimFallback();
          } else {
            enqueue(JSON.stringify({ type: "content", token: `⚠ ${(err as Error).message}` }));
            enqueue("[DONE]");
            controller.close();
            return;
          }
          // Rate limited — fall through to NIM
          await runNimStream({ systemPrompt, history, message, model, enqueue, controller });
          return;
        }

        // Parse Ollama newline-delimited JSON stream
        const reader = ollamaStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const chunk = JSON.parse(trimmed) as {
                message?: { content?: string; thinking?: string };
                done?: boolean;
              };
              if (chunk.message?.thinking) {
                enqueue(JSON.stringify({ type: "thinking", token: chunk.message.thinking }));
              }
              if (chunk.message?.content) {
                enqueue(JSON.stringify({ type: "content", token: chunk.message.content }));
              }
            } catch {
              // skip malformed line
            }
          }
        }

        enqueue("[DONE]");
        controller.close();
        return;
      }

      // Fallback: NVIDIA NIM (active for 1h59m after rate limit)
      await runNimStream({ systemPrompt, history, message, model, enqueue, controller });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

async function runNimStream({
  systemPrompt,
  history,
  message,
  model,
  enqueue,
  controller,
}: {
  systemPrompt: string;
  history: NimMessage[];
  message: string;
  model: NimModel;
  enqueue: (data: string) => void;
  controller: ReadableStreamDefaultController;
}) {
  const nimModelId = NIM_FALLBACK_MODELS[model];
  const messages: NimMessage[] = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  let currentMessages = messages;
  let hops = 0;

  while (hops <= 3) {
    let nimStream: ReadableStream<Uint8Array>;
    try {
      nimStream = await streamNIM(currentMessages, nimModelId, TOOL_DEFINITIONS);
    } catch (err) {
      enqueue(JSON.stringify({ type: "content", token: `⚠ ${(err as Error).message}` }));
      enqueue("[DONE]");
      controller.close();
      return;
    }

    const reader = nimStream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const toolCallsBuffer: Record<number, { id: string; name: string; args: string }> = {};
    let hasToolCalls = false;
    let assistantContent = "";

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
        if (raw === "[DONE]") continue;

        try {
          const chunk = JSON.parse(raw);
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;

          if (delta.tool_calls) {
            hasToolCalls = true;
            for (const tc of delta.tool_calls as NimToolCall[]) {
              const idx = (tc as { index?: number }).index ?? 0;
              if (!toolCallsBuffer[idx]) toolCallsBuffer[idx] = { id: "", name: "", args: "" };
              if (tc.id) toolCallsBuffer[idx].id = tc.id;
              if (tc.function?.name) toolCallsBuffer[idx].name = tc.function.name;
              if (tc.function?.arguments) toolCallsBuffer[idx].args += tc.function.arguments;
            }
          }

          if (!hasToolCalls) {
            if (delta.reasoning_content) {
              enqueue(JSON.stringify({ type: "thinking", token: delta.reasoning_content }));
            }
            if (delta.content) {
              assistantContent += delta.content;
              enqueue(JSON.stringify({ type: "content", token: delta.content }));
            }
          }
        } catch {
          // skip malformed chunk
        }
      }
    }

    if (!hasToolCalls) {
      enqueue("[DONE]");
      controller.close();
      return;
    }

    hops++;
    const toolCalls: NimToolCall[] = Object.values(toolCallsBuffer).map((tc) => ({
      id: tc.id,
      type: "function",
      function: { name: tc.name, arguments: tc.args },
    }));

    currentMessages = [
      ...currentMessages,
      { role: "assistant", content: assistantContent || null, tool_calls: toolCalls },
    ];

    for (const tc of toolCalls) {
      let result: unknown;
      try {
        result = await runTool(tc.function.name, JSON.parse(tc.function.arguments || "{}"));
      } catch (e) {
        result = { error: (e as Error).message };
      }
      currentMessages = [
        ...currentMessages,
        { role: "tool", content: JSON.stringify(result), tool_call_id: tc.id },
      ];
    }
  }

  enqueue(JSON.stringify({ type: "content", token: "⚠ max tool hops reached." }));
  enqueue("[DONE]");
  controller.close();
}
