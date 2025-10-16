import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Star, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProducerOffer } from '@/types';
import { producerOfferService } from '@/services/producer/producerOfferService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';

interface PriceTrend {
  date: string;
  price: number;
  volume: number;
}

interface MarketPrice {
  product: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  market: string;
  quality: string;
  lastUpdate: string;
}

interface PriceAlert {
  id: string;
  product: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

const mockMarketPrices: MarketPrice[] = [
  {
    product: 'Cacao',
    currentPrice: 1200,
    previousPrice: 1150,
    change: 4.35,
    trend: 'up',
    market: 'Abidjan',
    quality: 'Premium',
    lastUpdate: '2024-01-15T10:30:00Z'
  },
  {
    product: 'Café',
    currentPrice: 2800,
    previousPrice: 2900,
    change: -3.45,
    trend: 'down',
    market: 'San Pedro',
    quality: 'Standard',
    lastUpdate: '2024-01-15T09:15:00Z'
  },
  {
    product: 'Anacarde',
    currentPrice: 850,
    previousPrice: 850,
    change: 0,
    trend: 'stable',
    market: 'Bouaké',
    quality: 'Bio',
    lastUpdate: '2024-01-15T11:00:00Z'
  }
];

const mockPriceTrends: PriceTrend[] = [
  { date: '2024-01-01', price: 1100, volume: 150 },
  { date: '2024-01-02', price: 1120, volume: 180 },
  { date: '2024-01-03', price: 1150, volume: 200 },
  { date: '2024-01-04', price: 1180, volume: 170 },
  { date: '2024-01-05', price: 1200, volume: 220 },
  { date: '2024-01-06', price: 1190, volume: 190 },
  { date: '2024-01-07', price: 1200, volume: 210 }
];

export function PriceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>(mockMarketPrices);
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>(mockPriceTrends);
  const [offers, setOffers] = useState<ProducerOffer[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [newOffer, setNewOffer] = useState({
    product: '',
    quantity: 0,
    unit: 'kg',
    price: 0,
    quality: 'Standard',
    description: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Charger les offres existantes
      const offersResponse = await producerOfferService.getOffersByProducer(user.id);
      if (offersResponse.success && offersResponse.data) {
        setOffers(offersResponse.data);
      }

      // Simuler le chargement des alertes de prix
      setPriceAlerts([
        {
          id: '1',
          product: 'Cacao',
          targetPrice: 1250,
          currentPrice: 1200,
          condition: 'above',
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateSuggestedPrice = (product: string, quality: string) => {
    const marketPrice = marketPrices.find(p => p.product === product && p.quality === quality);
    if (!marketPrice) return 0;

    // Suggestion basée sur le prix du marché avec une marge
    const basePrice = marketPrice.currentPrice;
    const qualityMultiplier = {
      'Standard': 1.0,
      'Premium': 1.2,
      'Bio': 1.35,
      'AOP': 1.5,
      'Label Rouge': 1.4
    };

    return Math.round(basePrice * (qualityMultiplier[quality as keyof typeof qualityMultiplier] || 1.0));
  };

  const handleCreateOffer = async () => {
    if (!user?.id) return;

    try {
      const suggestedPrice = calculateSuggestedPrice(newOffer.product, newOffer.quality);
      const offerData = {
        ...newOffer,
        producer_id: user.id,
        producer_name: user.name || 'Producteur',
        status: 'en_cours' as const,
        price: suggestedPrice,
        price_unit: `FCFA/${newOffer.unit}` as const
      };

      const response = await producerOfferService.createOffer(offerData);
      if (response.success) {
        await loadData();
        setShowPriceDialog(false);
        setNewOffer({
          product: '',
          quantity: 0,
          unit: 'kg',
          price: 0,
          quality: 'Standard',
          description: ''
        });
        toast({ title: 'Offre créée', description: `${offerData.product} • ${offerData.quantity} ${offerData.unit}` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Erreur lors de la création de l\'offre', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    }
  };

  const getPriceSuggestion = (product: string, quality: string) => {
    const suggested = calculateSuggestedPrice(product, quality);
    const marketPrice = marketPrices.find(p => p.product === product && p.quality === quality);

    if (!marketPrice) return null;

    const premium = suggested - marketPrice.currentPrice;
    const premiumPercent = (premium / marketPrice.currentPrice) * 100;

    return {
      suggested,
      market: marketPrice.currentPrice,
      premium,
      premiumPercent: premiumPercent.toFixed(1)
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 p-4 border rounded-lg">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 p-4 border rounded-lg">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <Skeleton className="h-6 w-56 mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Prix</h2>
          <p className="text-muted-foreground">Suivez les tendances du marché et fixez vos prix</p>
        </div>
        <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <DollarSign className="h-4 w-4" />
              Créer une offre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle offre</DialogTitle>
              <DialogDescription>
                Définissez les conditions de vente de vos produits en fonction des tendances du marché
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select
                    value={newOffer.product}
                    onValueChange={(value) => setNewOffer(prev => ({ ...prev, product: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Cacao', 'Café', 'Anacarde', 'Manioc', 'Igname'].map(product => (
                        <SelectItem key={product} value={product}>{product}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qualité</Label>
                  <Select
                    value={newOffer.quality}
                    onValueChange={(value) => setNewOffer(prev => ({ ...prev, quality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Bio">Bio</SelectItem>
                      <SelectItem value="AOP">AOP</SelectItem>
                      <SelectItem value="Label Rouge">Label Rouge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newOffer.product && newOffer.quality && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Suggestion de prix</span>
                    </div>
                    {(() => {
                      const suggestion = getPriceSuggestion(newOffer.product, newOffer.quality);
                      return suggestion ? (
                        <div className="space-y-1 text-sm">
                          <p>Prix marché actuel: <strong>{formatCurrency(suggestion.market)}</strong></p>
                          <p>Prix suggéré: <strong>{formatCurrency(suggestion.suggested)}</strong></p>
                          <p>Premium: <span className="text-green-600">+{suggestion.premiumPercent}%</span></p>
                        </div>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    value={newOffer.quantity}
                    onChange={(e) => setNewOffer(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    placeholder="Quantité"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unité</Label>
                  <Select
                    value={newOffer.unit}
                    onValueChange={(value) => setNewOffer(prev => ({ ...prev, unit: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="piece">pièce</SelectItem>
                      <SelectItem value="tonne">tonne</SelectItem>
                      <SelectItem value="sac">sac</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de votre offre..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateOffer} disabled={!newOffer.product || !newOffer.quantity}>
                  Créer l'offre
                </Button>
                <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Prix du Marché
            </CardTitle>
            <CardDescription>Prix actuels par produit et qualité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketPrices.map((price, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{price.product}</span>
                      <Badge variant="outline" className="text-xs">
                        {price.quality}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{price.market}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(price.currentPrice)}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(price.trend)}
                      <span className={getTrendColor(price.trend)}>
                        {formatPercentage(price.change)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendances des Prix
            </CardTitle>
            <CardDescription>Évolution des prix sur les 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Offres en cours</CardTitle>
          <CardDescription>Gérez vos offres actives sur le marché</CardDescription>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune offre en cours
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{offer.product}</span>
                      <Badge variant="outline">{offer.quality}</Badge>
                      <Badge variant={offer.status === 'en_cours' ? 'default' : 'secondary'}>
                        {offer.status === 'en_cours' ? 'Active' : offer.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {offer.quantity} {offer.unit} • {offer.price} {offer.price_unit}
                    </p>
                    {offer.description && (
                      <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(offer.price * offer.quantity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total potentiel
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes de Prix
          </CardTitle>
          <CardDescription>Configurez des alertes pour suivre les variations de prix</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium">{alert.product}</p>
                    <p className="text-sm text-muted-foreground">
                      Alert {alert.condition} {formatCurrency(alert.targetPrice)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(alert.currentPrice)}</p>
                  <p className="text-xs text-muted-foreground">Actuel</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
