/**
 * Groq API Client for fast LLM inference
 * Uses OpenAI-compatible API
 */

import Groq from 'groq-sdk'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set')
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/**
 * Available Groq models
 * https://console.groq.com/docs/models
 */
export const GROQ_MODELS = {
  // Fast and versatile models
  LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
  LLAMA_3_1_70B: 'llama-3.1-70b-versatile',
  LLAMA_3_1_8B: 'llama-3.1-8b-instant',

  // Mixtral models
  MIXTRAL_8X7B: 'mixtral-8x7b-32768',

  // Gemma models
  GEMMA_7B: 'gemma-7b-it',
  GEMMA_2_9B: 'gemma2-9b-it',
} as const

/**
 * Default model for route planning - fast and high quality
 */
export const DEFAULT_ROUTE_PLANNING_MODEL = GROQ_MODELS.LLAMA_3_3_70B
