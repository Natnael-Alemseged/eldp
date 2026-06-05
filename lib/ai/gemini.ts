import type { CompletionOptions } from "@/types/ai"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { ModelAdapter } from "./interface"

export class GeminiAdapter implements ModelAdapter {
  readonly provider = "gemini" as const
  readonly model: string
  private client: GoogleGenerativeAI

  constructor(apiKey: string, model = "gemini-2.0-flash") {
    this.client = new GoogleGenerativeAI(apiKey)
    this.model = model
  }

  async complete(prompt: string, opts: CompletionOptions = {}): Promise<string> {
    const genModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: opts.system,
    })
    const result = await genModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: opts.maxTokens ?? 2048,
        temperature: opts.temperature ?? 0.3,
      },
    })
    return result.response.text()
  }
}
