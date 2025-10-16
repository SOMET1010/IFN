import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Upload,
  Send,
  Award,
  MessageSquare,
  ThumbsUp,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { BuyerRating, BuyerProfile } from "@/types/negotiations";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockBuyerProfile: BuyerProfile = {
  id: "BUYER-1",
  name: "Établissements KOFFI",
  avatar: "EK",
  companyName: "Établissements KOFFI SARL",
  description: "Leader de l'achat de cacao en Côte d'Ivoire depuis 1985",
  location: "Abidjan, Côte d'Ivoire",
  phone: "+225 27 20 30 40 50",
  email: "contact@koffi.ci",
  website: "www.koffi.ci",
  overallRating: 4.8,
  totalRatings: 156,
  ratingDistribution: {
    5: 120,
    4: 25,
    3: 8,
    2: 2,
    1: 1,
  },
  criteriaAverages: {
    payment: 4.9,
    communication: 4.7,
    timeliness: 4.8,
    professionalism: 4.9,
  },
  badges: [
    {
      id: "badge-1",
      name: "Paiement Rapide",
      description: "Paie toujours dans les délais",
      icon: "⚡",
      color: "green",
      earnedAt: "2024-01-15",
    },
    {
      id: "badge-2",
      name: "Bon Communicant",
      description: "Répond rapidement aux messages",
      icon: "💬",
      color: "blue",
      earnedAt: "2024-03-20",
    },
    {
      id: "badge-3",
      name: "Partenaire Fidèle",
      description: "Plus de 50 transactions",
      icon: "🤝",
      color: "purple",
      earnedAt: "2024-06-10",
    },
  ],
  totalTransactions: 156,
  totalVolume: 450000,
  memberSince: "2020-01-15",
  lastActive: "2025-10-16T10:00:00",
  verifiedIdentity: true,
};

const mockRecentRatings: BuyerRating[] = [
  {
    id: "RAT-001",
    buyerId: "BUYER-1",
    buyerName: "Établissements KOFFI",
    cooperativeId: "COOP-2",
    cooperativeName: "Coopérative Agnéby",
    transactionId: "TXN-045",
    overallRating: 5,
    criteria: {
      payment: 5,
      communication: 5,
      timeliness: 5,
      professionalism: 5,
    },
    comment: "Excellent partenaire ! Paiement reçu avant la date prévue. Communication fluide tout au long de la transaction.",
    proofs: [],
    createdAt: "2025-10-10T14:00:00",
    helpful: 12,
  },
  {
    id: "RAT-002",
    buyerId: "BUYER-1",
    buyerName: "Établissements KOFFI",
    cooperativeId: "COOP-3",
    cooperativeName: "Coopérative Bagoué",
    transactionId: "TXN-042",
    overallRating: 4,
    criteria: {
      payment: 5,
      communication: 4,
      timeliness: 4,
      professionalism: 4,
    },
    comment: "Bonne expérience dans l'ensemble. Petit retard de livraison mais bien géré.",
    proofs: [],
    createdAt: "2025-09-28T11:30:00",
    helpful: 8,
  },
];

interface BuyerRatingSystemProps {
  buyerId: string;
  transactionId?: string;
  onSubmitRating?: (rating: Partial<BuyerRating>) => void;
  mode?: "view" | "create";
}

export const BuyerRatingSystem = ({
  buyerId,
  transactionId,
  onSubmitRating,
  mode = "view",
}: BuyerRatingSystemProps) => {
  const [buyerProfile] = useState<BuyerProfile>(mockBuyerProfile);
  const [recentRatings] = useState<BuyerRating[]>(mockRecentRatings);
  
  // États pour le formulaire de notation
  const [ratings, setRatings] = useState({
    payment: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
  });
  const [hoverRatings, setHoverRatings] = useState({
    payment: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
  });
  const [comment, setComment] = useState("");
  const [proofs, setProofs] = useState<string[]>([]);

  const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 4;

  const handleSubmit = () => {
    if (overallRating === 0) return;
    
    onSubmitRating?.({
      buyerId,
      transactionId,
      overallRating,
      criteria: ratings,
      comment,
      proofs,
    });
  };

  const StarRating = ({ 
    value, 
    onChange, 
    onHover, 
    hoverValue 
  }: { 
    value: number; 
    onChange: (v: number) => void; 
    onHover: (v: number) => void;
    hoverValue: number;
  }) => {
    const displayValue = hoverValue || value;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={() => onHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 ${
                star <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (mode === "create") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Noter l'Acheteur</CardTitle>
          <p className="text-sm text-gray-600">
            Votre avis aide les autres coopératives à faire le bon choix
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Acheteur */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-16 h-16 bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
              {buyerProfile.avatar}
            </Avatar>
            <div>
              <h3 className="font-bold text-gray-900">{buyerProfile.name}</h3>
              <p className="text-sm text-gray-600">{buyerProfile.companyName}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold">{buyerProfile.overallRating}</span>
                </div>
                <span className="text-xs text-gray-500">
                  ({buyerProfile.totalRatings} avis)
                </span>
              </div>
            </div>
          </div>

          {/* Critères de notation */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Paiement</span>
                </div>
                <StarRating
                  value={ratings.payment}
                  onChange={(v) => setRatings({ ...ratings, payment: v })}
                  onHover={(v) => setHoverRatings({ ...hoverRatings, payment: v })}
                  hoverValue={hoverRatings.payment}
                />
              </div>
              <p className="text-xs text-gray-500">Respect des délais et modalités de paiement</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Communication</span>
                </div>
                <StarRating
                  value={ratings.communication}
                  onChange={(v) => setRatings({ ...ratings, communication: v })}
                  onHover={(v) => setHoverRatings({ ...hoverRatings, communication: v })}
                  hoverValue={hoverRatings.communication}
                />
              </div>
              <p className="text-xs text-gray-500">Clarté et réactivité dans les échanges</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-gray-900">Ponctualité</span>
                </div>
                <StarRating
                  value={ratings.timeliness}
                  onChange={(v) => setRatings({ ...ratings, timeliness: v })}
                  onHover={(v) => setHoverRatings({ ...hoverRatings, timeliness: v })}
                  hoverValue={hoverRatings.timeliness}
                />
              </div>
              <p className="text-xs text-gray-500">Respect des délais convenus</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Professionnalisme</span>
                </div>
                <StarRating
                  value={ratings.professionalism}
                  onChange={(v) => setRatings({ ...ratings, professionalism: v })}
                  onHover={(v) => setHoverRatings({ ...hoverRatings, professionalism: v })}
                  hoverValue={hoverRatings.professionalism}
                />
              </div>
              <p className="text-xs text-gray-500">Attitude et comportement général</p>
            </div>
          </div>

          {/* Note globale */}
          {overallRating > 0 && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Note Globale</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(overallRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {overallRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Commentaire */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Commentaire (optionnel)
            </label>
            <Textarea
              placeholder="Partagez votre expérience avec cet acheteur..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Soyez constructif et respectueux dans vos commentaires
            </p>
          </div>

          {/* Upload de preuves */}
          <div>
            <label className="block font-medium text-gray-900 mb-2">
              Preuves (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Cliquez pour ajouter des captures d'écran ou documents
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, PNG, JPG jusqu'à 5MB
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-orange-500 to-green-600"
              onClick={handleSubmit}
              disabled={overallRating === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Publier l'Avis
            </Button>
            <Button variant="outline" className="flex-1">
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mode "view" - Affichage du profil et des avis
  return (
    <div className="space-y-6">
      {/* Profil de l'acheteur */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              {buyerProfile.avatar}
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{buyerProfile.name}</h2>
                    {buyerProfile.verifiedIdentity && (
                      <Badge className="bg-blue-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{buyerProfile.companyName}</p>
                  <p className="text-sm text-gray-500">{buyerProfile.description}</p>
                </div>
              </div>

              {/* Note globale */}
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {buyerProfile.overallRating}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(buyerProfile.overallRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Basé sur {buyerProfile.totalRatings} avis
                  </p>
                </div>

                {/* Répartition */}
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 w-8">{stars} ⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${(buyerProfile.ratingDistribution[stars as keyof typeof buyerProfile.ratingDistribution] / buyerProfile.totalRatings) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-8">
                        {buyerProfile.ratingDistribution[stars as keyof typeof buyerProfile.ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {buyerProfile.badges.map((badge) => (
                  <Badge key={badge.id} className={`bg-${badge.color}-100 text-${badge.color}-700`}>
                    <span className="mr-1">{badge.icon}</span>
                    {badge.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critères détaillés */}
      <Card>
        <CardHeader>
          <CardTitle>Évaluation par Critère</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(buyerProfile.criteriaAverages).map(([key, value]) => {
              const configs = {
                payment: { label: "Paiement", icon: DollarSign, color: "green" },
                communication: { label: "Communication", icon: MessageSquare, color: "blue" },
                timeliness: { label: "Ponctualité", icon: Clock, color: "orange" },
                professionalism: { label: "Professionnalisme", icon: Award, color: "purple" },
              };
              const config = configs[key as keyof typeof configs];
              const Icon = config.icon;

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 text-${config.color}-600`} />
                      <span className="font-medium text-gray-900">{config.label}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{value.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-${config.color}-500 h-2 rounded-full`}
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Avis récents */}
      <Card>
        <CardHeader>
          <CardTitle>Avis Récents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentRatings.map((rating, index) => (
            <motion.div
              key={rating.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b last:border-b-0 pb-4 last:pb-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{rating.cooperativeName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating.overallRating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rating.comment}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{format(new Date(rating.createdAt), "d MMMM yyyy", { locale: fr })}</span>
                <button className="flex items-center gap-1 hover:text-orange-600">
                  <ThumbsUp className="w-3 h-3" />
                  <span>Utile ({rating.helpful})</span>
                </button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

