import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Package,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import ProductPublication from '../transaction-workflow/ProductPublication';
import { Product } from '@/types';
import { formatCurrency as fc } from '@/lib/format';

interface OfferManagementDashboardProps {
  userProducts?: Product[];
}

const OfferManagementDashboard = ({ userProducts = [] }: OfferManagementDashboardProps) => {
  const [offers, setOffers] = useState<Product[]>(userProducts);
  const [filteredOffers, setFilteredOffers] = useState<Product[]>(userProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Product | null>(null);
  const [analytics, setAnalytics] = useState({
    totalOffers: 0,
    activeOffers: 0,
    soldOffers: 0,
    totalViews: 0,
    totalRevenue: 0,
    averageRating: 0
  });

  const categories = [
    { id: 'all', name: 'Toutes catégories' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'legumes', name: 'Légumes' },
    { id: 'volaille', name: 'Volaille' },
    { id: 'poissons', name: 'Poissons' },
    { id: 'cereales', name: 'Céréales' }
  ];

  const statusOptions = [
    { id: 'all', name: 'Tous statuts' },
    { id: 'available', name: 'Disponible' },
    { id: 'sold', name: 'Épuisé' },
    { id: 'pending', name: 'En attente' }
  ];

  const sortOptions = [
    { id: 'created', name: 'Date de création' },
    { id: 'price_asc', name: 'Prix croissant' },
    { id: 'price_desc', name: 'Prix décroissant' },
    { id: 'popularity', name: 'Popularité' }
  ];

  useEffect(() => {
    // Calculate analytics
    const totalOffers = offers.length;
    const activeOffers = offers.filter(o => o.status === 'available').length;
    const soldOffers = offers.filter(o => o.status === 'sold').length;
    const totalViews = offers.reduce((sum, o) => sum + (o.views || 0), 0);
    const totalRevenue = offers
      .filter(o => o.status === 'sold')
      .reduce((sum, o) => sum + (o.price * (o.quantity || 0)), 0);
    const averageRating = offers.reduce((sum, o) => sum + (o.rating || 0), 0) / totalOffers || 0;

    setAnalytics({
      totalOffers,
      activeOffers,
      soldOffers,
      totalViews,
      totalRevenue,
      averageRating
    });
  }, [offers]);

  useEffect(() => {
    let filtered = offers;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.name.toLowerCase().includes(query) ||
        offer.description?.toLowerCase().includes(query) ||
        offer.producer.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(offer => offer.category === categoryFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    }

    setFilteredOffers(filtered);
  }, [offers, searchQuery, statusFilter, categoryFilter, sortBy]);

  const handleOfferCreated = (productData: Omit<Product, 'id'>) => {
    const newProduct = {
      ...productData,
      id: `PROD${Date.now()}`,
      views: 0,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString()
    } as Product;

    setOffers(prev => [newProduct, ...prev]);
    setShowCreateOffer(false);
  };

  const handleOfferDeleted = (offerId: string) => {
    setOffers(prev => prev.filter(o => o.id !== offerId));
  };

  const handleOfferStatusChanged = (offerId: string, newStatus: string) => {
    setOffers(prev =>
      prev.map(o =>
        o.id === offerId ? { ...o, status: newStatus as Product['status'] } : o
      )
    );
  };

  const getStatusBadge = (status: Product['status']) => {
    const statusConfig = {
      available: { label: 'Disponible', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      sold: { label: 'Épuisé', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => fc(amount);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des offres</h1>
              <p className="text-gray-600">Gérez vos produits et suivez vos performances</p>
            </div>
            <Dialog open={showCreateOffer} onOpenChange={setShowCreateOffer}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle offre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle offre</DialogTitle>
                </DialogHeader>
                <ProductPublication
                  onProductPublished={handleOfferCreated}
                  onCancel={() => setShowCreateOffer(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total offres</p>
                    <p className="text-2xl font-bold">{analytics.totalOffers}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Offres actives</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.activeOffers}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Vues totales</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(analytics.totalViews)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenus</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.totalRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offers List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Vos offres ({filteredOffers.length})</h2>

            {filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {offers.length === 0 ? "Vous n'avez aucune offre" : "Aucune offre trouvée"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {offers.length === 0
                      ? "Commencez par créer votre première offre"
                      : "Essayez de modifier vos filtres"
                    }
                  </p>
                  {offers.length === 0 && (
                    <Button onClick={() => setShowCreateOffer(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une offre
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredOffers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{offer.name}</h3>
                          {getStatusBadge(offer.status)}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{offer.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Prix:</span>
                            <span className="ml-1 font-medium">{formatCurrency(offer.price)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Stock:</span>
                            <span className="ml-1 font-medium">{offer.quantity} {offer.unit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Vues:</span>
                            <span className="ml-1 font-medium">{formatNumber(offer.views || 0)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Note:</span>
                            <span className="ml-1 font-medium">
                              {offer.rating ? `${offer.rating}/5` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOfferDeleted(offer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Performance indicators */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1 text-gray-500" />
                            <span>{formatNumber(offer.views || 0)} vues</span>
                          </div>
                          <div className="flex items-center">
                            <BarChart3 className="h-3 w-3 mr-1 text-gray-500" />
                            <span>
                              {offer.rating ? `${offer.rating}/5` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {offer.status === 'available' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOfferStatusChanged(offer.id, 'sold')}
                            >
                              Marquer épuisé
                            </Button>
                          )}
                          {offer.status === 'sold' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOfferStatusChanged(offer.id, 'available')}
                            >
                              Rendre disponible
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Performance Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Performance</h2>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taux de vente</span>
                    <span>
                      {analytics.totalOffers > 0
                        ? `${Math.round((analytics.soldOffers / analytics.totalOffers) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  <Progress
                    value={analytics.totalOffers > 0 ? (analytics.soldOffers / analytics.totalOffers) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(analytics.totalViews)}
                    </div>
                    <div className="text-xs text-gray-600">Vues totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {analytics.averageRating.toFixed(1)}/5
                    </div>
                    <div className="text-xs text-gray-600">Note moyenne</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    offers.reduce((acc, offer) => {
                      acc[offer.category] = (acc[offer.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une offre
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Voir les tendances
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferManagementDashboard;
