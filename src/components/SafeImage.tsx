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
    let isMounted = true;
    setHasError(false);

    if (src && src.startsWith('/api/images/')) {
      const docId = src.split('/').pop();
      if (docId) {
        const fetchFromFirestore = async () => {
          try {
            const docRef = doc(db, 'uploaded_images', docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && isMounted) {
              const data = docSnap.data();
              if (data.data) {
                setImgSrc(data.data);
                return;
              }
            }
          } catch (e) {
            console.error('Failed to load image from Firestore:', e);
          }
          // Fallback to API if client fetch fails
          if (isMounted) setImgSrc(src);
        };
        fetchFromFirestore();
      } else {
        setImgSrc(src);
      }
    } else {
      setImgSrc(src);
    }

    return () => { isMounted = false; };
  }, [src]);

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
