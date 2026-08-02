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

  const handleError = async () => {
    if (!hasError) {
      // If src is an /api/images/ URL, attempt client-side direct Firestore fetch before falling back!
      if (src && (src.includes('/api/images/') || src.startsWith('sb_') || src.startsWith('img_'))) {
        const parts = src.split('/api/images/');
        const imageId = parts.length > 1 ? parts[1].split('?')[0] : src;
        if (imageId) {
          try {
            const docRef = doc(db, 'uploaded_images', imageId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data()?.data) {
              setImgSrc(docSnap.data().data);
              return; // Recovered real photo!
            }
          } catch (err) {
            console.warn("Client side image recovery failed for id:", imageId, err);
          }
        }
      }

      if (fallbackUrl) {
        setImgSrc(fallbackUrl);
        setHasError(true);
      }
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
