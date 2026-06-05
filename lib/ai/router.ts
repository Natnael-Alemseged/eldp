import type { ModelAdapter } from "./interface"

let _adapter: ModelAdapter | null = null

export function getModelAdapter(): ModelAdapter {
  if (_adapter) return _adapter

  const provider = process.env.AI_PROVIDER ?? "gemini"

  if (provider === "gemini") {
    const { GeminiAdapter } = require("./gemini")
    _adapter = new GeminiAdapter(
      process.env.GEMINI_API_KEY ?? "",
      process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
    )
  } else if (provider === "vllm" && process.env.VLLM_BASE_URL) {
    const { VLLMAdapter } = require("./vllm")
    _adapter = new VLLMAdapter(process.env.VLLM_BASE_URL)
  } else {
    const { AnthropicAdapter } = require("./anthropic")
    _adapter = new AnthropicAdapter()
  }

  if (!_adapter) throw new Error("AI adapter failed to initialize")
  return _adapter
}
