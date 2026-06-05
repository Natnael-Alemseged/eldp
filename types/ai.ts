export interface CompletionOptions {
  maxTokens?: number
  temperature?: number
  system?: string
}

export interface DraftSuggestion {
  suggestion: string
  model: string
  provider: "anthropic" | "vllm"
}
