const OLLAMA_BASE = "https://ollama.com/api";

export type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export class RateLimitError extends Error {
  constructor() {
    super("ollama rate limit");
    this.name = "RateLimitError";
  }
}

export async function streamOllama(
  messages: OllamaMessage[],
  model: string,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OLLAMA_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OLLAMA_KEY}`,
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (res.status === 429) throw new RateLimitError();

  if (!res.ok) {
    const text = await res.text();
    if (/rate.?limit/i.test(text)) throw new RateLimitError();
    throw new Error(`Ollama ${res.status}: ${text}`);
  }

  return res.body!;
}
