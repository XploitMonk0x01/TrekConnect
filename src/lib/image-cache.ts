/**
 * A simple image cache that uses localStorage to store images as Base64 strings.
 * WARNING: localStorage has a limited size (usually 5-10MB), so this approach
 * is best suited for a small number of images or thumbnails.
 */

const CACHE_PREFIX = 'img-cache:';
const EXPIRATION_MINUTES = 60; // Cache images for 1 hour

interface CacheEntry {
  timestamp: number;
  dataUrl: string;
}

/**
 * Retrieves a cached image from localStorage if it exists and is not expired.
 * @param url The original URL of the image.
 * @returns The Base64 data URL of the cached image, or null if not found or expired.
 */
export function getCachedImage(url: string): string | null {
  if (typeof window === 'undefined') return null;

  const key = CACHE_PREFIX + url;
  const item = localStorage.getItem(key);

  if (!item) {
    return null;
  }

  try {
    const entry: CacheEntry = JSON.parse(item);
    const isExpired = (Date.now() - entry.timestamp) > EXPIRATION_MINUTES * 60 * 1000;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.dataUrl;
  } catch (error) {
    console.error("Failed to parse image cache entry:", error);
    localStorage.removeItem(key); // Clear corrupted entry
    return null;
  }
}

/**
 * Fetches an image, converts it to a Base64 data URL, and stores it in localStorage.
 * @param url The original URL of the image to cache.
 */
export async function cacheImage(url: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const key = CACHE_PREFIX + url;

  // Avoid re-fetching if already cached
  if (localStorage.getItem(key)) {
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    // Check if blob type is an image
    if (!blob.type.startsWith('image/')) {
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const entry: CacheEntry = {
        timestamp: Date.now(),
        dataUrl,
      };

      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (error) {
        console.error("Failed to save image to localStorage. Cache might be full.", error);
        // Implement a cache cleanup strategy if needed (e.g., LRU)
      }
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(`Failed to cache image ${url}:`, error);
  }
}