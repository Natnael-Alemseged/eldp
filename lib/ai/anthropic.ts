import type { CompletionOptions } from "@/types/ai"
import Anthropic from "@anthropic-ai/sdk"
import type { ModelAdapter } from "./interface"

export class AnthropicAdapter implements ModelAdapter {
  readonly provider = "anthropic" as const
  readonly model = "claude-sonnet-4-6"
  private client = new Anthropic()

  async complete(prompt: string, opts: CompletionOptions = {}): Promise<string> {
    const msg = await this.client.messages.create({
      model: this.model,
      max_tokens: opts.maxTokens ?? 2048,
      system:
        opts.system ??
        "You are a legal translation assistant for Ethiopian legal documents. Produce accurate, formal translations only.",
      messages: [{ role: "user", content: prompt }],
    })
    const block = msg.content[0]
    return block.type === "text" ? block.text : ""
  }
}
