import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Promotion } from '@/types/merchant';
import { MerchantPromotionService } from '@/services/merchant/merchantPromotionService';
import { Tag, Percent, Calculator, Calendar, Plus, Edit, Trash2, Gift } from 'lucide-react';

interface PromotionManagerProps {
  onPromotionApplied?: (promotion: Promotion) => void;
}

export default function PromotionManager({ onPromotionApplied }: PromotionManagerProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  const promotionService = MerchantPromotionService.getInstance();

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    setError(null);
    try {
      const activePromotions = await promotionService.getActivePromotions();
      setPromotions(activePromotions);
    } catch (err) {
      setError('Erreur lors du chargement des promotions');
      console.error('Error loading promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPromotionTypeText = (type: string) => {
    switch (type) {
      case 'percentage': return 'Pourcentage';
      case 'fixed': return 'Montant fixe';
      case 'buy_x_get_y': return 'Achetez X, Y à prix réduit';
      default: return type;
    }
  };

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed': return <Calculator className="h-4 w-4" />;
      case 'buy_x_get_y': return <Gift className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getConditionText = (condition: Record<string, unknown>) => {
    switch (condition.type) {
      case 'min_quantity':
        return `Minimum ${condition.value} articles`;
      case 'min_amount':
        return `Minimum ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(condition.value)}`;
      case 'customer_loyalty':
        return `${condition.value}+ points fidélité`;
      case 'time_restricted':
        return `Avant ${condition.value}h`;
      default:
        return condition.type;
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    return now >= promotion.startDate && now <= promotion.endDate && promotion.isActive;
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div>Chargement des promotions...</div>
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Gestion des Promotions
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer une promotion
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Promotions Actives ({promotions.length})</TabsTrigger>
              <TabsTrigger value="calculator">Calculateur de Remises</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {promotions.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Aucune promotion active actuellement.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promotion) => (
                    <Card key={promotion.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getPromotionTypeIcon(promotion.type)}
                                <h3 className="font-semibold">{promotion.name}</h3>
                              </div>
                              <Badge variant="outline">
                                {getPromotionTypeText(promotion.type)}
                              </Badge>
                              <Badge className={isPromotionActive(promotion) ? 'bg-green-500' : 'bg-red-500'}>
                                {isPromotionActive(promotion) ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>

                            <p className="text-gray-600 text-sm">{promotion.description}</p>

                            <div className="space-y-2">
                              <div className="text-sm font-medium">Conditions:</div>
                              <div className="flex flex-wrap gap-2">
                                {promotion.conditions.map((condition, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {getConditionText(condition)}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Du {new Date(promotion.startDate).toLocaleDateString()}
                                  au {new Date(promotion.endDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                {getDaysRemaining(promotion.endDate) > 0 ? (
                                  <span className="text-orange-600">
                                    {getDaysRemaining(promotion.endDate)} jours restants
                                  </span>
                                ) : (
                                  <span className="text-red-600">Expirée</span>
                                )}
                              </div>
                            </div>

                            {promotion.applicableProducts.length > 0 && (
                              <div>
                                <div className="text-sm font-medium mb-1">Produits concernés:</div>
                                <div className="flex flex-wrap gap-1">
                                  {promotion.applicableProducts.map((productId) => (
                                    <Badge key={productId} variant="outline" className="text-xs">
                                      {productId}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => onPromotionApplied?.(promotion)}
                              disabled={!isPromotionActive(promotion)}
                            >
                              Appliquer
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calculator">
              <Card>
                <CardHeader>
                  <CardTitle>Calculateur de Remises</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      Le calculateur de remises sera disponible prochainement.
                      Il permettra de simuler les promotions applicables en fonction du panier client
                      et des points de fidélité.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
