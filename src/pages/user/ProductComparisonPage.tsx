import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProductComparison } from '@/components/ui/product-comparison';
import { ProductCard } from '@/components/ui/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockProducts } from '@/data/products';
import { Product } from '@/types';
import {
  Scale,
  Search,
  Filter,
  Grid,
  List,
  Heart,
  Star,
  ShoppingCart,
  Plus,
  X,
  ArrowLeft
} from 'lucide-react';

export const ProductComparisonPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showComparison, setShowComparison] = useState(false);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = !searchQuery.trim() ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.producer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'Toutes les catégories', count: mockProducts.length },
    { id: 'fruits', name: 'Fruits', count: mockProducts.filter(p => p.category === 'fruits').length },
    { id: 'legumes', name: 'Légumes', count: mockProducts.filter(p => p.category === 'legumes').length },
    { id: 'volaille', name: 'Volaille', count: mockProducts.filter(p => p.category === 'volaille').length },
    { id: 'poissons', name: 'Poissons', count: mockProducts.filter(p => p.category === 'poissons').length },
    { id: 'cereales', name: 'Céréales', count: mockProducts.filter(p => p.category === 'cereales').length },
  ];

  const comparisonProducts = mockProducts.filter(product => selectedProducts.includes(product.id));

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < 4) {
        return [...prev, productId];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedProducts([]);
    setShowComparison(false);
  };

  const startComparison = () => {
    if (selectedProducts.length >= 2) {
      setShowComparison(true);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Scale className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connectez-vous pour comparer des produits
            </h3>
            <p className="text-gray-500 mb-4">
              Comparez les caractéristiques des produits pour faire le meilleur choix.
            </p>
            <Button asChild>
              <a href="/login">Se connecter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showComparison) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setShowComparison(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux produits
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Comparaison de produits</h1>
            <p className="text-gray-600">
              Comparez les caractéristiques détaillées de vos produits sélectionnés.
            </p>
          </div>

          <ProductComparison products={comparisonProducts} maxProducts={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Comparateur de produits</h1>
          <p className="text-gray-600">
            Sélectionnez jusqu'à 4 produits pour comparer leurs caractéristiques.
          </p>
        </div>

        {/* Selection Bar */}
        {selectedProducts.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} sélectionné{selectedProducts.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {selectedProducts.length}/4
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer
                  </Button>
                  <Button
                    onClick={startComparison}
                    disabled={selectedProducts.length < 2}
                    size="sm"
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    Comparer ({selectedProducts.length})
                  </Button>
                </div>
              </div>

              {/* Selected Products Preview */}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedProducts.map(productId => {
                  const product = mockProducts.find(p => p.id === productId);
                  return product ? (
                    <div
                      key={productId}
                      className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border"
                    >
                      <span className="text-sm font-medium">{product.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProductSelection(productId)}
                        className="h-5 w-5 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Produits disponibles
            </h2>
            <Badge variant="outline">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
            </Badge>
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos critères de recherche.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard
                    product={product}
                    showAddToCart={false}
                  />

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 right-2">
                    <div className={`p-2 rounded-full transition-all ${
                      selectedProducts.includes(product.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 shadow-md opacity-0 group-hover:opacity-100'
                    }`}>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                        className="sr-only"
                      />
                      {selectedProducts.includes(product.id) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedProducts.includes(product.id) && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Comparison Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Comment comparer efficacement ?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Sélectionnez vos produits</h4>
                <p className="text-sm text-gray-600">
                  Cliquez sur le + pour ajouter des produits à votre comparaison (maximum 4).
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Comparez les caractéristiques</h4>
                <p className="text-sm text-gray-600">
                  Prix, qualité, disponibilité, notes des autres utilisateurs.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Faites le bon choix</h4>
                <p className="text-sm text-gray-600">
                  Les meilleurs produits sont automatiquement mis en évidence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};