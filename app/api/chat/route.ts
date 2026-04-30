import type { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/systemPrompt";
import { TOOL_DEFINITIONS, runTool } from "@/lib/ai/tools";
import { streamNIM, type NimMessage, type NimToolCall } from "@/lib/ai/nimClient";
import type { NimModel } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { message, model, history } = (await req.json()) as {
    message: string;
    model: NimModel;
    history: NimMessage[];
  };

  const messages: NimMessage[] = [
    { role: "system", content: buildSystemPrompt() },
    ...history,
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (data: string) =>
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      let currentMessages = messages;
      let hops = 0;

      while (hops <= 3) {
        let nimStream: ReadableStream<Uint8Array>;
        try {
          nimStream = await streamNIM(currentMessages, model, TOOL_DEFINITIONS);
        } catch (err) {
          enqueue(JSON.stringify({ type: "content", token: `⚠ ${(err as Error).message}` }));
          enqueue("[DONE]");
          controller.close();
          return;
        }

        const reader = nimStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Tool call accumulator
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

              // Accumulate tool calls (don't forward to client)
              if (delta.tool_calls) {
                hasToolCalls = true;
                for (const tc of delta.tool_calls as NimToolCall[]) {
                  const idx = (tc as { index?: number }).index ?? 0;
                  if (!toolCallsBuffer[idx]) {
                    toolCallsBuffer[idx] = { id: "", name: "", args: "" };
                  }
                  if (tc.id) toolCallsBuffer[idx].id = tc.id;
                  if (tc.function?.name) toolCallsBuffer[idx].name = tc.function.name;
                  if (tc.function?.arguments) toolCallsBuffer[idx].args += tc.function.arguments;
                }
              }

              // Forward content tokens immediately
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

        // No tool calls → done
        if (!hasToolCalls) {
          enqueue("[DONE]");
          controller.close();
          return;
        }

        // Execute tool calls and loop
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
