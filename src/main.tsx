import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safeguard against browser/iframe IndexedDB backing store crashes
try {
  if (typeof window !== 'undefined' && window.indexedDB) {
    const originalOpen = window.indexedDB.open.bind(window.indexedDB);
    window.indexedDB.open = function (...args: any[]) {
      try {
        const req = originalOpen.apply(window.indexedDB, args as [string, number?]);
        req.addEventListener('error', (e) => {
          console.warn('IndexedDB request error caught safely:', e);
        });
        return req;
      } catch (err) {
        console.warn('IndexedDB.open synchronous error caught safely:', err);
        const dummyReq: any = {
          addEventListener: () => {},
          removeEventListener: () => {},
          onerror: null,
          onsuccess: null,
          onblocked: null,
          onupgradeneeded: null,
          readyState: 'done',
          result: null,
          error: new DOMException('IndexedDB backing store error fallback', 'UnknownError'),
        };
        setTimeout(() => {
          if (typeof dummyReq.onerror === 'function') {
            dummyReq.onerror(new Event('error'));
          }
        }, 0);
        return dummyReq;
      }
    };
  }
} catch (e) {
  console.warn('Failed to initialize IndexedDB wrapper:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

