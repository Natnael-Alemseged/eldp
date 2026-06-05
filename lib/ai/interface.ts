import type { CompletionOptions } from "@/types/ai"

export interface ModelAdapter {
  complete(prompt: string, options?: CompletionOptions): Promise<string>
  readonly provider: "anthropic" | "vllm" | "gemini"
  readonly model: string
}
