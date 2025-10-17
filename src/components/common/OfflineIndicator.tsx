import { useEffect, useState } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setDismissed(false);
      setShowReconnected(true);

      // Masquer le message de reconnexion après 3 secondes
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Afficher le message de reconnexion
  if (online && showReconnected) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] sm:w-auto max-w-md animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white shadow-lg">
          <Wifi className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">
            Connexion rétablie
          </span>
        </div>
      </div>
    );
  }

  // Ne rien afficher si en ligne ou si message fermé
  if (online || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90vw] sm:w-auto max-w-md animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-orange-600 text-white shadow-lg">
        <WifiOff className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Mode hors ligne</p>
          <p className="text-xs mt-1 opacity-90">
            Vous consultez des données en cache. Reconnectez-vous pour synchroniser.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-orange-700 flex-shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </Button>
      </div>
    </div>
  );
}
