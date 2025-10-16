import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';

type SR = typeof window & { webkitSpeechRecognition?: unknown; SpeechRecognition?: unknown };

const commands: Array<{ keywords: string[]; route: string }> = [
  { keywords: ['inventaire', 'stock'], route: '/merchant/inventory' },
  { keywords: ['vente', 'ventes', 'caisse'], route: '/merchant/sales' },
  { keywords: ['réception', 'livraison'], route: '/merchant/receiving' },
  { keywords: ['commande', 'commandes'], route: '/merchant/orders' },
  { keywords: ['paiement', 'paiements'], route: '/merchant/payments' },
  { keywords: ['besoin', 'approvisionnement', 'coopérative'], route: '/merchant/needs' },
  { keywords: ['cotisation', 'cnps', 'cnam', 'social'], route: '/merchant/social' },
  { keywords: ['tableau', 'dashboard', 'accueil'], route: '/merchant/dashboard' },
];

export default function VoiceNavigator() {
  const nav = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recogRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const w = window as unknown as SR;
    const SRCls = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SRCls) return;
    const r = new SRCls();
    r.lang = 'fr-FR';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map((res: SpeechRecognitionResult) => res[0].transcript).join('');
      setTranscript(t);
    };
    r.onerror = () => setListening(false);
    recogRef.current = r;
  }, []);

  const start = () => {
    if (!recogRef.current) return;
    setTranscript('');
    setListening(true);
    recogRef.current.start();
  };
  const stop = () => {
    if (!recogRef.current) return;
    setListening(false);
    recogRef.current.stop();
    routeFrom(transcript);
  };

  const routeFrom = (text: string) => {
    const lower = (text || '').toLowerCase();
    for (const c of commands) {
      if (c.keywords.some(k => lower.includes(k))) {
        nav(c.route);
        break;
      }
    }
  };

  const supported = !!((window as unknown as SR).SpeechRecognition || (window as unknown as SR).webkitSpeechRecognition);
  if (!supported) return null;

  return (
    <Card className="mx-auto max-w-2xl border-dashed border-2 bg-muted/30">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">Navigation Vocale</h3>
          <p className="text-sm text-muted-foreground">
            Utilisez votre voix pour naviguer rapidement dans l'application
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={listening ? stop : start} 
            size="lg" 
            className={`w-32 h-32 rounded-full ${listening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
          >
            {listening ? 
              <MicOff className="h-8 w-8" /> : 
              <Mic className="h-8 w-8" />
            }
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Dites: "vente", "stock", "Approvisionnement", "cotisations", etc.
            </p>
            {transcript && (
              <div className="mt-2 p-3 bg-background rounded-lg border">
                <p className="text-sm font-medium text-foreground">
                  Vous avez dit: "{transcript}"
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
