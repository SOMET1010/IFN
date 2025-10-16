import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GroupedOffer, OfferStats } from "@/types/groupedOffers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockOffers: GroupedOffer[] = [
  {
    id: "OFF-001",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    title: "Lot Cacao Premium 5 Tonnes",
    description: "Cacao de qualité A, récolte 2025",
    products: [
      {
        productId: "1",
        productName: "Cacao",
        quantity: 5000,
        quality: "A",
        contributions: [],
      },
    ],
    totalQuantity: 5000,
    quality: "A",
    unitPrice: 2500,
    totalPrice: 12500000,
    negotiationMargin: 10,
    photos: ["/products/cacao-1.jpg"],
    status: "active",
    createdAt: "2025-10-10T10:00:00",
    expiresAt: "2025-11-10T10:00:00",
    views: 245,
    interests: 12,
    paymentTerms: { method: "cash" },
    deliveryTerms: { type: "franco", location: "Yamoussoukro", estimatedDays: 7 },
  },
  {
    id: "OFF-002",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    title: "Café Robusta 3 Tonnes",
    description: "Café robusta de qualité B, séché au soleil",
    products: [
      {
        productId: "2",
        productName: "Café",
        quantity: 3000,
        quality: "B",
        contributions: [],
      },
    ],
    totalQuantity: 3000,
    quality: "B",
    unitPrice: 2000,
    totalPrice: 6000000,
    negotiationMargin: 15,
    photos: ["/products/cafe-1.jpg"],
    status: "active",
    createdAt: "2025-10-12T14:30:00",
    expiresAt: "2025-11-12T14:30:00",
    views: 189,
    interests: 8,
    paymentTerms: { method: "30-days" },
    deliveryTerms: { type: "ex-works", location: "Coopérative N'Zi", estimatedDays: 3 },
  },
  {
    id: "OFF-003",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    title: "Anacarde Premium 4 Tonnes",
    description: "Anacarde de qualité A, calibre W320",
    products: [
      {
        productId: "3",
        productName: "Anacarde",
        quantity: 4000,
        quality: "A",
        contributions: [],
      },
    ],
    totalQuantity: 4000,
    quality: "A",
    unitPrice: 1800,
    totalPrice: 7200000,
    negotiationMargin: 12,
    photos: ["/products/anacarde-1.jpg"],
    status: "sold",
    createdAt: "2025-09-25T09:00:00",
    expiresAt: "2025-10-25T09:00:00",
    views: 312,
    interests: 15,
    paymentTerms: { method: "cash" },
    deliveryTerms: { type: "franco", location: "Abidjan", estimatedDays: 5 },
  },
  {
    id: "OFF-004",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    title: "Lot Mixte Cacao + Café",
    description: "Offre combinée: 2T de cacao + 1.5T de café",
    products: [
      {
        productId: "1",
        productName: "Cacao",
        quantity: 2000,
        quality: "A",
        contributions: [],
      },
      {
        productId: "2",
        productName: "Café",
        quantity: 1500,
        quality: "B",
        contributions: [],
      },
    ],
    totalQuantity: 3500,
    quality: "mixed",
    unitPrice: 2200,
    totalPrice: 7700000,
    negotiationMargin: 8,
    photos: ["/products/mixte-1.jpg"],
    status: "draft",
    createdAt: "2025-10-14T16:00:00",
    expiresAt: "2025-11-14T16:00:00",
    views: 0,
    interests: 0,
    paymentTerms: { method: "cash" },
    deliveryTerms: { type: "franco", location: "Yamoussoukro", estimatedDays: 7 },
  },
];

const mockStats: OfferStats = {
  activeOffers: 2,
  soldThisMonth: 3,
  totalRevenue: 18900000,
  conversionRate: 42,
};

interface GroupedOffersDashboardProps {
  onCreateOffer: () => void;
  onEditOffer?: (offerId: string) => void;
  onViewOffer?: (offerId: string) => void;
  onDeleteOffer?: (offerId: string) => void;
}

export const GroupedOffersDashboard = ({
  onCreateOffer,
  onEditOffer,
  onViewOffer,
  onDeleteOffer,
}: GroupedOffersDashboardProps) => {
  const [offers] = useState<GroupedOffer[]>(mockOffers);
  const [stats] = useState<OfferStats>(mockStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  const filteredOffers = offers.filter((offer) => {
    if (filterStatus !== "all" && offer.status !== filterStatus) return false;
    if (filterProduct !== "all" && !offer.products.some((p) => p.productName === filterProduct))
      return false;
    if (
      searchQuery &&
      !offer.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !offer.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const products = Array.from(new Set(offers.flatMap((o) => o.products.map((p) => p.productName))));

  const getStatusConfig = (status: GroupedOffer["status"]) => {
    const configs = {
      draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
      active: { label: "Active", color: "bg-green-100 text-green-700" },
      sold: { label: "Vendue", color: "bg-orange-100 text-orange-700" },
      expired: { label: "Expirée", color: "bg-red-100 text-red-700" },
      cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-500" },
    };
    return configs[status];
  };

  const getQualityBadge = (quality: GroupedOffer["quality"]) => {
    const configs = {
      A: { label: "Qualité A", color: "bg-green-100 text-green-700" },
      B: { label: "Qualité B", color: "bg-blue-100 text-blue-700" },
      C: { label: "Qualité C", color: "bg-orange-100 text-orange-700" },
      mixed: { label: "Mixte", color: "bg-purple-100 text-purple-700" },
    };
    return configs[quality];
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offres Groupées</h2>
          <p className="text-gray-500">Créez et gérez vos offres attractives</p>
        </div>
        <Button
          onClick={onCreateOffer}
          className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer une Offre
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeOffers}</h3>
            <p className="text-sm text-gray-500">Offres Actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.soldThisMonth}</h3>
            <p className="text-sm text-gray-500">Vendues ce Mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {(stats.totalRevenue / 1000000).toFixed(1)}M
            </h3>
            <p className="text-sm text-gray-500">Revenus (FCFA)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.conversionRate}%</h3>
            <p className="text-sm text-gray-500">Taux de Conversion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Vendue</SelectItem>
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

      {/* Grille des offres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer, index) => {
          const statusConfig = getStatusConfig(offer.status);
          const qualityBadge = getQualityBadge(offer.quality);

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image de l'offre */}
                <div className="h-48 bg-gradient-to-br from-orange-100 to-green-100 relative">
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                    <Badge className={qualityBadge.color}>{qualityBadge.label}</Badge>
                  </div>
                  {offer.status === "active" && offer.views > 200 && (
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white">
                      Populaire
                    </Badge>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Produits</span>
                      <span className="font-semibold">
                        {offer.products.map((p) => p.productName).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Quantité totale</span>
                      <span className="font-semibold">
                        {offer.totalQuantity.toLocaleString("fr-FR")} kg
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prix total</span>
                      <span className="text-lg font-bold text-green-600">
                        {(offer.totalPrice / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{offer.views} vues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{offer.interests} intérêts</span>
                    </div>
                    <span>
                      Expire le {format(new Date(offer.expiresAt), "dd MMM", { locale: fr })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onViewOffer?.(offer.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    {offer.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onEditOffer?.(offer.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    )}
                    {(offer.status === "draft" || offer.status === "expired") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteOffer?.(offer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredOffers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Aucune offre trouvée avec ces filtres</p>
            <Button
              onClick={onCreateOffer}
              className="bg-gradient-to-r from-orange-500 to-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre première offre
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

