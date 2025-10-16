import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MerchantClient, ProductRecommendation } from '@/types/merchant';
import { MerchantClientService } from '@/services/merchant/merchantClientService';
import { Sparkles, TrendingUp, Star, Package, Plus } from 'lucide-react';

interface ProductRecommendationsProps {
  client: MerchantClient;
  onProductSelect?: (productId: string) => void;
  refreshTrigger?: number;
}

export default function ProductRecommendations({
  client,
  onProductSelect,
  refreshTrigger
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientService = MerchantClientService.getInstance();

  useEffect(() => {
    loadRecommendations();
  }, [client.id, refreshTrigger]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const recs = await clientService.getProductRecommendations(client.id);
      setRecommendations(recs);
    } catch (err) {
      setError('Erreur lors du chargement des recommandations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fruits': return '🍎';
      case 'légumes': return '🥬';
      case 'volaille': return '🍗';
      case 'poissons': return '🐟';
      case 'céréales': return '🌾';
      default: return '📦';
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Rupture', color: 'bg-red-500' };
    if (stock < 10) return { text: 'Stock bas', color: 'bg-orange-500' };
    if (stock < 50) return { text: 'Stock limité', color: 'bg-yellow-500' };
    return { text: 'Disponible', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div>Chargement des recommandations...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <Alert>
            <AlertDescription>
              Aucune recommandation disponible pour ce client.
              Le client n'a pas encore d'historique d'achats.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recommandations pour {client.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.slice(0, 6).map((recommendation) => {
            const stockStatus = getStockStatus(recommendation.stock);

            return (
              <div
                key={recommendation.productId}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {getCategoryIcon(recommendation.category)}
                      </span>
                      <h3 className="font-medium">{recommendation.productName}</h3>
                      <Badge className={getScoreColor(recommendation.score)}>
                        {(recommendation.score * 100).toFixed(0)}% match
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{recommendation.stock} en stock</span>
                        <Badge className={stockStatus.color}>
                          {stockStatus.text}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{formatCurrency(recommendation.price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-700">{recommendation.reason}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => onProductSelect?.(recommendation.productId)}
                    disabled={recommendation.stock === 0}
                    size="sm"
                    className="ml-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {recommendations.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              Voir plus de recommandations ({recommendations.length - 6} supplémentaires)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
