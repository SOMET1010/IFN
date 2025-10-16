import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Send, Bot, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Product } from '@/types';

interface Message {
  id: string;
  sender: 'user' | 'seller' | 'ai';
  content: string;
  timestamp: Date;
  type: 'text' | 'offer' | 'counter_offer';
  price?: number;
}

interface PriceNegotiationProps {
  product: Product;
  onNegotiationComplete: (finalPrice: number, agreement: Record<string, unknown>) => void;
  onCancel: () => void;
}

const PriceNegotiation = ({ product, onNegotiationComplete, onCancel }: PriceNegotiationProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'seller',
      content: `Bonjour ! Je peux vous proposer ces ${product.name} de qualité ${product.quality} pour ${product.price} FCFA/${product.unit}.`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [currentOffer, setCurrentOffer] = useState<number | null>(null);
  const [negotiationStage, setNegotiationStage] = useState<'initial' | 'negotiating' | 'agreement' | 'failed'>('initial');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAiSuggestions = () => {
    const basePrice = product.price;
    const suggestions = [
      `Prix du marché: ${basePrice} FCFA/${product.unit}`,
      `Prix premium: ${Math.round(basePrice * 1.2)} FCFA/${product.unit}`,
      `Prix négociable: ${Math.round(basePrice * 0.85)} FCFA/${product.unit}`,
      `Prix en gros (dès 10kg): ${Math.round(basePrice * 0.75)} FCFA/${product.unit}`
    ];
    setAiSuggestions(suggestions);
  };

  const sendAIMessage = (suggestion: string) => {
    const priceMatch = suggestion.match(/(\d+)\s*FCFA/);
    const price = priceMatch ? parseInt(priceMatch[1]) : null;

    const aiMessage: Message = {
      id: Date.now().toString(),
      sender: 'ai',
      content: suggestion,
      timestamp: new Date(),
      type: price ? 'offer' : 'text',
      price: price || undefined
    };

    setMessages(prev => [...prev, aiMessage]);
    setShowAiAssistant(false);

    // Auto-respond from seller after AI suggestion
    setTimeout(() => {
      const sellerResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'seller',
        content: `C'est une proposition intéressante. Je peux considérer ce prix pour une commande importante.`,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, sellerResponse]);
    }, 2000);
  };

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

    // Simulate seller response
    setTimeout(() => {
      const responses = [
        "Je comprends votre position. Quel prix seriez-vous prêt à accepter ?",
        "La qualité de ce produit justifie ce prix. Cependant, je peux faire un effort pour une commande importante.",
        "Je peux proposer une remise pour un achat en gros.",
        "Les frais de production ont augmenté, mais je peux étudier votre proposition."
      ];

      const sellerResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'seller',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, sellerResponse]);
    }, 1500);
  };

  const makeOffer = (price: number) => {
    const offerMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: `Je vous propose ${price} FCFA/${product.unit}`,
      timestamp: new Date(),
      type: 'offer',
      price
    };

    setMessages(prev => [...prev, offerMessage]);
    setCurrentOffer(price);
    setNegotiationStage('negotiating');

    // Simulate seller response to offer
    setTimeout(() => {
      const acceptance = Math.random() > 0.5;
      if (acceptance) {
        const counterPrice = Math.round(price * (1 + (Math.random() * 0.2 - 0.1)));

        const sellerResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'seller',
          content: counterPrice === price
            ? "Parfait ! J'accepte votre proposition."
            : `C'est proche, je pourrais accepter ${counterPrice} FCFA/${product.unit}.`,
          timestamp: new Date(),
          type: counterPrice === price ? 'text' : 'counter_offer',
          price: counterPrice !== price ? counterPrice : undefined
        };

        setMessages(prev => [...prev, sellerResponse]);
      } else {
        const sellerResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'seller',
          content: `C'est un peu bas pour moi. Le minimum que je peux accepter est ${Math.round(product.price * 0.9)} FCFA/${product.unit}.`,
          timestamp: new Date(),
          type: 'counter_offer',
          price: Math.round(product.price * 0.9)
        };

        setMessages(prev => [...prev, sellerResponse]);
      }
    }, 2000);
  };

  const acceptAgreement = () => {
    const finalPrice = currentOffer || product.price;
    const agreement = {
      productId: product.id,
      finalPrice,
      negotiationHistory: messages,
      timestamp: new Date()
    };

    onNegotiationComplete(finalPrice, agreement);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Négociation - {product.name}</h1>
              <p className="text-gray-600">avec {product.producer}</p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{product.price} FCFA</div>
                <div className="text-sm text-gray-600">Prix initial</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {currentOffer || product.price} FCFA
                </div>
                <div className="text-sm text-gray-600">Offre actuelle</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Badge variant={negotiationStage === 'agreement' ? 'default' : 'secondary'}>
                  {negotiationStage === 'initial' && 'En attente'}
                  {negotiationStage === 'negotiating' && 'Négociation en cours'}
                  {negotiationStage === 'agreement' && 'Accord trouvé'}
                  {negotiationStage === 'failed' && 'Échec'}
                </Badge>
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
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Discussion
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-4">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
                            {message.sender === 'user' ? 'Vous' : message.sender === 'ai' ? 'Assistant IA' : product.producer}
                          </span>
                          <span className="text-xs opacity-70 ml-2">{formatTime(message.timestamp)}</span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        {message.price && (
                          <div className="mt-2 p-2 bg-black bg-opacity-20 rounded">
                            <span className="text-xs font-semibold">Prix proposé: {message.price} FCFA/{product.unit}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Agreement Actions */}
                {negotiationStage === 'negotiating' && currentOffer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-900">Prêt à conclure ?</h4>
                        <p className="text-sm text-green-700">Prix final: {currentOffer} FCFA/{product.unit}</p>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setNegotiationStage('failed')}>
                          Continuer à négocier
                        </Button>
                        <Button size="sm" onClick={acceptAgreement}>
                          Accepter l'accord
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Assistant */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Bot className="h-4 w-4 mr-2" />
                  Assistant IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showAiAssistant} onOpenChange={setShowAiAssistant}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" onClick={generateAiSuggestions}>
                      Obtenir des suggestions
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Suggestions de prix</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => sendAIMessage(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
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
                  onClick={() => makeOffer(Math.round(product.price * 0.9))}
                >
                  Offrir -10%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => makeOffer(Math.round(product.price * 0.8))}
                >
                  Offrir -20%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const customPrice = prompt("Entrez votre prix:");
                    if (customPrice) {
                      makeOffer(parseInt(customPrice));
                    }
                  }}
                >
                  Prix personnalisé
                </Button>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Détails du produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Quantité:</strong> {product.quantity} {product.unit}</div>
                <div><strong>Qualité:</strong> {product.quality}</div>
                <div><strong>Origine:</strong> {product.origin}</div>
                <div><strong>Récolte:</strong> {new Date(product.harvest_date!).toLocaleDateString('fr-FR')}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceNegotiation;