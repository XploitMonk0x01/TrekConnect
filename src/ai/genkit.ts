import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/googleai'
import { getGeminiApiKey } from '@/lib/gemini'

export const ai = genkit({
  plugins: [googleAI({ apiKey: getGeminiApiKey() })],
  model: 'googleai/gemini-2.0-flash', // Using gemini-2.0-flash
})
