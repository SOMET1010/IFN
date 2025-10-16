import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Check,
  X,
  Clock,
  MessageCircle,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { GroupedOffer, Negotiation, NegotiationMessage, CounterOffer } from "@/types/groupedOffers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockNegotiation: Negotiation = {
  id: "NEG-001",
  offerId: "OFF-001",
  merchantId: "MERCH-1",
  merchantName: "Établissements KOFFI",
  merchantAvatar: "EK",
  status: "in-progress",
  startedAt: "2025-10-14T10:00:00",
  expiresAt: "2025-10-16T10:00:00",
  messages: [
    {
      id: "MSG-1",
      senderId: "MERCH-1",
      senderName: "Établissements KOFFI",
      senderType: "merchant",
      content: "Bonjour, je suis intéressé par votre offre de cacao. Pouvez-vous m'en dire plus sur la qualité ?",
      timestamp: "2025-10-14T10:05:00",
      read: true,
    },
    {
      id: "MSG-2",
      senderId: "COOP-1",
      senderName: "Coopérative N'Zi",
      senderType: "cooperative",
      content: "Bonjour ! Notre cacao est de qualité A, certifié bio. Récolte 2025, séché au soleil.",
      timestamp: "2025-10-14T10:15:00",
      read: true,
    },
    {
      id: "MSG-3",
      senderId: "MERCH-1",
      senderName: "Établissements KOFFI",
      senderType: "merchant",
      content: "Excellent. Pouvez-vous accepter 2300 FCFA/kg au lieu de 2500 ?",
      timestamp: "2025-10-14T10:30:00",
      read: true,
    },
  ],
  offers: [
    {
      id: "OFFER-1",
      type: "initial",
      proposedBy: "cooperative",
      price: 2500,
      quantity: 5000,
      timestamp: "2025-10-14T10:00:00",
      status: "pending",
    },
    {
      id: "OFFER-2",
      type: "counter",
      proposedBy: "merchant",
      price: 2300,
      quantity: 5000,
      timestamp: "2025-10-14T10:30:00",
      status: "pending",
    },
  ],
};

interface OfferNegotiationPanelProps {
  offer: GroupedOffer;
  onSendMessage?: (message: string) => void;
  onCounterOffer?: (counterOffer: CounterOffer) => void;
  onAccept?: () => void;
  onReject?: () => void;
}

export const OfferNegotiationPanel = ({
  offer,
  onSendMessage,
  onCounterOffer,
  onAccept,
  onReject,
}: OfferNegotiationPanelProps) => {
  const [negotiation] = useState<Negotiation>(mockNegotiation);
  const [messages, setMessages] = useState<NegotiationMessage[]>(negotiation.messages);
  const [newMessage, setNewMessage] = useState("");
  const [showCounterOfferForm, setShowCounterOfferForm] = useState(false);
  const [counterPrice, setCounterPrice] = useState(offer.unitPrice);
  const [counterQuantity, setCounterQuantity] = useState(offer.totalQuantity);
  const [counterConditions, setCounterConditions] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const latestOffer = negotiation.offers[negotiation.offers.length - 1];
  const timeRemaining = Math.max(0, new Date(negotiation.expiresAt).getTime() - Date.now());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  useEffect(() => {
    // Simuler des messages entrants
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newMsg: NegotiationMessage = {
          id: `MSG-${Date.now()}`,
          senderId: negotiation.merchantId,
          senderName: negotiation.merchantName,
          senderType: "merchant",
          content: "Je suis toujours intéressé. Pouvons-nous finaliser ?",
          timestamp: new Date().toISOString(),
          read: false,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [negotiation.merchantId, negotiation.merchantName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: NegotiationMessage = {
      id: `MSG-${Date.now()}`,
      senderId: "COOP-1",
      senderName: "Coopérative N'Zi",
      senderType: "cooperative",
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages([...messages, msg]);
    onSendMessage?.(newMessage);
    setNewMessage("");
  };

  const handleCounterOffer = () => {
    const counter: CounterOffer = {
      price: counterPrice,
      quantity: counterQuantity,
      conditions: counterConditions,
    };
    onCounterOffer?.(counter);
    setShowCounterOfferForm(false);
  };

  const getStatusBadge = (status: Negotiation["status"]) => {
    const configs = {
      pending: { label: "En attente", color: "bg-gray-100 text-gray-700" },
      "in-progress": { label: "En cours", color: "bg-blue-100 text-blue-700" },
      accepted: { label: "Acceptée", color: "bg-green-100 text-green-700" },
      rejected: { label: "Refusée", color: "bg-red-100 text-red-700" },
      expired: { label: "Expirée", color: "bg-orange-100 text-orange-700" },
    };
    return configs[status];
  };

  const statusBadge = getStatusBadge(negotiation.status);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Informations de l'offre et négociation */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Offre en Négociation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Titre</p>
              <p className="font-semibold">{offer.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantité</p>
              <p className="font-semibold">{offer.totalQuantity.toLocaleString("fr-FR")} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prix initial</p>
              <p className="text-xl font-bold text-green-600">
                {offer.unitPrice.toLocaleString("fr-FR")} FCFA/kg
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Marge de négociation</p>
              <p className="font-semibold">{offer.negotiationMargin}%</p>
              <p className="text-xs text-gray-500">
                Prix min: {((offer.unitPrice * (100 - offer.negotiationMargin)) / 100).toLocaleString("fr-FR")} FCFA/kg
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Négociation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 bg-orange-100 text-orange-700 flex items-center justify-center font-semibold">
                {negotiation.merchantAvatar}
              </Avatar>
              <div>
                <p className="font-semibold">{negotiation.merchantName}</p>
                <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Expire dans {hoursRemaining}h</span>
            </div>

            {latestOffer && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Dernière proposition</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{latestOffer.price.toLocaleString("fr-FR")} FCFA/kg</p>
                    <p className="text-xs text-gray-500">{latestOffer.quantity.toLocaleString("fr-FR")} kg</p>
                  </div>
                  <Badge className={latestOffer.proposedBy === "merchant" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                    {latestOffer.proposedBy === "merchant" ? "Marchand" : "Coopérative"}
                  </Badge>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-red-600" onClick={onReject}>
                <X className="w-4 h-4 mr-1" />
                Refuser
              </Button>
              <Button size="sm" className="flex-1 bg-green-600" onClick={onAccept}>
                <Check className="w-4 h-4 mr-1" />
                Accepter
              </Button>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => setShowCounterOfferForm(!showCounterOfferForm)}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Contre-proposer
            </Button>

            {showCounterOfferForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-3 border-t"
              >
                <div>
                  <label className="text-xs text-gray-600">Prix (FCFA/kg)</label>
                  <Input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Quantité (kg)</label>
                  <Input
                    type="number"
                    value={counterQuantity}
                    onChange={(e) => setCounterQuantity(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Conditions</label>
                  <Textarea
                    value={counterConditions}
                    onChange={(e) => setCounterConditions(e.target.value)}
                    rows={2}
                    placeholder="Conditions spéciales..."
                  />
                </div>
                <Button size="sm" className="w-full" onClick={handleCounterOffer}>
                  Envoyer la Contre-proposition
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Discussion</CardTitle>
              <Badge className="bg-green-100 text-green-700">
                <div className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse" />
                En ligne
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isCooperative = message.senderType === "cooperative";

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isCooperative ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] ${isCooperative ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        isCooperative
                          ? "bg-gradient-to-r from-orange-500 to-green-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {format(new Date(message.timestamp), "HH:mm", { locale: fr })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

