'use client'

import { useState, useEffect } from 'react';
import NextImage, { ImageProps } from 'next/image';
import { getCachedImage, cacheImage } from '@/lib/image-cache';

/**
 * An Image component that uses a local cache to speed up loading times.
 * It falls back to the original `src` if the image is not in the cache.
 */
const CachedImage = (props: ImageProps) => {
  const { src, ...rest } = props;
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  useEffect(() => {
    const loadAndCacheImage = async () => {
      if (typeof src === 'string') {
        const cached = getCachedImage(src);
        if (cached) {
          setCachedSrc(cached);
        } else {
          setCachedSrc(src); // Fallback to original src while fetching
          await cacheImage(src);
        }
      }
    };

    loadAndCacheImage();
  }, [src]);

  const finalSrc = cachedSrc || src;

  return <NextImage src={finalSrc} {...rest} />;
};

export default CachedImage;
