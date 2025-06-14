import { PLACEHOLDER_IMAGE_URL } from './constants'

// In-memory cache for image URLs
const imageCache = new Map<string, string>()

// Cache for image loading states
const loadingStates = new Map<string, boolean>()

// Function to get a cached image URL
export function getCachedImageUrl(key: string): string | undefined {
  return imageCache.get(key)
}

// Function to set a cached image URL
export function setCachedImageUrl(key: string, url: string): void {
  imageCache.set(key, url)
}

// Function to check if an image is loading
export function isImageLoading(key: string): boolean {
  return loadingStates.get(key) || false
}

// Function to set image loading state
export function setImageLoading(key: string, isLoading: boolean): void {
  loadingStates.set(key, isLoading)
}

// Function to generate a cache key for a destination
export function generateCacheKey(
  destinationId: string,
  destinationName: string
): string {
  return `${destinationId}-${destinationName}`
}

// Function to get a placeholder image with blur
export function getPlaceholderImage(width: number, height: number): string {
  return PLACEHOLDER_IMAGE_URL(width, height)
}

// Function to clear the cache (useful for testing or when cache gets too large)
export function clearImageCache(): void {
  imageCache.clear()
  loadingStates.clear()
}

// Function to get cache size
export function getCacheSize(): number {
  return imageCache.size
}

// Function to preload images
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map((url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(undefined)
      img.onerror = reject
      img.src = url
    })
  })

  await Promise.all(promises)
}
