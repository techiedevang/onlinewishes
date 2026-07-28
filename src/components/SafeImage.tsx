import React, { useState, useEffect } from 'react';

interface SafeImageProps {
  src: string;
  fallbackUrl: string;
  className?: string;
  alt?: string;
  style?: React.CSSProperties;
}

export function SafeImage({ src, fallbackUrl, className, alt = "", style }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && fallbackUrl) {
      setImgSrc(fallbackUrl);
      setHasError(true);
    }
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    // Handle 0-byte or corrupt files that trigger onload but have zero dimensions
    if (img.naturalWidth === 0) {
      handleError();
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
