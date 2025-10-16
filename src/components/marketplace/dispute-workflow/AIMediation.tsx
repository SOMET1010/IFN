import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Bot,
  MessageSquare,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Scale,
  User,
  ThumbsUp,
  ThumbsDown,
  Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'mediator';
  content: string;
  timestamp: Date;
  type: 'text' | 'suggestion' | 'question' | 'agreement';
  suggestions?: string[];
}

interface DisputeData {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  urgency: string;
  resolutionRequested: string;
  orderId: string;
  productName: string;
  sellerName: string;
  buyerName: string;
  amount: number;
}

interface AIMediationProps {
  disputeData: DisputeData;
  onMediationComplete: (resolution: Record<string, unknown>) => void;
  onEscalateToHuman: () => void;
  onCancel: () => void;
}

const AIMediation = ({ disputeData, onMediationComplete, onEscalateToHuman, onCancel }: AIMediationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mediationStage, setMediationStage] = useState<'analysis' | 'discussion' | 'proposals' | 'agreement' | 'escalated'>('analysis');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [userRating, setUserRating] = useState<'positive' | 'negative' | null>(null);
  const [satisfactionScore, setSatisfactionScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start AI analysis
    startAIAnalysis();
  }, [startAIAnalysis]);

  const startAIAnalysis = useCallback(async () => {
    const initialMessage: Message = {
      id: '1',
      sender: 'ai',
      content: `Bonjour ! Je suis l'assistant de médiation d'AgriMarket. J'analyse votre litige concernant "${disputeData.productName}".`,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([initialMessage]);

    // Simulate AI analysis
    setTimeout(() => {
      const analysisMessage: Message = {
        id: '2',
        sender: 'ai',
        content: `J'ai analysé votre situation. Il s'agit d'un problème de "${disputeData.subcategory}" dans la catégorie "${disputeData.category}". La résolution demandée est "${disputeData.resolutionRequested}".`,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, analysisMessage]);

      // Generate AI suggestions
      const suggestions = generateAISuggestions();
      setAiSuggestions(suggestions);

      setTimeout(() => {
        const suggestionMessage: Message = {
          id: '3',
          sender: 'ai',
          content: 'Voici mes suggestions pour résoudre ce litige:',
          timestamp: new Date(),
          type: 'suggestion',
          suggestions
        };

        setMessages(prev => [...prev, suggestionMessage]);
        setMediationStage('discussion');
      }, 2000);
    }, 2000);
  }, [disputeData, generateAISuggestions]);

  const generateAISuggestions = useCallback(() => {
    const baseAmount = disputeData.amount;
    const suggestions = [];

    switch (disputeData.category) {
      case 'product_quality':
        if (disputeData.subcategory === 'Produit abîmé') {
          suggestions.push(`Remboursement partiel de ${formatCurrency(Math.round(baseAmount * 0.5))} (50%)`);
          suggestions.push(`Échange du produit avec garantie de qualité`);
          suggestions.push(`Bon d'achat de ${Math.round(baseAmount * 0.75)} FCFA pour prochaine commande`);
        } else if (disputeData.subcategory === 'Ne correspond pas à la description') {
          suggestions.push(`Remboursement complet de ${baseAmount} FCFA`);
          suggestions.push(`Retour du produit et remboursement des frais de transport`);
        }
        break;

      case 'delivery':
        if (disputeData.subcategory === 'Retard de livraison') {
        suggestions.push(`Réduction de ${formatCurrency(Math.round(baseAmount * 0.2))} (20%) pour le retard`);
        suggestions.push(`Frais de livraison remboursés (${formatCurrency(Math.round(baseAmount * 0.1))})`);
        } else if (disputeData.subcategory === 'Produit cassé pendant transport') {
          suggestions.push(`Remplacement immédiat du produit`);
          suggestions.push(`Remboursement complet + indemnisation de ${formatCurrency(Math.round(baseAmount * 0.1))}`);
        }
        break;

      case 'payment':
        suggestions.push(`Vérification du paiement et annulation si double paiement`);
        suggestions.push(`Remboursement immédiat des frais supplémentaires`);
        break;

      default:
        suggestions.push(`Médiation directe avec le vendeur`);
        suggestions.push(`Remboursement partiel de ${formatCurrency(Math.round(baseAmount * 0.3))}`);
    }

    return suggestions;
  }, [disputeData, formatCurrency]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(newMessage);
      setMessages(prev => [...prev, aiResponse]);

      // Update satisfaction based on conversation
      setSatisfactionScore(prev => Math.min(prev + 10, 100));
    }, 1500);
  };

  const generateAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('daccord') || lowerMessage.includes('ok') || lowerMessage.includes('accepte')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Excellent ! Je prépare alors l\'accord de résolution.',
        timestamp: new Date(),
        type: 'agreement'
      };
    }

    if (lowerMessage.includes('pas daccord') || lowerMessage.includes('refuse') || lowerMessage.includes('satisfait')) {
      return {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Je comprends votre position. Pouvons-nous explorer d\'autres options de résolution ?',
        timestamp: new Date(),
        type: 'question'
      };
    }

    const responses = [
      'Je comprends votre point de vue. Pouvons-nous trouver une solution mutuellement acceptable ?',
      'C\'est une préoccupation légitime. Comment pourrions-nous résoudre ce problème ?',
      'Je vous écoute. Quelle serait la solution idéale pour vous dans cette situation ?',
      'Merci pour cette précision. Cela nous aide à mieux comprendre la situation.',
      'C\'est une bonne suggestion. Comment cela fonctionnerait-il en pratique ?'
    ];

    return {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date(),
      type: 'text'
    };
  };

  const acceptSuggestion = (suggestion: string) => {
    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: `J'accepte cette solution: ${suggestion}`,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);

    setTimeout(() => {
      setMediationStage('agreement');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Parfait ! Je vais maintenant rédiger l\'accord de résolution basé sur cette solution.',
        timestamp: new Date(),
        type: 'agreement'
      };

      setMessages(prev => [...prev, aiMessage]);
      setSatisfactionScore(80);
    }, 1000);
  };

  const completeMediation = () => {
    const resolution = {
      disputeId: disputeData.id,
      resolution: aiSuggestions[0] || 'Accord mutuellement accepté',
      satisfaction: satisfactionScore,
      timestamp: new Date(),
      messages
    };

    onMediationComplete(resolution);
  };

  const escalateToHuman = () => {
    setMediationStage('escalated');
    onEscalateToHuman();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStageBadge = () => {
    const stages = {
      analysis: { label: 'Analyse IA', color: 'bg-blue-100 text-blue-800' },
      discussion: { label: 'Discussion', color: 'bg-yellow-100 text-yellow-800' },
      proposals: { label: 'Propositions', color: 'bg-orange-100 text-orange-800' },
      agreement: { label: 'Accord', color: 'bg-green-100 text-green-800' },
      escalated: { label: 'Escalade', color: 'bg-red-100 text-red-800' }
    };

    const stage = stages[mediationStage];
    return <Badge className={stage.color}>{stage.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Médiation IA - Litige #{disputeData.id}</h1>
              <p className="text-gray-600">Assistant de médiation intelligent</p>
            </div>
            <div className="flex items-center space-x-3">
              {getStageBadge()}
              <Button variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{satisfactionScore}%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
                <Progress value={satisfactionScore} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{messages.length - 1}</div>
                <div className="text-sm text-gray-600">Messages échangés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{aiSuggestions.length}</div>
                <div className="text-sm text-gray-600">Solutions proposées</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Scale className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-gray-600">Médiation IA</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Session de médiation
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.sender === 'ai'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center mb-1">
                            {message.sender === 'user' && <User className="h-3 w-3 mr-1" />}
                            {message.sender === 'ai' && <Bot className="h-3 w-3 mr-1" />}
                            <span className="text-xs font-medium">
                              {message.sender === 'user' ? 'Vous' : message.sender === 'ai' ? 'Assistant IA' : 'Médiateur'}
                            </span>
                            <span className="text-xs opacity-70 ml-2">{formatTime(message.timestamp)}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>

                          {message.type === 'suggestion' && message.suggestions && (
                            <div className="mt-3 space-y-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left h-auto p-2 text-xs"
                                  onClick={() => acceptSuggestion(suggestion)}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-2 flex-shrink-0" />
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Agreement Actions */}
                {mediationStage === 'agreement' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-900">Prêt à finaliser ?</h4>
                        <p className="text-sm text-green-700">
                          Un accord a été trouvé. Voulez-vous finaliser la résolution ?
                        </p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={escalateToHuman}>
                          Contacter un humain
                        </Button>
                        <Button size="sm" onClick={completeMediation}>
                          Finaliser l'accord
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                {mediationStage !== 'agreement' && mediationStage !== 'escalated' && (
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={mediationStage === 'escalated'}
                    />
                    <Button onClick={sendMessage} disabled={mediationStage === 'escalated'}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Assistant Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Bot className="h-4 w-4 mr-2" />
                  Assistant IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 mb-3">
                  Je vous aide à résoudre votre litige de manière juste et rapide.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Analyse intelligente
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Suggestions personnalisées
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    Médiation impartiale
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const message = "Je voudrais comprendre mes options";
                    setNewMessage(message);
                  }}
                >
                  <Lightbulb className="h-3 w-3 mr-2" />
                  Voir les options
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const message = "Quelles sont les prochaines étapes ?";
                    setNewMessage(message);
                  }}
                >
                  <Clock className="h-3 w-3 mr-2" />
                  Étapes suivantes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={escalateToHuman}
                >
                  <AlertTriangle className="h-3 w-3 mr-2" />
                  Escalader
                </Button>
              </CardContent>
            </Card>

            {/* Dispute Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Détails du litige</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div><strong>Produit:</strong> {disputeData.productName}</div>
                <div><strong>Catégorie:</strong> {disputeData.category}</div>
                <div><strong>Urgence:</strong> {disputeData.urgency}</div>
                <div><strong>Montant:</strong> {formatCurrency(disputeData.amount)}</div>
              </CardContent>
            </Card>

            {/* Satisfaction */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Votre satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-3">
                  <Button
                    variant={userRating === 'positive' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setUserRating('positive')}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={userRating === 'negative' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setUserRating('negative')}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
                <Progress value={satisfactionScore} className="h-2" />
                <p className="text-xs text-gray-600 mt-1 text-center">
                  {satisfactionScore}% satisfait
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMediation;
