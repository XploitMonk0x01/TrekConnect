'use server';

interface YouTubeVideoItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number; };
      medium: { url: string; width: number; height: number; };
      high: { url: string; width: number; height: number; };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeVideoItem[];
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export async function searchYouTubeVideoId(query: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key is not configured. Cannot fetch specific videos.');
    return null;
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: `${query} travel guide`, // Make query more specific
    type: 'video',
    maxResults: '1',
    key: YOUTUBE_API_KEY,
  });

  try {
    const response = await fetch(`${YOUTUBE_API_URL}?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`YouTube API error: ${response.status}`, errorData.error?.message || errorData.message);
      return null;
    }

    const data = await response.json() as YouTubeSearchResponse;

    if (data.items && data.items.length > 0 && data.items[0].id.videoId) {
      return data.items[0].id.videoId;
    } else {
      console.warn(`No YouTube video found for query: "${query}"`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return null;
  }
}
