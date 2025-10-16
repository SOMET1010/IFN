import { useState, useEffect, useMemo } from 'react';
import { MarketplaceHeader } from '@/components/ui/marketplace-header';
import { MobileOptimizedProductCard } from '@/components/ui/mobile-optimized-product-card';
import { AdvancedSearch } from '@/components/ui/advanced-search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts } from '@/data/products';
import { Product } from '@/types';
import { Search, Filter, Grid, List, TrendingUp, Star, MapPin, ArrowUp } from 'lucide-react';
import { debounce, throttle, initLazyLoading } from '@/lib/performance-utils';

const MobileMarketplace = () => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Initialize performance optimizations
  useEffect(() => {
    initLazyLoading();

    const handleScroll = throttle(() => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      setShowScrollTop(window.scrollY > 300);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add scrollbar-hide styles to the document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Optimized search with debouncing
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      // Search logic will be handled in the main filter function
    }, 300),
    []
  );

  const categories = [
    { id: 'all', name: 'Toutes', count: mockProducts.length },
    { id: 'fruits', name: 'Fruits', count: mockProducts.filter(p => p.category === 'fruits').length },
    { id: 'legumes', name: 'Légumes', count: mockProducts.filter(p => p.category === 'legumes').length },
    { id: 'volaille', name: 'Volaille', count: mockProducts.filter(p => p.category === 'volaille').length },
    { id: 'poissons', name: 'Poissons', count: mockProducts.filter(p => p.category === 'poissons').length },
    { id: 'cereales', name: 'Céréales', count: mockProducts.filter(p => p.category === 'cereales').length },
  ];

  // Optimized filtering with memoization
  useEffect(() => {
    let products = mockProducts;

    // Apply category filter
    if (selectedCategory !== 'all') {
      products = products.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.producer.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
      );
    }

    // Apply user preferences filter
    if (user && preferences && preferences.favorite_categories.length > 0) {
      // Boost favorite categories but don't filter completely
      const favoriteProducts = products.filter(p =>
        preferences.favorite_categories.includes(p.category)
      );
      const otherProducts = products.filter(p =>
        !preferences.favorite_categories.includes(p.category)
      );
      products = [...favoriteProducts, ...otherProducts];
    }

    setFilteredProducts(products);
    debouncedSearch(searchQuery);
  }, [searchQuery, selectedCategory, user, preferences, debouncedSearch]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickView = (productId: string) => {
    // Implement quick view functionality
    console.log('Quick view for product:', productId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <MarketplaceHeader onSearch={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Quick Categories */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex-shrink-0 whitespace-nowrap min-w-max"
              >
                <span className="hidden sm:inline">{category.name}</span>
                <span className="sm:hidden">{category.name.replace('Toutes les catégories', 'Toutes')}</span>
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        {user && preferences && preferences.favorite_categories.length > 0 && (
          <Card className="mb-4 sm:mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Pour vous</h3>
                <Badge variant="outline" className="bg-white text-xs sm:text-sm">
                  {preferences.favorite_categories.length} catégories
                </Badge>
              </div>
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {preferences.favorite_categories.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="whitespace-nowrap text-xs sm:text-sm">
                      {category.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm sm:text-base">
                {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AdvancedSearch
            onSearchResults={setFilteredProducts}
            onFiltersChange={() => {}}
          >
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtres avancés
            </Button>
          </AdvancedSearch>
        </div>

        {/* Trending Section */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <h3 className="font-semibold text-sm sm:text-base">Tendance</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              Voir tout
            </Button>
          </div>

          <div className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {filteredProducts
              .filter(p => p.status === 'available')
              .slice(0, 6)
              .map((product) => (
                <div key={product.id} className="flex-shrink-0 w-28 sm:w-32">
                  <div className="bg-white rounded-lg shadow-sm p-2 sm:p-3 hover:shadow-md transition-shadow">
                    <div className="h-16 sm:h-20 bg-gray-100 rounded mb-2 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                          <span className="text-green-600 text-xs font-medium">
                            {product.category.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium line-clamp-1">{product.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{product.producer}</p>
                    <p className="text-xs sm:text-sm font-bold text-green-600 mt-1">
                      {product.price} FCFA
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-3 sm:gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {filteredProducts.map((product) => (
            <MobileOptimizedProductCard
              key={product.id}
              product={product}
              showAddToCart={true}
              onQuickView={() => handleQuickView(product.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500 mb-4">
                Essayez de modifier vos critères de recherche.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {/* {filteredProducts.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Charger plus de produits
            </Button>
          </div>
        )} */}
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          variant="default"
          size="sm"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Bottom Navigation (Mobile) */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
          <div className="grid grid-cols-5 gap-1 p-2">
            <Button variant="ghost" size="sm" className="flex-col h-auto py-2 px-1">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-[10px] sm:text-xs">Accueil</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col h-auto py-2 px-1">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-[10px] sm:text-xs">Recherche</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col h-auto py-2 px-1">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-[10px] sm:text-xs">Favoris</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col h-auto py-2 px-1">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mb-1" />
              <span className="text-[10px] sm:text-xs">Tendance</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-col h-auto py-2 px-1">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[10px] sm:text-xs">Compte</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMarketplace;