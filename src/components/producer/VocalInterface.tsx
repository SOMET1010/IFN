import { useState, useRef, useEffect } from 'react';

// Déclarations des types pour l'API Web Speech
declare global {
  interface Window {
    SpeechRecognition: unknown;
    webkitSpeechRecognition: unknown;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  Phone,
  Headphones
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  category: 'vente' | 'production' | 'compte' | 'marché';
  confidence: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface LanguageSetting {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  supported: boolean;
}

interface VoiceAssistantConfig {
  language: string;
  voiceFeedback: boolean;
  autoDetectLanguage: boolean;
  activationPhrase: string;
  responseSpeed: 'slow' | 'normal' | 'fast';
  noiseReduction: boolean;
}

const supportedLanguages: LanguageSetting[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', supported: true },
  { code: 'bf', name: 'Baoulé', nativeName: 'Wawle', flag: '🇨🇮', supported: true },
  { code: 'dy', name: 'Dioula', nativeName: 'Julakan', flag: '🇨🇮', supported: true },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', supported: false }
];

const mockVoiceCommands: VoiceCommand[] = [
  {
    id: '1',
    command: 'Enregistrer récolte cacao 500kg qualité premium',
    action: 'Créer une nouvelle récolte de cacao',
    category: 'production',
    confidence: 0.95,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    command: 'Prix du cacao aujourd\'hui',
    action: 'Afficher les prix actuels du cacao',
    category: 'marché',
    confidence: 0.88,
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed'
  },
  {
    id: '3',
    command: 'Créer offre cacao 1200 FCFA',
    action: 'Publier une offre de cacao à 1200 FCFA/kg',
    category: 'vente',
    confidence: 0.92,
    timestamp: '2024-01-15T11:00:00Z',
    status: 'pending'
  }
];

const voiceCommandCategories = {
  vente: { name: 'Ventes', color: 'bg-green-100 text-green-800 border-green-200' },
  production: { name: 'Production', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  compte: { name: 'Compte', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  marché: { name: 'Marché', color: 'bg-primary/10 text-primary border-primary/20' }
};

export function VocalInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>(mockVoiceCommands);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [recognitionTime, setRecognitionTime] = useState(0);
  const [activationPhrase, setActivationPhrase] = useState('AgriTrack');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryDelay, setRetryDelay] = useState(1000);
  const maxRetries = 3;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Network connectivity event listeners
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
      setRetryCount(0);
      if (voiceFeedback) {
        speak('Connexion réseau rétablie');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError('Vous êtes hors ligne. Veuillez vérifier votre connexion internet.');
      if (isListening) {
        stopListening();
      }
      if (voiceFeedback) {
        speak('Connexion réseau perdue');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (typeof SpeechRecognitionConstructor === 'function') {
        recognitionRef.current = new (SpeechRecognitionConstructor as unknown as { new(): SpeechRecognition })();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage === 'bf' ? 'fr-CI' : selectedLanguage;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setCurrentTranscript(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          handleRecognitionError(event);
        };

        recognitionRef.current.onend = () => {
          if (isListening && !networkError) {
            // Restart recognition if we're still in listening mode and no network error
            setTimeout(() => {
              if (recognitionRef.current && isListening) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.error('Failed to restart recognition:', error);
                  handleRecognitionError({ error: 'network' } as SpeechRecognitionEvent);
                }
              }
            }, 100);
          }
        };
      }
    }

    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis;

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopListening();
    };
  }, [selectedLanguage, isListening, voiceFeedback]);

  const startListening = () => {
    if (!isVoiceEnabled) {
      speak("Veuillez activer l'interface vocale dans les paramètres");
      return;
    }

    // Check network connectivity before starting
    if (!isOnline) {
      setNetworkError('Impossible de démarrer: vous êtes hors ligne. Veuillez vérifier votre connexion internet.');
      if (voiceFeedback) {
        speak('Impossible de démarrer: vous êtes hors ligne.');
      }
      return;
    }

    // Reset retry state when starting fresh
    setRetryCount(0);
    setRetryDelay(1000);
    setNetworkError(null);

    if (recognitionRef.current) {
      setIsListening(true);
      setRecognitionTime(0);
      recognitionRef.current.lang = selectedLanguage === 'bf' ? 'fr-CI' : selectedLanguage;
      
      try {
        recognitionRef.current.start();
        
        timerRef.current = setInterval(() => {
          setRecognitionTime(prev => prev + 1);
        }, 1000);

        if (voiceFeedback) {
          speak('Je vous écoute');
        }
      } catch (error) {
        console.error('Failed to start recognition:', error);
        handleRecognitionError({ error: 'network' } as SpeechRecognitionEvent);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (currentTranscript.trim()) {
      processVoiceCommand(currentTranscript);
    }
  };

  const speak = (text: string) => {
    if (!voiceFeedback || !synthesisRef.current) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'bf' ? 'fr-CI' : selectedLanguage;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    synthesisRef.current.speak(utterance);
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    setCurrentTranscript('');

    try {
      // Simulate command processing
      const categories = Object.keys(voiceCommandCategories);
      const detectedCategory = categories.find(cat =>
        command.toLowerCase().includes(cat) ||
        (cat === 'vente' && command.toLowerCase().includes('offre')) ||
        (cat === 'production' && command.toLowerCase().includes('récolte'))
      ) || 'compte';

      const newCommand: VoiceCommand = {
        id: Date.now().toString(),
        command: command,
        action: generateActionFromCommand(command),
        category: detectedCategory as 'vente' | 'production' | 'compte' | 'marché',
        confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      setVoiceCommands(prev => [newCommand, ...prev]);

      // Simulate processing delay
      setTimeout(() => {
        setVoiceCommands(prev => prev.map(cmd =>
          cmd.id === newCommand.id
            ? { ...cmd, status: 'completed' }
            : cmd
        ));

        if (voiceFeedback) {
          speak(`Commande exécutée: ${newCommand.action}`);
        }

        setIsProcessing(false);
      }, 2000);

    } catch (error) {
      console.error('Error processing voice command:', error);
      setIsProcessing(false);

      if (voiceFeedback) {
        speak('Désolé, je n\'ai pas compris la commande');
      }
    }
  };

  const generateActionFromCommand = (command: string): string => {
    const lowerCommand = command.toLowerCase();

    if (lowerCommand.includes('récolte')) {
      return 'Enregistrer une nouvelle récolte';
    } else if (lowerCommand.includes('offre') || lowerCommand.includes('vente')) {
      return 'Créer ou mettre à jour une offre';
    } else if (lowerCommand.includes('prix')) {
      return 'Consulter les prix du marché';
    } else if (lowerCommand.includes('statistiques') || lowerCommand.includes('revenu')) {
      return 'Afficher les statistiques';
    } else if (lowerCommand.includes('compte') || lowerCommand.includes('profil')) {
      return 'Gérer le compte';
    } else {
      return 'Action personnalisée';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = (category: string) => {
    return voiceCommandCategories[category as keyof typeof voiceCommandCategories] ||
           { name: 'Autre', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const getStatusIcon = (status: VoiceCommand['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: VoiceCommand['status']) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'failed':
        return 'Échoué';
      default:
        return 'En cours';
    }
  };

  const handleRecognitionError = (event: SpeechRecognitionEvent) => {
    console.error('Speech recognition error:', event.error);
    
    const errorType = event.error;
    let errorMessage = '';
    
    switch (errorType) {
      case 'network':
        errorMessage = 'Erreur réseau: Veuillez vérifier votre connexion internet.';
        break;
      case 'no-speech':
        errorMessage = 'Aucune parole détectée. Veuillez réessayer.';
        break;
      case 'audio-capture':
        errorMessage = 'Problème avec le microphone. Veuillez vérifier vos paramètres audio.';
        break;
      case 'not-allowed':
        errorMessage = 'Accès au microphone refusé. Veuillez autoriser l\'accès.';
        break;
      case 'service-not-allowed':
        errorMessage = 'Service de reconnaissance vocale non disponible.';
        break;
      default:
        errorMessage = 'Erreur de reconnaissance vocale inconnue.';
    }
    
    setNetworkError(errorMessage);
    
    // Implement retry logic for network errors
    if (errorType === 'network' && retryCount < maxRetries) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      if (voiceFeedback) {
        speak(`Erreur réseau. Tentative ${newRetryCount} sur ${maxRetries}...`);
      }
      
      // Exponential backoff
      const newDelay = retryDelay * 2;
      setRetryDelay(newDelay);
      
      setTimeout(() => {
        if (isListening && recognitionRef.current) {
          try {
            setNetworkError(null);
            recognitionRef.current.start();
          } catch (error) {
            console.error('Failed to restart recognition after retry:', error);
          }
        }
      }, newDelay);
    } else {
      stopListening();
      if (voiceFeedback) {
        speak(errorMessage);
      }
    }
  };

  const toggleVoiceInterface = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled) {
      speak('Interface vocale activée');
    } else {
      stopListening();
      speak('Interface vocale désactivée');
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Contrôle Vocal
          </CardTitle>
          <CardDescription>
            Parlez pour interagir avec le système ({supportedLanguages.find(l => l.code === selectedLanguage)?.flag} {supportedLanguages.find(l => l.code === selectedLanguage)?.nativeName})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Control Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className={`h-20 w-20 rounded-full ${isListening ? 'animate-pulse' : ''}`}
                onClick={isListening ? stopListening : startListening}
                disabled={!isVoiceEnabled || isProcessing}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>

            {/* Status Text */}
            {isListening && (
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Je vous écoute...</p>
                <p className="text-sm text-muted-foreground">
                  Temps d'écoute: {formatTime(recognitionTime)}
                </p>
              </div>
            )}

            {/* Current Transcript */}
            {currentTranscript && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm">
                    <span className="font-medium">Transcription:</span> {currentTranscript}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Network Error Indicator */}
            {networkError && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Erreur réseau</p>
                      <p className="text-xs text-red-600">{networkError}</p>
                      {retryCount > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          Tentative {retryCount} sur {maxRetries}...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connectivity Status */}
            <Card className={`bg-gray-50 border-gray-200 ${!isOnline ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <p className="text-sm">
                    {isOnline ? 'Connecté' : 'Hors ligne'} - {isOnline ? 'Interface vocale disponible' : 'Veuillez vérifier votre connexion'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Processing Indicator */}
            {isProcessing && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-sm">Traitement de la commande...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Commands */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => processVoiceCommand('Enregistrer nouvelle récolte')}
                disabled={!isVoiceEnabled}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">Enregistrer récolte</p>
                  <p className="text-xs text-muted-foreground">Dites: "Enregistrer récolte [produit] [quantité]"</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => processVoiceCommand('Créer offre vente')}
                disabled={!isVoiceEnabled}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">Créer offre</p>
                  <p className="text-xs text-muted-foreground">Dites: "Créer offre [produit] [prix]"</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => processVoiceCommand('Consulter prix marché')}
                disabled={!isVoiceEnabled}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">Prix du marché</p>
                  <p className="text-xs text-muted-foreground">Dites: "Prix du [produit] aujourd'hui"</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => processVoiceCommand('Afficher statistiques')}
                disabled={!isVoiceEnabled}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">Statistiques</p>
                  <p className="text-xs text-muted-foreground">Dites: "Afficher mes statistiques"</p>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add Input component for the settings
function Input({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  );
}
