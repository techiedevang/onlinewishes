import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SafeImageProps {
  src: string;
  fallbackUrl: string;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

export function SafeImage({ src, fallbackUrl, className, alt = "", style, loading = 'lazy' }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    setImgSrc(src || fallbackUrl);
  }, [src, fallbackUrl]);

  const handleError = () => {
    if (!hasError && fallbackUrl) {
      setImgSrc(fallbackUrl);
      setHasError(true);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (img.naturalWidth === 0) {
      handleError();
    }
  };

  return (
    <img
      src={imgSrc || fallbackUrl}
      alt={alt}
      loading={loading}
      className={className}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
