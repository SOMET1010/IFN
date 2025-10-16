import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useReview } from '@/contexts/ReviewContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ReviewSystem } from './review-system';
import {
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  Eye,
  Heart,
  ChevronRight
} from 'lucide-react';

interface MobileOptimizedProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  onQuickView?: () => void;
}

export const MobileOptimizedProductCard: React.FC<MobileOptimizedProductCardProps> = ({
  product,
  showAddToCart = true,
  onQuickView
}) => {
  const { addItem, setIsOpen } = useCart();
  const { getProductRating } = useReview();
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const rating = getProductRating(product.id);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    addItem(product);
    setIsAdding(false);
    setIsOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      fruits: 'bg-orange-100 text-orange-800',
      legumes: 'bg-green-100 text-green-800',
      volaille: 'bg-yellow-100 text-yellow-800',
      poissons: 'bg-blue-100 text-blue-800',
      cereales: 'bg-amber-100 text-amber-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      fruits: 'Fruits',
      legumes: 'Légumes',
      volaille: 'Volaille',
      poissons: 'Poissons',
      cereales: 'Céréales'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 active:scale-[0.98] overflow-hidden">
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
              <span className="text-green-600 text-sm font-medium">
                {product.category.toUpperCase()}
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={getCategoryColor(product.category)}>
              {getCategoryLabel(product.category)}
            </Badge>
          </div>

          {/* Status Overlay */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-3 py-1">
                Épuisé
              </Badge>
            </div>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 backdrop-blur-sm"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </h3>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-gray-500">
                par {product.unit}
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {rating?.average_rating || 0}
              </span>
              <span className="text-xs text-gray-500">
                ({rating?.total_reviews || 0})
              </span>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Disponible:</span>
            <span className="font-medium text-gray-900">
              {product.quantity} {product.unit}
            </span>
          </div>

          {/* Location and Producer */}
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{product.location}</span>
          </div>

          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium">Par:</span>
            <span className="ml-1 line-clamp-1">{product.producer}</span>
          </div>

          {/* Expandable Details */}
          <div className={`space-y-2 overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            {product.harvest_date && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Récolté le {new Date(product.harvest_date).toLocaleDateString('fr-FR')}</span>
              </div>
            )}

            {product.description && (
              <p className="text-xs text-gray-600 line-clamp-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between p-0 h-auto"
          >
            <span className="text-sm">
              {isExpanded ? 'Voir moins' : 'Voir plus'}
            </span>
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Action Buttons */}
        {showAddToCart && (
          <div className="flex gap-3 mt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 min-w-0 px-2 sm:px-3 border-2 hover:bg-gray-50 transition-colors duration-200"
                  size="sm"
                  aria-label={`Voir les détails de ${product.name}`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Voir détails</span>
                  <span className="hidden sm:inline ml-2">Voir détails</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="h-56 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                        <span className="text-2xl text-gray-400">{product.category.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    {product.description && (
                      <p className="text-gray-700">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Prix</span>
                      <span className="font-semibold text-green-600">{formatCurrency(product.price)} / {product.unit}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{product.location}</span>
                    </div>
                    {product.harvest_date && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Récolté le {new Date(product.harvest_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Disponible</span>
                      <span className="font-medium">{product.quantity} {product.unit}</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="flex-1 min-w-0 px-2 sm:px-3 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleAddToCart}
                    disabled={product.status === 'sold' || isAdding}
                    size="sm"
                    aria-label={product.status === 'sold' ? 'Ce produit est épuisé' : `Ajouter ${product.name} au panier`}
                    aria-disabled={product.status === 'sold' || isAdding}
                  >
                    {isAdding ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Ajout...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2 shrink-0" />
                        <span className="sm:hidden">{product.status === 'sold' ? 'Épuisé' : 'Ajouter'}</span>
                        <span className="hidden sm:inline truncate">{product.status === 'sold' ? 'Épuisé' : 'Ajouter au panier'}</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{product.status === 'sold' ? 'Ce produit est actuellement épuisé' : `Ajouter ${product.name} à votre panier`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
