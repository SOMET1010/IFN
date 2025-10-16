import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  Package,
  DollarSign,
  TrendingUp,
  Grid3x3,
  List,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { GroupedOffer } from "@/types/groupedOffers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées de marketplace
const mockMarketplaceOffers: GroupedOffer[] = [
  {
    id: "OFF-001",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    cooperativeLogo: "CN",
    title: "Lot Cacao Premium 5 Tonnes",
    description: "Cacao de qualité A, récolte 2025, certifié bio",
    products: [{ productId: "1", productName: "Cacao", quantity: 5000, quality: "A", contributions: [] }],
    totalQuantity: 5000,
    quality: "A",
    unitPrice: 2500,
    totalPrice: 12500000,
    negotiationMargin: 10,
    photos: [],
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
    cooperativeId: "COOP-2",
    cooperativeName: "Union des Producteurs",
    cooperativeLogo: "UP",
    title: "Café Robusta 3 Tonnes",
    description: "Café robusta de qualité B, séché au soleil",
    products: [{ productId: "2", productName: "Café", quantity: 3000, quality: "B", contributions: [] }],
    totalQuantity: 3000,
    quality: "B",
    unitPrice: 2000,
    totalPrice: 6000000,
    negotiationMargin: 15,
    photos: [],
    status: "active",
    createdAt: "2025-10-12T14:30:00",
    expiresAt: "2025-11-12T14:30:00",
    views: 189,
    interests: 8,
    paymentTerms: { method: "30-days" },
    deliveryTerms: { type: "ex-works", location: "Bouaké", estimatedDays: 3 },
  },
  {
    id: "OFF-003",
    cooperativeId: "COOP-3",
    cooperativeName: "Groupement Anacarde",
    cooperativeLogo: "GA",
    title: "Anacarde Premium 4 Tonnes",
    description: "Anacarde de qualité A, calibre W320",
    products: [{ productId: "3", productName: "Anacarde", quantity: 4000, quality: "A", contributions: [] }],
    totalQuantity: 4000,
    quality: "A",
    unitPrice: 1800,
    totalPrice: 7200000,
    negotiationMargin: 12,
    photos: [],
    status: "active",
    createdAt: "2025-10-13T09:00:00",
    expiresAt: "2025-11-13T09:00:00",
    views: 312,
    interests: 15,
    paymentTerms: { method: "cash" },
    deliveryTerms: { type: "franco", location: "Abidjan", estimatedDays: 5 },
  },
  {
    id: "OFF-004",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    cooperativeLogo: "CN",
    title: "Karité Bio 2 Tonnes",
    description: "Beurre de karité brut, production artisanale",
    products: [{ productId: "4", productName: "Karité", quantity: 2000, quality: "A", contributions: [] }],
    totalQuantity: 2000,
    quality: "A",
    unitPrice: 3000,
    totalPrice: 6000000,
    negotiationMargin: 8,
    photos: [],
    status: "active",
    createdAt: "2025-10-14T11:00:00",
    expiresAt: "2025-11-14T11:00:00",
    views: 156,
    interests: 6,
    paymentTerms: { method: "cash" },
    deliveryTerms: { type: "franco", location: "Yamoussoukro", estimatedDays: 7 },
  },
];

interface OfferMarketplaceProps {
  onViewOffer?: (offerId: string) => void;
  onExpressInterest?: (offerId: string) => void;
  onStartNegotiation?: (offerId: string) => void;
}

export const OfferMarketplace = ({
  onViewOffer,
  onExpressInterest,
  onStartNegotiation,
}: OfferMarketplaceProps) => {
  const [offers] = useState<GroupedOffer[]>(mockMarketplaceOffers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterQuality, setFilterQuality] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([1000, 5000]);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const products = Array.from(new Set(offers.flatMap((o) => o.products.map((p) => p.productName))));
  const locations = Array.from(new Set(offers.map((o) => o.deliveryTerms.location)));

  const filteredOffers = offers
    .filter((offer) => {
      if (filterProduct !== "all" && !offer.products.some((p) => p.productName === filterProduct))
        return false;
      if (filterQuality !== "all" && offer.quality !== filterQuality) return false;
      if (filterLocation !== "all" && offer.deliveryTerms.location !== filterLocation) return false;
      if (offer.unitPrice < priceRange[0] || offer.unitPrice > priceRange[1]) return false;
      if (
        searchQuery &&
        !offer.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !offer.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.unitPrice - b.unitPrice;
        case "price-desc":
          return b.unitPrice - a.unitPrice;
        case "quantity":
          return b.totalQuantity - a.totalQuantity;
        case "popular":
          return b.views - a.views;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketplace des Offres Groupées</h2>
          <p className="text-gray-500">{filteredOffers.length} offres disponibles</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
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
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récentes</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="quantity">Quantité</SelectItem>
                  <SelectItem value="popular">Populaires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Produit</label>
                <Select value={filterProduct} onValueChange={setFilterProduct}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product} value={product}>
                        {product}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Qualité</label>
                <Select value={filterQuality} onValueChange={setFilterQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="A">Qualité A</SelectItem>
                    <SelectItem value="B">Qualité B</SelectItem>
                    <SelectItem value="C">Qualité C</SelectItem>
                    <SelectItem value="mixed">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Localisation</label>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Prix: {priceRange[0]} - {priceRange[1]} FCFA/kg
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={1000}
                  max={5000}
                  step={100}
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Grille ou liste des offres */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredOffers.map((offer, index) => {
          const qualityBadge = getQualityBadge(offer.quality);
          const isNew = new Date().getTime() - new Date(offer.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
          const isPopular = offer.views > 200;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-orange-100 to-green-100 relative">
                  <div className="absolute top-4 left-4 flex gap-2">
                    {isNew && <Badge className="bg-blue-500 text-white">Nouveau</Badge>}
                    {isPopular && <Badge className="bg-red-500 text-white">Populaire</Badge>}
                  </div>
                  <Badge className={`absolute top-4 right-4 ${qualityBadge.color}`}>
                    {qualityBadge.label}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  {/* Coopérative */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                      {offer.cooperativeLogo}
                    </div>
                    <p className="text-sm text-gray-600">{offer.cooperativeName}</p>
                  </div>

                  {/* Titre et description */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{offer.description}</p>

                  {/* Détails */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{offer.totalQuantity.toLocaleString("fr-FR")} kg</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{offer.deliveryTerms.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prix unitaire</span>
                      <span className="text-lg font-bold text-green-600">
                        {offer.unitPrice.toLocaleString("fr-FR")} FCFA/kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Prix total</span>
                      <span className="font-semibold">
                        {(offer.totalPrice / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{offer.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{offer.interests}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(offer.expiresAt), "dd MMM", { locale: fr })}</span>
                    </div>
                  </div>

                  {/* Actions */}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExpressInterest?.(offer.id)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-green-600"
                      onClick={() => onStartNegotiation?.(offer.id)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Négocier
                    </Button>
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
            <p className="text-gray-500">Aucune offre trouvée avec ces critères</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

