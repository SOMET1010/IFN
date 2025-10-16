import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Archive,
  Star,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NegotiationExtended } from "@/types/negotiations";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockNegotiations: NegotiationExtended[] = [
  {
    id: "NEG-001",
    offerId: "OFF-001",
    offerTitle: "Lot Cacao Premium 5 Tonnes",
    offerProducts: ["Cacao"],
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    buyerId: "BUYER-1",
    buyerName: "Établissements KOFFI",
    buyerAvatar: "EK",
    buyerRating: 4.8,
    status: "in-progress",
    startedAt: "2025-10-14T10:00:00",
    expiresAt: "2025-10-17T10:00:00",
    lastActivity: "2025-10-16T09:30:00",
    unreadMessages: 2,
    currentOffer: {
      price: 2350,
      quantity: 5000,
      totalPrice: 11750000,
      conditions: "Paiement à 30 jours, livraison franco Abidjan",
    },
    initialOffer: {
      price: 2500,
      quantity: 5000,
      totalPrice: 12500000,
    },
    urgency: "high",
    isBestOffer: true,
  },
  {
    id: "NEG-002",
    offerId: "OFF-001",
    offerTitle: "Lot Cacao Premium 5 Tonnes",
    offerProducts: ["Cacao"],
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    buyerId: "BUYER-2",
    buyerName: "SOCOCE",
    buyerAvatar: "SC",
    buyerRating: 4.5,
    status: "in-progress",
    startedAt: "2025-10-15T14:00:00",
    expiresAt: "2025-10-18T14:00:00",
    lastActivity: "2025-10-15T16:20:00",
    unreadMessages: 0,
    currentOffer: {
      price: 2300,
      quantity: 5000,
      totalPrice: 11500000,
      conditions: "Paiement comptant, ex-works",
    },
    initialOffer: {
      price: 2500,
      quantity: 5000,
      totalPrice: 12500000,
    },
    urgency: "medium",
    isBestOffer: false,
  },
  {
    id: "NEG-003",
    offerId: "OFF-002",
    offerTitle: "Café Robusta 3 Tonnes",
    offerProducts: ["Café"],
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    buyerId: "BUYER-3",
    buyerName: "Café de Côte",
    buyerAvatar: "CC",
    buyerRating: 4.9,
    status: "counter-offered",
    startedAt: "2025-10-13T11:00:00",
    expiresAt: "2025-10-16T11:00:00",
    lastActivity: "2025-10-16T08:00:00",
    unreadMessages: 1,
    currentOffer: {
      price: 1950,
      quantity: 3000,
      totalPrice: 5850000,
      conditions: "Paiement comptant, livraison franco Bouaké",
    },
    initialOffer: {
      price: 2000,
      quantity: 3000,
      totalPrice: 6000000,
    },
    urgency: "high",
    isBestOffer: true,
  },
  {
    id: "NEG-004",
    offerId: "OFF-003",
    offerTitle: "Anacarde Premium 4 Tonnes",
    offerProducts: ["Anacarde"],
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    buyerId: "BUYER-4",
    buyerName: "Olam Ivoire",
    buyerAvatar: "OI",
    buyerRating: 4.7,
    status: "accepted",
    startedAt: "2025-10-10T09:00:00",
    expiresAt: "2025-10-13T09:00:00",
    lastActivity: "2025-10-12T15:30:00",
    unreadMessages: 0,
    currentOffer: {
      price: 1750,
      quantity: 4000,
      totalPrice: 7000000,
      conditions: "Paiement à 30 jours, livraison franco Abidjan",
    },
    initialOffer: {
      price: 1800,
      quantity: 4000,
      totalPrice: 7200000,
    },
    urgency: "low",
    isBestOffer: true,
  },
  {
    id: "NEG-005",
    offerId: "OFF-004",
    offerTitle: "Karité Bio 2 Tonnes",
    offerProducts: ["Karité"],
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    buyerId: "BUYER-5",
    buyerName: "L'Occitane CI",
    buyerAvatar: "LC",
    buyerRating: 5.0,
    status: "rejected",
    startedAt: "2025-10-11T10:00:00",
    expiresAt: "2025-10-14T10:00:00",
    lastActivity: "2025-10-13T11:00:00",
    unreadMessages: 0,
    currentOffer: {
      price: 2700,
      quantity: 2000,
      totalPrice: 5400000,
      conditions: "Paiement à 60 jours, ex-works",
    },
    initialOffer: {
      price: 3000,
      quantity: 2000,
      totalPrice: 6000000,
    },
    urgency: "low",
    isBestOffer: false,
  },
];

interface NegotiationsHubProps {
  onViewNegotiation?: (negotiationId: string) => void;
  onAcceptOffer?: (negotiationId: string) => void;
  onRejectOffer?: (negotiationId: string) => void;
  onArchive?: (negotiationId: string) => void;
}

export const NegotiationsHub = ({
  onViewNegotiation,
  onAcceptOffer,
  onRejectOffer,
  onArchive,
}: NegotiationsHubProps) => {
  const [negotiations] = useState<NegotiationExtended[]>(mockNegotiations);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  const filteredNegotiations = negotiations.filter((neg) => {
    if (filterStatus !== "all" && neg.status !== filterStatus) return false;
    if (filterProduct !== "all" && !neg.offerProducts.includes(filterProduct)) return false;
    if (
      searchQuery &&
      !neg.offerTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !neg.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    active: negotiations.filter((n) => n.status === "in-progress" || n.status === "counter-offered").length,
    conversionRate: Math.round(
      (negotiations.filter((n) => n.status === "accepted").length / negotiations.length) * 100
    ),
    averageDuration: 2.5,
  };

  const products = Array.from(new Set(negotiations.flatMap((n) => n.offerProducts)));

  const getStatusConfig = (status: NegotiationExtended["status"]) => {
    const configs = {
      pending: { label: "En attente", color: "bg-gray-100 text-gray-700", icon: Clock },
      "in-progress": { label: "En cours", color: "bg-blue-100 text-blue-700", icon: MessageCircle },
      "counter-offered": { label: "Contre-offre", color: "bg-purple-100 text-purple-700", icon: TrendingUp },
      accepted: { label: "Acceptée", color: "bg-green-100 text-green-700", icon: CheckCircle },
      rejected: { label: "Refusée", color: "bg-red-100 text-red-700", icon: XCircle },
      expired: { label: "Expirée", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
    };
    return configs[status];
  };

  const getUrgencyColor = (urgency: NegotiationExtended["urgency"]) => {
    const colors = {
      low: "border-gray-200",
      medium: "border-orange-300",
      high: "border-red-400",
    };
    return colors[urgency];
  };

  const calculateDiscount = (initial: number, current: number) => {
    return Math.round(((initial - current) / initial) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centre de Négociations</h2>
          <p className="text-gray-500">Gérez toutes vos négociations en un seul endroit</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-sm text-gray-500">Négociations Actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.conversionRate}%</h3>
            <p className="text-sm text-gray-500">Taux de Conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.averageDuration}j</h3>
            <p className="text-sm text-gray-500">Durée Moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par offre ou acheteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="counter-offered">Contre-offre</SelectItem>
                  <SelectItem value="accepted">Acceptée</SelectItem>
                  <SelectItem value="rejected">Refusée</SelectItem>
                  <SelectItem value="expired">Expirée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Produit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des négociations */}
      <div className="space-y-4">
        {filteredNegotiations.map((negotiation, index) => {
          const statusConfig = getStatusConfig(negotiation.status);
          const StatusIcon = statusConfig.icon;
          const discount = calculateDiscount(negotiation.initialOffer.price, negotiation.currentOffer.price);
          const timeRemaining = new Date(negotiation.expiresAt).getTime() - Date.now();
          const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

          return (
            <motion.div
              key={negotiation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-l-4 ${getUrgencyColor(negotiation.urgency)} hover:shadow-lg transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar acheteur */}
                      <Avatar className="w-12 h-12 bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                        {negotiation.buyerAvatar}
                      </Avatar>

                      {/* Informations principales */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{negotiation.buyerName}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{negotiation.buyerRating}</span>
                          </div>
                          {negotiation.isBestOffer && (
                            <Badge className="bg-green-500 text-white">Meilleure offre</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{negotiation.offerTitle}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>{negotiation.currentOffer.quantity.toLocaleString("fr-FR")} kg</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(negotiation.lastActivity), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                          {negotiation.status === "in-progress" && hoursRemaining > 0 && (
                            <span className="text-orange-600 font-semibold">Expire dans {hoursRemaining}h</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statut */}
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Offre actuelle */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Prix proposé</p>
                        <p className="text-xl font-bold text-gray-900">
                          {negotiation.currentOffer.price.toLocaleString("fr-FR")} FCFA/kg
                        </p>
                        {discount > 0 && (
                          <p className="text-xs text-red-600">-{discount}% vs prix initial</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total</p>
                        <p className="text-xl font-bold text-green-600">
                          {(negotiation.currentOffer.totalPrice / 1000000).toFixed(1)}M FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Conditions</p>
                        <p className="text-sm text-gray-700">{negotiation.currentOffer.conditions}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages non lus */}
                  {negotiation.unreadMessages > 0 && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700 font-semibold">
                        {negotiation.unreadMessages} nouveau{negotiation.unreadMessages > 1 ? "x" : ""} message
                        {negotiation.unreadMessages > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onViewNegotiation?.(negotiation.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    {(negotiation.status === "in-progress" || negotiation.status === "counter-offered") && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => onAcceptOffer?.(negotiation.id)}
                        >
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onRejectOffer?.(negotiation.id)}
                        >
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          Refuser
                        </Button>
                      </>
                    )}
                    {(negotiation.status === "accepted" ||
                      negotiation.status === "rejected" ||
                      negotiation.status === "expired") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onArchive?.(negotiation.id)}
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Archiver
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredNegotiations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Aucune négociation trouvée avec ces filtres</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

