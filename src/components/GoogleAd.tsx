import React, { useEffect, useRef } from 'react';

interface GoogleAdProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  layoutKey?: string;
  className?: string;
}

export function GoogleAd({ slot, format = 'auto', layoutKey, className = '' }: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    // Slight delay to ensure layout has width
    const timeout = setTimeout(() => {
      try {
        if (adRef.current && adRef.current.getAttribute('data-adsbygoogle-status') !== 'done') {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err: any) {
        // Ignore "already have ads" error which is common in React Strict Mode
        if (err.message && err.message.includes("already have ads")) {
          return;
        }
        console.error('Google AdSense error:', err);
      }
    }, 200);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`google-ad-container my-4 text-center overflow-hidden flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px', minHeight: '50px' }}
        data-ad-client="ca-pub-3363935190538446"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      ></ins>
    </div>
  );
}
