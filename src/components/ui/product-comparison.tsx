import { useState, useMemo } from 'react';
import { Product } from '@/types';
import { useReview } from '@/contexts/ReviewContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency } from '@/lib/utils';
import {
  Star,
  Scale,
  Check,
  X,
  ArrowRight,
  MapPin,
  Calendar,
  ShoppingCart,
  Eye,
  Plus,
  Minus
} from 'lucide-react';

interface ProductComparisonProps {
  products: Product[];
  maxProducts?: number;
}

interface ComparisonProduct extends Product {
  rating?: {
    average_rating: number;
    total_reviews: number;
  };
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  products: availableProducts,
  maxProducts = 4
}) => {
  const { getProductRating } = useReview();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const comparisonProducts: ComparisonProduct[] = useMemo(() => {
    return selectedProducts
      .map(id => availableProducts.find(p => p.id === id))
      .filter(Boolean)
      .map(product => ({
        ...product!,
        rating: getProductRating(product!.id)
      }));
  }, [selectedProducts, availableProducts, getProductRating]);

  const comparisonData = useMemo(() => {
    if (comparisonProducts.length === 0) return null;

    const categories = [
      { key: 'name', label: 'Nom du produit', type: 'text' },
      { key: 'category', label: 'Catégorie', type: 'category' },
      { key: 'producer', label: 'Producteur', type: 'text' },
      { key: 'location', label: 'Localisation', type: 'location' },
      { key: 'price', label: 'Prix', type: 'price' },
      { key: 'quantity', label: 'Quantité disponible', type: 'quantity' },
      { key: 'harvest_date', label: 'Date de récolte', type: 'date' },
      { key: 'rating', label: 'Note moyenne', type: 'rating' },
      { key: 'reviews', label: 'Nombre d\'avis', type: 'number' },
      { key: 'status', label: 'Statut', type: 'status' }
    ];

    return categories.map(category => {
      const values = comparisonProducts.map(product => {
        switch (category.key) {
          case 'name':
            return product.name;
          case 'category':
            return product.category;
          case 'producer':
            return product.producer;
          case 'location':
            return product.location;
          case 'price':
            return product.price;
          case 'quantity':
            return `${product.quantity} ${product.unit}`;
          case 'harvest_date':
            return product.harvest_date ? new Date(product.harvest_date).toLocaleDateString('fr-FR') : 'Non spécifiée';
          case 'rating':
            return product.rating?.average_rating || 0;
          case 'reviews':
            return product.rating?.total_reviews || 0;
          case 'status':
            return product.status;
          default:
            return '';
        }
      });

      return {
        ...category,
        values
      };
    });
  }, [comparisonProducts]);

  const getBestValue = (category: string) => {
    if (!comparisonData) return null;

    const categoryData = comparisonData.find(c => c.key === category);
    if (!categoryData) return null;

    switch (category) {
      case 'price':
        return Math.min(...categoryData.values.filter(v => typeof v === 'number'));
      case 'rating':
        return Math.max(...categoryData.values.filter(v => typeof v === 'number'));
      case 'reviews':
        return Math.max(...categoryData.values.filter(v => typeof v === 'number'));
      case 'quantity':
        return Math.max(...categoryData.values.map(v => {
          if (typeof v === 'string') {
            const match = v.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }
          return 0;
        }));
      default:
        return null;
    }
  };

  const isBestValue = (category: string, value: number | string, index: number) => {
    const best = getBestValue(category);
    if (best === null || best === undefined) return false;

    switch (category) {
      case 'rating':
      case 'reviews':
        return value === best;
      case 'price':
        return value === best;
      case 'quantity':
        return value >= best;
      default:
        return false;
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'sold':
        return <Badge variant="destructive">Épuisé</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-100 text-yellow-800">Réservé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < maxProducts) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const renderComparisonValue = (category: string, value: number | string, index: number) => {
    const isBest = isBestValue(category, value, index);

    switch (category) {
      case 'price':
        return (
          <div className="flex items-center justify-center">
            <span className={`text-lg font-bold ${isBest ? 'text-green-600' : ''}`}>
              {formatCurrency(value)}
            </span>
            {isBest && <Badge className="ml-2 bg-green-100 text-green-800">Meilleur prix</Badge>}
          </div>
        );

      case 'rating':
        return (
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className={`font-medium ${isBest ? 'text-green-600' : ''}`}>
                {value.toFixed(1)}
              </span>
            </div>
            {isBest && <Badge className="ml-2 bg-green-100 text-green-800">Meilleure note</Badge>}
          </div>
        );

      case 'reviews':
        return (
          <div className="flex items-center justify-center">
            <span className={isBest ? 'text-green-600 font-medium' : ''}>
              {value} avis
            </span>
            {isBest && <Badge className="ml-2 bg-green-100 text-green-800">Plus populaire</Badge>}
          </div>
        );

      case 'category':
        return (
          <Badge variant="outline" className="justify-center">
            {getCategoryName(value)}
          </Badge>
        );

      case 'status':
        return getStatusBadge(value);

      default:
        return <span className={isBest ? 'text-green-600 font-medium' : ''}>{value}</span>;
    }
  };

  if (comparisonProducts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Scale className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sélectionnez des produits à comparer
          </h3>
          <p className="text-gray-500">
            Choisissez jusqu'à {maxProducts} produits pour les comparer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scale className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Comparaison de produits</h3>
          <Badge variant="outline">{comparisonProducts.length}/{maxProducts}</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedProducts([])}
        >
          Effacer la sélection
        </Button>
      </div>

      {/* Products Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {comparisonProducts.map((product, index) => (
          <Card key={product.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{product.producer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleProduct(product.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                    <span className="text-green-600 text-sm font-medium">
                      {product.category.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(product.price)}
                  <span className="text-xs text-gray-500 ml-1">/ {product.unit}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {product.rating?.average_rating.toFixed(1) || '0'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({product.rating?.total_reviews || 0})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 w-48">
                    Caractéristique
                  </th>
                  {comparisonProducts.map((product, index) => (
                    <th key={product.id} className="text-center py-3 px-4 font-medium text-gray-900">
                      Produit {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonData?.map((row, rowIndex) => (
                  <tr key={row.key} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 font-medium text-gray-700 border-r">
                      {row.label}
                    </td>
                    {row.values.map((value, valueIndex) => (
                      <td key={valueIndex} className="py-3 px-4 text-center border-r last:border-r-0">
                        {renderComparisonValue(row.key, value, valueIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add to Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Ajouter un produit à la comparaison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableProducts
              .filter(product => !selectedProducts.includes(product.id))
              .slice(0, 6)
              .map(product => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleProduct(product.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox checked={false} readOnly />
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.producer}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(product.price)}</div>
                    <div className="text-xs text-gray-500">{product.unit}</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};