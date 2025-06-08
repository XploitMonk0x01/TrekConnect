
'use server'; // Can be used by server components or client components making server calls

import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

interface PexelsImage {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsImage[];
  total_results: number;
  next_page?: string;
}

export async function searchPexelsImage(query: string, width: number = 600, height: number = 400): Promise<string> {
  if (!PEXELS_API_KEY) {
    console.warn('Pexels API key is not configured. Falling back to placeholder.');
    return PLACEHOLDER_IMAGE_URL(width, height);
  }

  const orientation = width > height ? 'landscape' : 'portrait';

  try {
    const response = await fetch(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Pexels API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('Error body:', errorBody);
      return PLACEHOLDER_IMAGE_URL(width, height);
    }

    const data = await response.json() as PexelsResponse;

    if (data.photos && data.photos.length > 0) {
      // Prefer medium or large, fallback to original
      const photo = data.photos[0];
      if (width <= 300 && height <= 300 && photo.src.small) return photo.src.small;
      if (width <= 800 && height <= 800 && photo.src.medium) return photo.src.medium;
      if (photo.src.large) return photo.src.large;
      return photo.src.original;
    } else {
      console.warn(`No Pexels image found for query: "${query}". Falling back to placeholder.`);
      return PLACEHOLDER_IMAGE_URL(width, height);
    }
  } catch (error) {
    console.error(`Error fetching image from Pexels for query "${query}":`, error);
    return PLACEHOLDER_IMAGE_URL(width, height);
  }
}
