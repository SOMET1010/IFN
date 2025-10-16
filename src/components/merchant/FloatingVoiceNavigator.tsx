import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, X, MessageSquare } from 'lucide-react';

// Types pour la reconnaissance vocale
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

const commands: Array<{ keywords: string[]; route: string }> = [
  { keywords: ['inventaire', 'stock'], route: '/merchant/inventory' },
  { keywords: ['vente', 'ventes', 'caisse'], route: '/merchant/sales' },
  { keywords: ['réception', 'livraison'], route: '/merchant/receiving' },
  { keywords: ['commande', 'commandes'], route: '/merchant/orders' },
  { keywords: ['paiement', 'paiements'], route: '/merchant/payments' },
  { keywords: ['besoin', 'approvisionnement', 'coopérative'], route: '/merchant/needs' },
  { keywords: ['cotisation', 'cnps', 'cnam', 'social'], route: '/merchant/social' },
  { keywords: ['tableau', 'dashboard', 'accueil'], route: '/merchant/dashboard' },
  { keywords: ['profil', 'paramètres', 'compte'], route: '/merchant/profile' },
  { keywords: ['crédit', 'crédits'], route: '/merchant/credits' },
  { keywords: ['sourcing', 'fournisseurs'], route: '/merchant/sourcing' },
];

export default function FloatingVoiceNavigator() {
  const nav = useNavigate();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const recogRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const w = window as unknown as WindowWithSpeechRecognition;
    const SRCls = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SRCls) return;
    const r = new SRCls();
    r.lang = 'fr-FR';
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const results = Array.from(e.results);
      const t = results.map((res) => res[0].transcript).join('');
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
        setIsOpen(false);
        break;
      }
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen && listening) {
      stop();
    }
  };

  const supported = !!((window as WindowWithSpeechRecognition).SpeechRecognition ||
    (window as WindowWithSpeechRecognition).webkitSpeechRecognition);
  if (!supported) return null;

  return (
    <>
      {/* Bouton flottant principal */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleOpen}
          size="lg"
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
            listening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {listening ? 
            <MicOff className="h-6 w-6" /> : 
            <Mic className="h-6 w-6" />
          }
        </Button>
      </div>

      {/* Overlay et panneau de navigation vocale */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panneau de navigation vocale */}
          <Card className="fixed bottom-24 right-6 z-50 w-80 max-w-sm shadow-xl border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-foreground">Navigation Vocale</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowHelp(!showHelp)}
                    className="h-8 w-8"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Bouton d'enregistrement principal */}
                <Button 
                  onClick={listening ? stop : start} 
                  size="lg" 
                  className={`w-full h-12 ${
                    listening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {listening ? 
                    <MicOff className="h-5 w-5 mr-2" /> : 
                    <Mic className="h-5 w-5 mr-2" />
                  }
                  {listening ? 'Arrêter' : 'Parler'}
                </Button>
                
                {/* Transcription */}
                {transcript && (
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-medium text-foreground">
                      "{transcript}"
                    </p>
                  </div>
                )}
                
                {/* Aide des commandes */}
                {showHelp && (
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="text-xs font-medium text-primary mb-2">Commandes disponibles:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      {commands.map((cmd, index) => (
                        <div key={index} className="truncate">
                          • {cmd.keywords[0]}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Indicateur d'état */}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {listening ? 'Je vous écoute...' : 'Dites une commande pour naviguer'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}