import type { CompletionOptions } from "@/types/ai"
import type { ModelAdapter } from "./interface"

export class VLLMAdapter implements ModelAdapter {
  readonly provider = "vllm" as const
  readonly model: string

  constructor(
    private readonly baseUrl: string,
    model = "mistral-7b",
  ) {
    this.model = model
  }

  async complete(prompt: string, opts: CompletionOptions = {}): Promise<string> {
    const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens ?? 2048,
        messages: [
          {
            role: "system",
            content:
              opts.system ?? "You are a legal translation assistant for Ethiopian legal documents.",
          },
          { role: "user", content: prompt },
        ],
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ""
  }
}
