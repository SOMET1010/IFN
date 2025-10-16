import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  MessageSquare,
  Languages,
  Mic,
  MicOff,
  LogOut,
  Check,
  User,
  Settings,
  HelpCircle,
  Leaf,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';

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

interface ProducerMobileHeaderProps {
  title: string;
  showNotification?: boolean;
  showCommunication?: boolean;
  showBackButton?: boolean;
  backTo?: string;
}

export const ProducerMobileHeader = ({
  title,
  showNotification = true,
  showCommunication = true,
  showBackButton = false,
  backTo
}: ProducerMobileHeaderProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('Français');
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceDialog, setShowVoiceDialog] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
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
    console.log(`Langue changée en: ${language}`);
  };

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-white to-background border-b border-border/60 shadow-sm backdrop-blur-sm px-3 py-2">
      <div className="flex items-center justify-between">
        {/* Section gauche - Back button + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Retour"
              onClick={handleBack}
              className="h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent truncate">
                {title}
              </h1>
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">Producteur</Badge>
            </div>
          </div>
        </div>

        {/* Section droite - Notifications + Actions menu */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          {showNotification && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600">
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
                className="h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
              >
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-orange-500 hover:bg-orange-600">
                  2
                </Badge>
              </Button>
            </div>
          )}

          {/* Actions Menu */}
          <DropdownMenu open={showActionsMenu} onOpenChange={setShowActionsMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Plus d'options"
                className="h-10 w-10 hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Assistant vocal */}
              <DropdownMenuItem
                onClick={handleVoiceLanguageSelect}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>Assistant vocal</span>
              </DropdownMenuItem>

              {/* Sélection de langue */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Languages className="h-4 w-4" />
                    <span>Langue: {selectedLanguage}</span>
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
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

              {/* Paramètres */}
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

      {/* Dialog pour l'enregistrement vocal mobile */}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
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