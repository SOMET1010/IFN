import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] sm:w-auto max-w-md">
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-md bg-orange-600 text-white text-xs sm:text-sm shadow-lg text-center">
        Mode hors ligne activé — certaines données peuvent être en cache
      </div>
    </div>
  );
}

