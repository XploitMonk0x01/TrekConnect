import { GoogleGenAI } from '@google/genai'
import { getGeminiApiKey } from '@/lib/gemini'

let cachedClient: GoogleGenAI | null | undefined

export function getGoogleGenAIClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient

  const apiKey = getGeminiApiKey()
  if (!apiKey) {
    cachedClient = null
    return cachedClient
  }

  cachedClient = new GoogleGenAI({ apiKey })
  return cachedClient
}
