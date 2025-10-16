import { useState, useEffect, useMemo } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useReview } from '@/contexts/ReviewContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import { mockProducts } from '@/data/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/ui/product-card';
import {
  Sparkles,
  TrendingUp,
  Star,
  Heart,
  Clock,
  MapPin,
  Users,
  ArrowRight
} from 'lucide-react';

interface RecommendationEngineProps {
  maxProducts?: number;
  showTitle?: boolean;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  maxProducts = 12,
  showTitle = true
}) => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { getProductRating } = useReview();
  const [allRecommendations, setAllRecommendations] = useState<Product[]>([]);

  // Recommendation algorithm
  const recommendations = useMemo(() => {
    if (!user || !preferences) return [];

    let scoredProducts = mockProducts.map(product => ({
      product,
      score: 0,
      reasons: [] as string[]
    }));

    // Score based on favorite categories
    if (preferences.favorite_categories.length > 0) {
      scoredProducts.forEach(({ product, reasons }) => {
        if (preferences.favorite_categories.includes(product.category)) {
          scoredProducts = scoredProducts.map(item => {
            if (item.product.id === product.id) {
              return {
                ...item,
                score: item.score + 30,
                reasons: [...item.reasons, 'Catégorie préférée']
              };
            }
            return item;
          });
        }
      });
    }

    // Score based on preferred producers
    if (preferences.preferred_producers.length > 0) {
      scoredProducts.forEach(({ product, reasons }) => {
        const producerKey = product.producer.toLowerCase().replace(/\s+/g, '-');
        if (preferences.preferred_producers.includes(producerKey)) {
          scoredProducts = scoredProducts.map(item => {
            if (item.product.id === product.id) {
              return {
                ...item,
                score: item.score + 25,
                reasons: [...item.reasons, 'Producteur préféré']
              };
            }
            return item;
          });
        }
      });
    }

    // Score based on ratings
    scoredProducts.forEach(({ product, reasons }) => {
      const rating = getProductRating(product.id);
      if (rating && rating.average_rating >= 4.5) {
        scoredProducts = scoredProducts.map(item => {
          if (item.product.id === product.id) {
            return {
              ...item,
              score: item.score + 20,
              reasons: [...item.reasons, 'Produit très bien noté']
            };
          }
          return item;
        });
      }
    });

    // Score based on popularity (high number of reviews)
    scoredProducts.forEach(({ product, reasons }) => {
      const rating = getProductRating(product.id);
      if (rating && rating.total_reviews >= 20) {
        scoredProducts = scoredProducts.map(item => {
          if (item.product.id === product.id) {
            return {
              ...item,
              score: item.score + 15,
              reasons: [...item.reasons, 'Produit populaire']
            };
          }
          return item;
        });
      }
    });

    // Score based on availability
    scoredProducts.forEach(({ product, reasons }) => {
      if (product.status === 'available' && product.quantity > 5) {
        scoredProducts = scoredProducts.map(item => {
          if (item.product.id === product.id) {
            return {
              ...item,
              score: item.score + 10,
              reasons: [...item.reasons, 'Disponible en stock']
            };
          }
          return item;
        });
      }
    });

    // Score based on recency (recently "harvested" products)
    scoredProducts.forEach(({ product, reasons }) => {
      if (product.harvest_date) {
        const harvestDate = new Date(product.harvest_date);
        const daysSinceHarvest = Math.floor((Date.now() - harvestDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceHarvest <= 7) {
          scoredProducts = scoredProducts.map(item => {
            if (item.product.id === product.id) {
              return {
                ...item,
                score: item.score + 10,
                reasons: [...item.reasons, 'Récolte récente']
              };
            }
            return item;
          });
        }
      }
    });

    // Sort by score and filter
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, maxProducts);
  }, [user, preferences, getProductRating, maxProducts]);

  // Get top recommendations by category
  const recommendationsByCategory = useMemo(() => {
    const categories = ['fruits', 'legumes', 'volaille', 'poissons', 'cereales'];
    const result: Record<string, Product[]> = {};

    categories.forEach(category => {
      const categoryProducts = recommendations
        .filter(item => item.product.category === category)
        .slice(0, 4)
        .map(item => item.product);

      if (categoryProducts.length > 0) {
        result[category] = categoryProducts;
      }
    });

    return result;
  }, [recommendations]);

  // Get trending products (high scoring, recently popular)
  const trendingProducts = useMemo(() => {
    return recommendations
      .filter(item => item.score >= 50)
      .slice(0, 6)
      .map(item => item.product);
  }, [recommendations]);

  const getCategoryName = (category: string) => {
    const names = {
      fruits: 'Fruits',
      legumes: 'Légumes',
      volaille: 'Volaille',
      poissons: 'Poissons',
      cereales: 'Céréales'
    };
    return names[category as keyof typeof names] || category;
  };

  if (!user || !preferences) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connectez-vous pour des recommandations personnalisées
          </h3>
          <p className="text-gray-500">
            Découvrez des produits adaptés à vos préférences.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Personnalisez votre expérience
          </h3>
          <p className="text-gray-500 mb-4">
            Définissez vos préférences pour recevoir des recommandations adaptées.
          </p>
          <Button asChild>
            <a href="/user/preferences">Configurer mes préférences</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommandations pour vous</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez nos sélections personnalisées basées sur vos préférences et vos intérêts.
          </p>
        </div>
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h3 className="text-xl font-semibold text-gray-900">Produits tendance</h3>
            </div>
            <Badge variant="secondary">
              {trendingProducts.length} produits
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showAddToCart={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations by Category */}
      {Object.keys(recommendationsByCategory).length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500" />
            <h3 className="text-xl font-semibold text-gray-900">Par catégorie</h3>
          </div>

          <div className="space-y-8">
            {Object.entries(recommendationsByCategory).map(([category, products]) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {getCategoryName(category)}
                  </h4>
                  <Badge variant="outline">
                    {products.length} produit{products.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showAddToCart={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-xl font-semibold text-gray-900">Toutes les recommandations</h3>
          </div>
          <Badge variant="secondary">
            {recommendations.length} produits
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map(({ product, score, reasons }) => (
            <div key={product.id} className="space-y-2">
              <ProductCard
                product={product}
                showAddToCart={true}
              />
              {reasons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {reasons.slice(0, 2).map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};