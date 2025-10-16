import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useReview } from '@/contexts/ReviewContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingCart, Star, MapPin, Calendar, MessageSquare, Eye } from 'lucide-react';
import { ReviewSystem } from './review-system';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showAddToCart = true
}) => {
  const { addItem, setIsOpen } = useCart();
  const { getProductRating } = useReview();
  const [isAdding, setIsAdding] = useState(false);

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
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      layout
    >
      <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <CardHeader className="p-0">
          <motion.div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            {product.image ? (
              <motion.img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.div
                className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-green-600 text-sm font-medium">
                  {product.category.toUpperCase()}
                </span>
              </motion.div>
            )}

            <motion.div
              className="absolute top-2 left-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge className={getCategoryColor(product.category)}>
                {getCategoryLabel(product.category)}
              </Badge>
            </motion.div>

            {product.status === 'sold' && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Badge variant="destructive" className="text-lg px-3 py-1">
                    Épuisé
                  </Badge>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </CardHeader>

      <CardContent className="p-4">
        <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <motion.h3
            className="font-semibold text-lg text-gray-900 line-clamp-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {product.name}
          </motion.h3>

          <motion.p
            className="text-sm text-gray-600 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {product.description || `Produit de qualité disponible chez ${product.producer}`}
          </motion.p>

          <motion.div
            className="flex items-center text-sm text-gray-500"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MapPin className="h-4 w-4 mr-1" />
            <span>{product.location}</span>
          </motion.div>

          {product.harvest_date && (
            <motion.div
              className="flex items-center text-sm text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Calendar className="h-4 w-4 mr-1" />
              <span>Récolté le {new Date(product.harvest_date).toLocaleDateString('fr-FR')}</span>
            </motion.div>
          )}

          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {rating?.average_rating || 0}
              </span>
              <span className="text-sm text-gray-500">
                ({rating?.total_reviews || 0})
              </span>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(product.price)}
              </p>
              <p className="text-xs text-gray-500">
                par {product.unit}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-between text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>Disponible:</span>
            <span className="font-medium">
              {product.quantity} {product.unit}
            </span>
          </motion.div>
        </motion.div>
      </CardContent>

      {showAddToCart && (
        <CardFooter className="flex-col items-stretch p-4 pt-0 space-y-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Button
              className="w-full font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleAddToCart}
              disabled={product.status === 'sold' || isAdding}
              size="lg"
              aria-label={product.status === 'sold' ? 'Ce produit est épuisé' : `Ajouter ${product.name} au panier`}
              aria-disabled={product.status === 'sold' || isAdding}
            >
              {isAdding ? (
                <>
                  <motion.div
                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Ajout...
                </>
              ) : (
                <>
                  <ShoppingCart className=" mr-2" />
                  {product.status === 'sold' ? 'Épuisé' : 'Ajouter au panier'}
                </>
              )}
            </Button>
          </motion.div>

          {/* Quick View and Reviews */}
          <motion.div
            className="w-full min-w-0 flex flex-col md:flex-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Dialog>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" className="w-full md:flex-1 min-w-0 truncate font-medium border-2 hover:bg-gray-50 transition-colors duration-200" aria-label={`Voir les détails de ${product.name}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Details */}
                  <div>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl text-gray-400">
                          {product.category.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">Description</h4>
                        <p className="text-gray-600 text-sm">
                          {product.description || `Produit de qualité disponible chez ${product.producer}`}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold">Producteur</h4>
                        <p className="text-gray-600 text-sm">{product.producer}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold">Localisation</h4>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{product.location}</span>
                        </div>
                      </div>

                      {product.harvest_date && (
                        <div>
                          <h4 className="font-semibold">Date de récolte</h4>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(product.harvest_date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold">Disponibilité</h4>
                        <p className="text-gray-600 text-sm">
                          {product.quantity} {product.unit} disponibles
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div>
                    <ReviewSystem
                      productId={product.id}
                      productName={product.name}
                      showWriteReview={true}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" className="w-full md:flex-1 min-w-0 truncate font-medium border-2 hover:bg-gray-50 transition-colors duration-200" aria-label={`Voir les avis pour ${product.name}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Avis {rating && rating.total_reviews > 0 ? `(${rating.total_reviews})` : ''}
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Avis pour {product.name}</DialogTitle>
                </DialogHeader>
                <ReviewSystem
                  productId={product.id}
                  productName={product.name}
                  showWriteReview={true}
                />
              </DialogContent>
            </Dialog>
          </motion.div>
        </CardFooter>
      )}
    </Card>
    </motion.div>
  );
};
