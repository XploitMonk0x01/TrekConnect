export function getGeminiApiKey(): string | undefined {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    // Common alternatives used across SDKs/tooling
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ]

  for (const value of candidates) {
    const key = value?.trim()
    if (key) return key
  }

  return undefined
}
