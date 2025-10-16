import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketplaceHeader } from '@/components/ui/marketplace-header';
import { ProductCard } from '@/components/ui/product-card';
import { MobileOptimizedProductCard } from '@/components/ui/mobile-optimized-product-card';
import MobileMarketplace from '@/components/ui/mobile-marketplace';
import { AdvancedSearch } from '@/components/ui/advanced-search';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts } from '@/data/products';
import { Product } from '@/types';
import { Search, Filter, Grid, List, Star, MapPin, Heart, Settings, Truck, Package, Megaphone, Mic, Link } from 'lucide-react';
import DeliveryTracking from '@/components/marketplace/delivery-tracking/DeliveryTracking';
import DeliveryManagement from '@/components/marketplace/delivery-tracking/DeliveryManagement';
import MarketingDashboard from '@/components/marketplace/marketing/MarketingDashboard';
import VoiceInterface from '@/components/marketplace/voice/VoiceInterface';
import SystemIntegrations from '@/components/marketplace/integrations/SystemIntegrations';

interface AdvancedFilters {
  location?: string;
  priceRange?: [number, number];
  minRating?: number;
  availableOnly?: boolean;
}

// Animation variants
const fadeInUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const fadeInDown = {
  hidden: { y: -30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const scaleIn = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const Marketplace = () => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters | null>(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [activeTab, setActiveTab] = useState('products');

  const categories = [
    { id: 'all', name: 'Toutes les catégories', count: mockProducts.length },
    { id: 'fruits', name: 'Fruits', count: mockProducts.filter(p => p.category === 'fruits').length },
    { id: 'legumes', name: 'Légumes', count: mockProducts.filter(p => p.category === 'legumes').length },
    { id: 'volaille', name: 'Volaille', count: mockProducts.filter(p => p.category === 'volaille').length },
    { id: 'poissons', name: 'Poissons', count: mockProducts.filter(p => p.category === 'poissons').length },
    { id: 'cereales', name: 'Céréales', count: mockProducts.filter(p => p.category === 'cereales').length },
  ];

  useEffect(() => {
    let products = mockProducts;

    // Apply user preferences filter if user is logged in
    if (user && preferences && preferences.favorite_categories.length > 0) {
      // Highlight favorite categories but don't filter out others completely
      // This is for future enhancement when we implement personalized sorting
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      products = products.filter(product => product.category === selectedCategory);
    }

    // Apply search filter (simple search for header)
    if (searchQuery.trim() && !advancedFilters) {
      const query = searchQuery.toLowerCase();
      products = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.producer.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
      );
    }

    // Apply advanced filters if available
    if (advancedFilters) {
      // Apply location filter
      if (advancedFilters.location) {
        products = products.filter(product =>
          product.location.toLowerCase().includes(advancedFilters.location.toLowerCase())
        );
      }

      // Apply price range filter
      if (advancedFilters.priceRange) {
        products = products.filter(product =>
          product.price >= advancedFilters.priceRange[0] &&
          product.price <= advancedFilters.priceRange[1]
        );
      }

      // Apply rating filter
      if (advancedFilters.minRating) {
        products = products.filter(product => {
          const rating = getProductRating(product.id);
          return rating && rating.average_rating >= advancedFilters.minRating;
        });
      }

      // Apply availability filter
      if (advancedFilters.availableOnly) {
        products = products.filter(product => product.status === 'available');
      }
    }

    setFilteredProducts(products);
  }, [searchQuery, selectedCategory, advancedFilters, user, preferences]);

  const getProductRating = (productId: string) => {
    // Mock rating data - would come from ReviewContext in real implementation
    const ratings = {
      '1': { average_rating: 4.5, total_reviews: 24 },
      '2': { average_rating: 4.2, total_reviews: 18 },
      '3': { average_rating: 4.0, total_reviews: 15 },
      '4': { average_rating: 4.7, total_reviews: 31 },
      '5': { average_rating: 4.3, total_reviews: 22 },
      '6': { average_rating: 4.1, total_reviews: 19 },
      '7': { average_rating: 4.4, total_reviews: 28 },
      '8': { average_rating: 4.6, total_reviews: 35 },
      '9': { average_rating: 4.2, total_reviews: 21 },
      '10': { average_rating: 4.8, total_reviews: 27 },
      '11': { average_rating: 4.0, total_reviews: 16 },
      '12': { average_rating: 4.5, total_reviews: 25 }
    };
    return ratings[productId as keyof typeof ratings] || { average_rating: 0, total_reviews: 0 };
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const featuredProducers = [
    { name: 'Kouadio Amani', location: 'Abidjan, Cocody', rating: 4.8, products: 12, image: '👨‍🌾' },
    { name: 'Amani Kouassi', location: 'Yamoussoukro', rating: 4.9, products: 8, image: '👩‍🌾' },
    { name: 'Fatou Traoré', location: 'Bouaké', rating: 4.7, products: 15, image: '👩‍🌾' },
    { name: 'Yao N\'Guessan', location: 'Korhogo', rating: 4.6, products: 6, image: '👨‍🌾' },
  ];

  // Use a dedicated mobile-optimized marketplace on small screens
  if (isMobile) {
    return <MobileMarketplace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader onSearch={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Produits</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Suivi des livraisons</span>
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Gestion des livraisons</span>
              </TabsTrigger>
              <TabsTrigger value="marketing" className="flex items-center space-x-2">
                <Megaphone className="h-4 w-4" />
                <span>Marketing & Promos</span>
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span>Assistant Vocal</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center space-x-2">
                <Link className="h-4 w-4" />
                <span>Intégrations</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
        {/* Hero Section */}
        <motion.div
          className="text-center space-y-4 mb-6 sm:mb-8 lg:mb-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900"
            variants={fadeInUp}
          >
            Le meilleur du marché ivoirien, à portée de main.
          </motion.h1>
          <motion.p
            className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-600 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Explorez les produits frais de nos producteurs locaux et soutenez l'économie de proximité.
          </motion.p>
        </motion.div>

        {/* Personalized Recommendations */}
        {user && preferences && (preferences.favorite_categories.length > 0 || preferences.preferred_producers.length > 0) && (
          <motion.div
            className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Heart className="h-5 w-5 text-red-500" />
                </motion.div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recommandations pour vous</h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="sm" asChild>
                  <a href="/user/preferences">
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Modifier les préférences</span>
                    <span className="sm:hidden">Préférences</span>
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            {preferences.favorite_categories.length > 0 && (
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Vos catégories préférées</h3>
                <motion.div
                  className="flex flex-wrap gap-2 mb-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {preferences.favorite_categories.map((categoryId) => {
                    const category = categories.find(c => c.id === categoryId);
                    return category ? (
                      <motion.div key={categoryId} variants={itemVariants}>
                        <Badge variant="secondary" className="px-3 py-1">
                          {category.name}
                        </Badge>
                      </motion.div>
                    ) : null;
                  })}
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {mockProducts
                    .filter(product => preferences.favorite_categories.includes(product.category))
                    .slice(0, 4)
                    .map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                          product={product}
                          showAddToCart={true}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              </motion.div>
            )}

            {preferences.preferred_producers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Vos producteurs préférés</h3>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {mockProducts
                    .filter(product => preferences.preferred_producers.includes(product.producer.toLowerCase().replace(/\s+/g, '-')))
                    .slice(0, 4)
                    .map((product) => (
                      <motion.div key={product.id} variants={itemVariants}>
                        <ProductCard
                          product={product}
                          showAddToCart={true}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Filters and Controls */}
        <motion.div
          className="bg-white rounded-lg shadow-sm p-3 sm:p-6 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Mobile quick search */}
          <motion.div
            className="block md:hidden mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher des produits, producteurs..."
                className="pl-10 pr-4"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full lg:w-auto">
              {/* Category Filter */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48 lg:w-48">
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
              </motion.div>

              {/* Advanced Search */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <AdvancedSearch
                  onSearchResults={setFilteredProducts}
                  onFiltersChange={setAdvancedFilters}
                >
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Filtres avancés</span>
                    <span className="sm:hidden">Filtres</span>
                  </Button>
                </AdvancedSearch>
              </motion.div>
            </div>

            {/* View Mode */}
            <motion.div
              className="flex items-center space-x-2 self-end sm:self-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {['grid', 'list'].map((mode) => (
                <motion.div key={mode} variants={itemVariants}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant={viewMode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode(mode as 'grid' | 'list')}
                      className="p-2"
                    >
                      {mode === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Results */}
        <motion.div
          className="mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-sm sm:text-base text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
            {searchQuery && !advancedFilters && ` pour "${searchQuery}"`}
            {selectedCategory !== 'all' && ` dans ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()}`}
            {advancedFilters && ' avec filtres avancés'}
          </p>
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key="products-grid"
              className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {isMobile ? (
                    <MobileOptimizedProductCard
                      product={product}
                      showAddToCart={true}
                    />
                  ) : (
                    <ProductCard
                      product={product}
                      showAddToCart={true}
                    />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-gray-400 mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Search className="h-16 w-16 mx-auto" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Producers Section */}
        <motion.section
          className="mt-8 sm:mt-12 lg:mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Producteurs à la Une
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuredProducers.map((producer, index) => (
              <motion.div key={producer.name} variants={itemVariants}>
                <motion.div
                  whileHover={{
                    y: -8,
                    scale: 1.02,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
                      <motion.div
                        className="text-2xl sm:text-3xl md:text-4xl"
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          delay: index * 0.2
                        }}
                      >
                        {producer.image}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base">{producer.name}</h3>
                        <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{producer.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{producer.rating}</span>
                          </Badge>
                        </motion.div>
                        <span className="text-xs text-gray-500">
                          {producer.products} produits
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
            </TabsContent>

            <TabsContent value="tracking" className="mt-6">
              <DeliveryTracking />
            </TabsContent>

            <TabsContent value="management" className="mt-6">
              <DeliveryManagement />
            </TabsContent>

            <TabsContent value="marketing" className="mt-6">
              <MarketingDashboard />
            </TabsContent>

            <TabsContent value="voice" className="mt-6">
              <VoiceInterface />
            </TabsContent>

            <TabsContent value="integrations" className="mt-6">
              <SystemIntegrations />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
