import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Star,
  DollarSign,
  Package,
  Truck,
  Calendar,
  Award,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { OfferComparison, BuyerOffer } from "@/types/negotiations";

// Données mockées
const mockComparison: OfferComparison = {
  offerId: "OFF-001",
  offerTitle: "Lot Cacao Premium 5 Tonnes",
  buyers: [
    {
      buyerId: "BUYER-1",
      buyerName: "Établissements KOFFI",
      buyerRating: 4.8,
      buyerTransactions: 45,
      price: 2350,
      quantity: 5000,
      totalPrice: 11750000,
      paymentTerms: {
        method: "30-days",
        description: "Paiement à 30 jours après livraison",
      },
      deliveryTerms: {
        type: "franco",
        location: "Abidjan",
        estimatedDays: 5,
      },
      score: 92,
      breakdown: {
        priceScore: 90,
        reputationScore: 96,
        conditionsScore: 88,
        historyScore: 95,
      },
      previousTransactions: 12,
      averagePaymentDelay: 2,
    },
    {
      buyerId: "BUYER-2",
      buyerName: "SOCOCE",
      buyerRating: 4.5,
      buyerTransactions: 78,
      price: 2300,
      quantity: 5000,
      totalPrice: 11500000,
      paymentTerms: {
        method: "cash",
        description: "Paiement comptant à la livraison",
      },
      deliveryTerms: {
        type: "ex-works",
        location: "Coopérative",
        estimatedDays: 0,
      },
      score: 88,
      breakdown: {
        priceScore: 95,
        reputationScore: 85,
        conditionsScore: 92,
        historyScore: 80,
      },
      previousTransactions: 8,
      averagePaymentDelay: 0,
    },
    {
      buyerId: "BUYER-3",
      buyerName: "Barry Callebaut",
      buyerRating: 4.9,
      buyerTransactions: 156,
      price: 2400,
      quantity: 5000,
      totalPrice: 12000000,
      paymentTerms: {
        method: "30-days",
        description: "Paiement à 30 jours",
      },
      deliveryTerms: {
        type: "franco",
        location: "Abidjan",
        estimatedDays: 7,
      },
      score: 94,
      breakdown: {
        priceScore: 85,
        reputationScore: 98,
        conditionsScore: 90,
        historyScore: 100,
      },
      previousTransactions: 25,
      averagePaymentDelay: 1,
    },
  ],
  recommendedBuyerId: "BUYER-1",
  comparisonDate: new Date().toISOString(),
};

interface MultiOfferComparisonProps {
  offerId: string;
  onSelectOffer?: (buyerId: string) => void;
  onNegotiate?: (buyerId: string) => void;
}

export const MultiOfferComparison = ({
  offerId,
  onSelectOffer,
  onNegotiate,
}: MultiOfferComparisonProps) => {
  const [comparison] = useState<OfferComparison>(mockComparison);

  const getBestValue = (criterion: "price" | "rating" | "score") => {
    if (criterion === "price") {
      return Math.min(...comparison.buyers.map((b) => b.price));
    } else if (criterion === "rating") {
      return Math.max(...comparison.buyers.map((b) => b.buyerRating));
    } else {
      return Math.max(...comparison.buyers.map((b) => b.score));
    }
  };

  const isBestValue = (buyer: BuyerOffer, criterion: "price" | "rating" | "score") => {
    const bestValue = getBestValue(criterion);
    if (criterion === "price") return buyer.price === bestValue;
    if (criterion === "rating") return buyer.buyerRating === bestValue;
    return buyer.score === bestValue;
  };

  const isRecommended = (buyerId: string) => buyerId === comparison.recommendedBuyerId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparaison des Offres</h2>
        <p className="text-gray-600">{comparison.offerTitle}</p>
      </div>

      {/* Recommandation IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                Recommandation IA
                <Badge className="bg-purple-500 text-white">Nouveau</Badge>
              </h3>
              <p className="text-gray-700 mb-3">
                Basé sur votre historique et nos analyses, nous recommandons l'offre de{" "}
                <span className="font-bold">
                  {comparison.buyers.find((b) => b.buyerId === comparison.recommendedBuyerId)?.buyerName}
                </span>
                . Cet acheteur offre le meilleur équilibre entre prix, réputation et conditions de paiement.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Excellent historique
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  <Award className="w-3 h-3 mr-1" />
                  Paiement fiable
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau de comparaison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Détaillée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                    Critère
                  </th>
                  {comparison.buyers.map((buyer) => (
                    <th key={buyer.buyerId} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className="w-12 h-12 bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                          {buyer.buyerName.substring(0, 2)}
                        </Avatar>
                        <div>
                          <p className="font-bold text-gray-900">{buyer.buyerName}</p>
                          <div className="flex items-center gap-1 justify-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">{buyer.buyerRating}</span>
                          </div>
                        </div>
                        {isRecommended(buyer.buyerId) && (
                          <Badge className="bg-purple-500 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Prix unitaire */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      Prix unitaire
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">
                          {buyer.price.toLocaleString("fr-FR")} FCFA/kg
                        </span>
                        {isBestValue(buyer, "price") && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Meilleur prix
                          </Badge>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Quantité */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      Quantité
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <span className="text-gray-900">{buyer.quantity.toLocaleString("fr-FR")} kg</span>
                    </td>
                  ))}
                </tr>

                {/* Prix total */}
                <tr className="border-b hover:bg-gray-50 bg-blue-50">
                  <td className="p-4 font-bold text-gray-900 sticky left-0 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      Prix Total
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <span className="text-xl font-bold text-green-600">
                        {(buyer.totalPrice / 1000000).toFixed(1)}M FCFA
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Modalités de paiement */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      Paiement
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm text-gray-900">{buyer.paymentTerms.description}</span>
                        {buyer.paymentTerms.method === "cash" && (
                          <Badge className="bg-green-100 text-green-700">Comptant</Badge>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Livraison */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-500" />
                      Livraison
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm text-gray-900">
                          {buyer.deliveryTerms.type === "franco" ? "Franco" : "Ex-Works"}
                        </span>
                        <span className="text-xs text-gray-600">{buyer.deliveryTerms.location}</span>
                        <span className="text-xs text-gray-500">{buyer.deliveryTerms.estimatedDays}j</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Réputation */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      Réputation
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{buyer.buyerRating}</span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {buyer.buyerTransactions} transactions
                        </span>
                        {isBestValue(buyer, "rating") && (
                          <Badge className="bg-yellow-100 text-yellow-700">Top noté</Badge>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Historique avec vous */}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-700 sticky left-0 bg-white">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      Historique
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {buyer.previousTransactions} transaction{buyer.previousTransactions > 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-gray-600">
                          Délai moyen: {buyer.averagePaymentDelay}j
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Score global */}
                <tr className="border-b-2 bg-gradient-to-r from-orange-50 to-green-50">
                  <td className="p-4 font-bold text-gray-900 sticky left-0 bg-gradient-to-r from-orange-50 to-green-50">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-600" />
                      Score Global
                    </div>
                  </td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-20 h-20">
                          <svg className="transform -rotate-90 w-20 h-20">
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              stroke={isBestValue(buyer, "score") ? "#16a34a" : "#f97316"}
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${(buyer.score / 100) * 201} 201`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{buyer.score}</span>
                          </div>
                        </div>
                        {isBestValue(buyer, "score") && (
                          <Badge className="bg-green-500 text-white">
                            <Award className="w-3 h-3 mr-1" />
                            Meilleur score
                          </Badge>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="p-4 sticky left-0 bg-white"></td>
                  {comparison.buyers.map((buyer) => (
                    <td key={buyer.buyerId} className="p-4 text-center">
                      <div className="flex flex-col gap-2">
                        <Button
                          className={
                            isRecommended(buyer.buyerId)
                              ? "bg-gradient-to-r from-orange-500 to-green-600"
                              : "bg-gray-600"
                          }
                          onClick={() => onSelectOffer?.(buyer.buyerId)}
                        >
                          {isRecommended(buyer.buyerId) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Choisir (Recommandé)
                            </>
                          ) : (
                            "Choisir cette offre"
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => onNegotiate?.(buyer.buyerId)}>
                          Négocier
                        </Button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Détails du scoring */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du Scoring IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparison.buyers.map((buyer) => (
              <div key={buyer.buyerId} className="space-y-3">
                <h4 className="font-bold text-gray-900">{buyer.buyerName}</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Prix (40%)</span>
                      <span className="font-semibold">{buyer.breakdown.priceScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${buyer.breakdown.priceScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Réputation (30%)</span>
                      <span className="font-semibold">{buyer.breakdown.reputationScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${buyer.breakdown.reputationScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Conditions (20%)</span>
                      <span className="font-semibold">{buyer.breakdown.conditionsScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${buyer.breakdown.conditionsScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Historique (10%)</span>
                      <span className="font-semibold">{buyer.breakdown.historyScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${buyer.breakdown.historyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

