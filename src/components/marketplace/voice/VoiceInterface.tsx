import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  Phone,
  Settings,
  HelpCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  ShoppingCart,
  Search,
  MapPin,
  Star
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  confidence: number;
  timestamp: Date;
  response: string;
  action?: Record<string, unknown>;
}

interface VoiceSession {
  id: string;
  startTime: Date;
  duration?: number;
  commands: VoiceCommand[];
  satisfaction?: number;
  resolved: boolean;
}

interface VoiceSettings {
  language: 'fr' | 'en';
  voiceType: 'male' | 'female';
  speechRate: number;
  autoResponse: boolean;
  saveRecordings: boolean;
  wakeWord: string;
}

const VoiceInterface = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceSessions, setVoiceSessions] = useState<VoiceSession[]>([]);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');

  const [settings, setSettings] = useState<VoiceSettings>({
    language: 'fr',
    voiceType: 'female',
    speechRate: 1.0,
    autoResponse: true,
    saveRecordings: true,
    wakeWord: 'agri voix'
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Command examples
  const commandExamples = [
    { command: "Je cherche des tomates", intent: "search_products", category: "Recherche" },
    { command: "Montre-moi les légumes bio", intent: "filter_category", category: "Filtrage" },
    { command: "Ajoute des bananes au panier", intent: "add_to_cart", category: "Panier" },
    { command: "Où est ma commande ?", intent: "track_order", category: "Suivi" },
    { command: "Combien coûte le riz ?", intent: "price_inquiry", category: "Information" },
    { command: "Je veux passer une commande", intent: "start_checkout", category: "Commande" },
    { command: "Montre-moi les promotions", intent: "view_promotions", category: "Marketing" },
    { command: "Parle-moi des producteurs", intent: "producer_info", category: "Information" }
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.language === 'fr' ? 'fr-FR' : 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result) => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthesisRef.current = window.speechSynthesis;

    // Load mock voice sessions
    loadMockSessions();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [settings.language, loadMockSessions]);

  const loadMockSessions = useCallback(() => {
    const mockSessions: VoiceSession[] = [
      {
        id: '1',
        startTime: new Date(Date.now() - 3600000),
        duration: 245,
        commands: [
          {
            id: '1-1',
            command: "Je voudrais des pommes de terre",
            intent: "search_products",
            confidence: 0.92,
            timestamp: new Date(Date.now() - 3590000),
            response: "J'ai trouvé 15 producteurs de pommes de terre. Les prix varient entre 500 et 1500 FCFA le kilo."
          },
          {
            id: '1-2',
            command: "Montre-moi celles de moins de 1000 FCFA",
            intent: "filter_price",
            confidence: 0.88,
            timestamp: new Date(Date.now() - 3580000),
            response: "Voici 8 offres de pommes de terre à moins de 1000 FCFA. Celles de Kouadio Amani sont à 800 FCFA."
          }
        ],
        satisfaction: 5,
        resolved: true
      },
      {
        id: '2',
        startTime: new Date(Date.now() - 7200000),
        duration: 180,
        commands: [
          {
            id: '2-1',
            command: "Où est ma commande ?",
            intent: "track_order",
            confidence: 0.95,
            timestamp: new Date(Date.now() - 7190000),
            response: "Votre commande #1234 est en cours de livraison. Le livrateur est à 2km de votre adresse."
          }
        ],
        satisfaction: 4,
        resolved: true
      }
    ];
    setVoiceSessions(mockSessions);
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');

      // Start new session
      const newSession: VoiceSession = {
        id: Date.now().toString(),
        startTime: new Date(),
        commands: [],
        resolved: false
      };
      setCurrentSession(newSession);

      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();

      if (transcript.trim()) {
        processVoiceCommand(transcript);
      }
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Analyze command and generate response
    const analysis = analyzeCommand(command);
    const voiceCommand: VoiceCommand = {
      id: Date.now().toString(),
      command,
      intent: analysis.intent,
      confidence: analysis.confidence,
      timestamp: new Date(),
      response: analysis.response,
      action: analysis.action
    };

    setCurrentCommand(voiceCommand);
    setResponse(analysis.response);

    // Update current session
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        commands: [...currentSession.commands, voiceCommand]
      };
      setCurrentSession(updatedSession);
    }

    // Speak response if not muted
    if (!isMuted && settings.autoResponse) {
      speakResponse(analysis.response);
    }

    setIsProcessing(false);
  };

  const analyzeCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Search for products
    if (lowerCommand.includes('cherche') || lowerCommand.includes('montre') || lowerCommand.includes('veux')) {
      if (lowerCommand.includes('légume') || lowerCommand.includes('fruit') || lowerCommand.includes('tomate') || lowerCommand.includes('banane')) {
        return {
          intent: 'search_products',
          confidence: 0.90,
          response: 'Je recherche des produits frais pour vous. J\'ai trouvé plusieurs producteurs avec des légumes et fruits de qualité.',
          action: { type: 'search', query: command }
        };
      }
    }

    // Track order
    if (lowerCommand.includes('commande') || lowerCommand.includes('livraison') || lowerCommand.includes('où')) {
      return {
        intent: 'track_order',
        confidence: 0.95,
        response: 'Je vérifie le statut de votre commande. Votre dernière commande est en cours de livraison et devrait arriver dans environ 30 minutes.',
        action: { type: 'track_order' }
      };
    }

    // Add to cart
    if (lowerCommand.includes('ajoute') || lowerCommand.includes('panier') || lowerCommand.includes('achète')) {
      return {
        intent: 'add_to_cart',
        confidence: 0.88,
        response: 'J\'ai ajouté les produits à votre panier. Voulez-vous procéder au paiement maintenant ?',
        action: { type: 'add_to_cart' }
      };
    }

    // Price inquiry
    if (lowerCommand.includes('prix') || lowerCommand.includes('coûte') || lowerCommand.includes('combien')) {
      return {
        intent: 'price_inquiry',
        confidence: 0.92,
        response: 'Les prix varient selon les producteurs. En moyenne, les légumes frais coûtent entre 500 et 2000 FCFA le kilo.',
        action: { type: 'price_info' }
      };
    }

    // Default response
    return {
      intent: 'general_inquiry',
      confidence: 0.75,
      response: 'Je suis là pour vous aider avec vos achats de produits agricoles. Vous pouvez me demander de chercher des produits, suivre votre commande, ou obtenir des informations sur les prix.',
      action: { type: 'general_help' }
    };
  };

  const speakResponse = (text: string) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = settings.speechRate;
      synthesisRef.current.speak(utterance);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      processVoiceCommand(textInput);
      setTextInput('');
    }
  };

  const handleSessionFeedback = (sessionId: string, rating: number) => {
    setVoiceSessions(sessions =>
      sessions.map(session =>
        session.id === sessionId
          ? { ...session, satisfaction: rating }
          : session
      )
    );

    if (currentSession && currentSession.id === sessionId) {
      setCurrentSession({ ...currentSession, satisfaction: rating });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getIntentColor = (intent: string) => {
    const colors: { [key: string]: string } = {
      search_products: 'bg-blue-100 text-blue-800',
      filter_category: 'bg-purple-100 text-purple-800',
      add_to_cart: 'bg-green-100 text-green-800',
      track_order: 'bg-orange-100 text-orange-800',
      price_inquiry: 'bg-yellow-100 text-yellow-800',
      start_checkout: 'bg-red-100 text-red-800',
      view_promotions: 'bg-pink-100 text-pink-800',
      producer_info: 'bg-indigo-100 text-indigo-800',
      general_inquiry: 'bg-gray-100 text-gray-800'
    };
    return colors[intent] || colors.general_inquiry;
  };

  const getIntentLabel = (intent: string) => {
    const labels: { [key: string]: string } = {
      search_products: 'Recherche',
      filter_category: 'Filtrage',
      add_to_cart: 'Panier',
      track_order: 'Suivi',
      price_inquiry: 'Prix',
      start_checkout: 'Paiement',
      view_promotions: 'Promotions',
      producer_info: 'Producteurs',
      general_inquiry: 'Général'
    };
    return labels[intent] || 'Inconnu';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interface Vocale</h2>
          <p className="text-gray-600">Commandez et interagissez avec votre voix</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowHelp(!showHelp)}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Aide
          </Button>
          <Button variant="outline" onClick={() => setTextMode(!textMode)}>
            {textMode ? <Mic className="h-4 w-4 mr-2" /> : <MessageCircle className="h-4 w-4 mr-2" />}
            {textMode ? 'Mode vocal' : 'Mode texte'}
          </Button>
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Commandes vocales disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {commandExamples.map((example, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm">"{example.command}"</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getIntentColor(example.intent)}>
                          {example.category}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {getIntentLabel(example.intent)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    💡 Conseil: Dites "{settings.wakeWord}" pour activer l'écoute
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assistant Vocal</span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={isMuted ? "destructive" : "outline"}
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice/Text Input */}
              {textMode ? (
                <div className="flex space-x-2">
                  <Input
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Écrivez votre commande ici..."
                    onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  />
                  <Button onClick={handleTextSubmit} disabled={!textInput.trim() || isProcessing}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className={`w-32 h-32 rounded-full ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-blue-500 hover:bg-blue-600'
                      }`}
                      onClick={isListening ? stopListening : startListening}
                      disabled={isProcessing}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {isListening ? (
                          <MicOff className="h-8 w-8" />
                        ) : (
                          <Mic className="h-8 w-8" />
                        )}
                        <span className="text-sm">
                          {isListening ? 'Arrêter' : 'Parler'}
                        </span>
                      </div>
                    </Button>
                  </motion.div>

                  {isListening && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">J'écoute...</p>
                    </motion.div>
                  )}

                  {transcript && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Vous avez dit:</p>
                      <p className="font-medium">"{transcript}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Response Area */}
              {isProcessing && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-gray-600">Je traite votre demande...</span>
                </div>
              )}

              {response && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 mb-1">Assistant</p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm">{response}</p>
                      </div>
                      {currentCommand && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getIntentColor(currentCommand.intent)}>
                            {getIntentLabel(currentCommand.intent)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Confiance: {Math.round(currentCommand.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {currentSession && (
                    <div className="flex justify-center space-x-4 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSessionFeedback(currentSession.id, 1)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Pas utile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSessionFeedback(currentSession.id, 5)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Très utile
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres vocaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="language">Langue</Label>
                  <select
                    id="language"
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value as 'fr' | 'en'})}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="voiceType">Type de voix</Label>
                  <select
                    id="voiceType"
                    value={settings.voiceType}
                    onChange={(e) => setSettings({...settings, voiceType: e.target.value as 'male' | 'female'})}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="female">Féminin</option>
                    <option value="male">Masculin</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoResponse">Réponse automatique</Label>
                  <Switch
                    id="autoResponse"
                    checked={settings.autoResponse}
                    onCheckedChange={(checked) => setSettings({...settings, autoResponse: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="saveRecordings">Enregistrer les conversations</Label>
                  <Switch
                    id="saveRecordings"
                    checked={settings.saveRecordings}
                    onCheckedChange={(checked) => setSettings({...settings, saveRecordings: checked})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="wakeWord">Mot d'activation</Label>
                <Input
                  id="wakeWord"
                  value={settings.wakeWord}
                  onChange={(e) => setSettings({...settings, wakeWord: e.target.value})}
                  placeholder="Mot pour activer l'assistant"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {voiceSessions.slice(0, 5).map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {session.startTime.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {session.satisfaction && (
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < session.satisfaction!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      {session.commands.slice(0, 2).map((command) => (
                        <div key={command.id} className="flex items-center space-x-2">
                          <Badge className={getIntentColor(command.intent)} variant="secondary">
                            {getIntentLabel(command.intent)}
                          </Badge>
                          <span className="text-xs text-gray-600 truncate">
                            {command.command}
                          </span>
                        </div>
                      ))}
                      {session.commands.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{session.commands.length - 2} autres commandes
                        </p>
                      )}
                    </div>

                    {session.duration && (
                      <p className="text-xs text-gray-500 mt-2">
                        Durée: {formatDuration(session.duration)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions aujourd'hui</span>
                  <span className="font-bold">{voiceSessions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Commandes totales</span>
                  <span className="font-bold">
                    {voiceSessions.reduce((sum, session) => sum + session.commands.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux de satisfaction</span>
                  <span className="font-bold">
                    {voiceSessions.filter(s => s.satisfaction).length > 0
                      ? Math.round(
                          voiceSessions
                            .filter(s => s.satisfaction)
                            .reduce((sum, session) => sum + (session.satisfaction || 0), 0) /
                          voiceSessions.filter(s => s.satisfaction).length
                        )
                      : 0
                    }/5
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions résolues</span>
                  <span className="font-bold text-green-600">
                    {voiceSessions.filter(s => s.resolved).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;