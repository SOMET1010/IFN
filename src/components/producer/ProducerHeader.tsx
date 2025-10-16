import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  ArrowLeft, 
  MessageSquare, 
  Languages, 
  Mic, 
  LogOut, 
  Check, 
  MicOff, 
  Loader2,
  User,
  Settings,
  HelpCircle,
  Leaf
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Interfaces pour la reconnaissance vocale
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  error?: string;
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

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

interface ProducerHeaderProps {
  title: string;
  showNotification?: boolean;
  showCommunication?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

export const ProducerHeader = ({
  title,
  showNotification = true,
  showCommunication = true,
  showBackButton = false,
  backTo
}: ProducerHeaderProps) => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('Français');
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const languages = [
    { code: 'fr', name: 'Français', keywords: ['français', 'france'] },
    { code: 'bf', name: 'Baoulé', keywords: ['baoulé', 'baoule'] },
    { code: 'atie', name: 'Attié', keywords: ['attié', 'attie'] },
    { code: 'guro', name: 'Gouro', keywords: ['gouro'] },
    { code: 'dyu', name: 'Dioula', keywords: ['dioula', 'jula'] },
    { code: 'sen', name: 'Senoufou', keywords: ['senoufou', 'sénoufo'] },
  ];

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition = (window as unknown as WindowWithSpeechRecognition).SpeechRecognition || 
                              (window as unknown as WindowWithSpeechRecognition).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = true;
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result: SpeechRecognitionAlternative) => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
        stopRecording();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript) {
          detectLanguageFromTranscript(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setIsRecording(true);
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsListening(false);
  };

  const detectLanguageFromTranscript = (text: string) => {
    const lowerText = text.toLowerCase();
    
    for (const language of languages) {
      for (const keyword of language.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          setSelectedLanguage(language.name);
          handleLanguageChange(language.name);
          setShowVoiceDialog(false);
          setTranscript('');
          return;
        }
      }
    }
    
    // Si aucune langue n'est détectée, garder le dialogue ouvert
    setTimeout(() => {
      if (showVoiceDialog) {
        setTranscript('');
      }
    }, 2000);
  };

  const handleVoiceLanguageSelect = () => {
    setShowVoiceDialog(true);
    setTranscript('');
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // Ici vous pouvez ajouter la logique pour changer la langue de l'application
    console.log(`Langue changée en: ${language}`);
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-background border-b border-border/60 shadow-sm backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Section gauche */}
          <div className="flex items-center gap-3 sm:gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Retour"
                onClick={handleBack}
                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {title}
                </h1>
                <Badge className="hidden sm:block bg-orange-500 hover:bg-orange-600 text-white text-xs">Producteur</Badge>
              </div>
            </div>
          </div>

          {/* Section droite */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            {showNotification && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Notifications" 
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg relative"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600">
                    3
                  </Badge>
                </Button>
              </div>
            )}

            {/* Communication */}
            {showCommunication && (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Communication" 
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg relative"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600">
                    2
                  </Badge>
                </Button>
              </div>
            )}

            {/* Sélection de langue */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Langue" 
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
                >
                  <Languages className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Langues</div>
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.name)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{language.name}</span>
                      {selectedLanguage === language.name && (
                        <Badge variant="secondary" className="h-5 px-1 text-xs">Actif</Badge>
                      )}
                    </div>
                    {selectedLanguage === language.name && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Assistant vocal */}
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Micro" 
              className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
              onClick={handleVoiceLanguageSelect}
            >
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Paramètres et Déconnexion */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Paramètres" 
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Paramètres</div>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  <span>Aide</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Dialog pour l'enregistrement vocal amélioré */}
      <Dialog open={showVoiceDialog} onOpenChange={setShowVoiceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg border-2 shadow-lg mx-2">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mic className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl">Assistant vocal</DialogTitle>
                <DialogDescription className="text-sm">
                  Dites simplement le nom de votre langue
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 sm:space-y-6 py-4 sm:py-6">
            {/* Bouton d'enregistrement animé */}
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isRecording
                  ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse shadow-lg'
                  : 'bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
              ) : (
                <Mic className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
              )}
            </Button>

            {/* Zone de transcription */}
            <div className="w-full text-center space-y-2 sm:space-y-3">
              <p className={`text-sm font-medium transition-colors duration-200 ${
                isRecording ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {isRecording ? 'Je vous écoute...' : 'Appuyez pour parler'}
              </p>

              {transcript && (
                <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-foreground break-words">
                    "{transcript}"
                  </p>
                </div>
              )}

              {isListening && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Traitement en cours...</span>
                </div>
              )}
            </div>

            {/* Langues disponibles */}
            <div className="bg-muted/30 rounded-lg p-3 sm:p-4 w-full">
              <p className="text-xs font-medium text-muted-foreground mb-2">Langues disponibles:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {languages.map((language) => (
                  <Badge
                    key={language.code}
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    {language.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
