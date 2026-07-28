import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 font-bold text-xs py-2 px-4 text-center flex items-center justify-center space-x-2 shadow-md">
      <WifiOff className="w-4 h-4 animate-bounce" />
      <span>You are currently offline. Local memory drafts and studio customizer are saved offline in your browser.</span>
    </div>
  );
}
