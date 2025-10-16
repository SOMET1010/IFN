import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { mockProducts } from '@/data/products';
import { Product } from '@/types';
import { Search, Filter, X, Star, MapPin } from 'lucide-react';

interface AdvancedSearchProps {
  onSearchResults: (results: Product[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  children: React.ReactNode;
}

interface SearchFilters {
  query: string;
  categories: string[];
  priceRange: [number, number];
  locations: string[];
  rating: number;
  availability: 'all' | 'available' | 'in_stock';
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearchResults,
  onFiltersChange,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categories: [],
    priceRange: [0, 5000],
    locations: [],
    rating: 0,
    availability: 'all',
    sortBy: 'relevance'
  });

  const categories = [
    { id: 'fruits', name: 'Fruits', count: mockProducts.filter(p => p.category === 'fruits').length },
    { id: 'legumes', name: 'Légumes', count: mockProducts.filter(p => p.category === 'legumes').length },
    { id: 'volaille', name: 'Volaille', count: mockProducts.filter(p => p.category === 'volaille').length },
    { id: 'poissons', name: 'Poissons', count: mockProducts.filter(p => p.category === 'poissons').length },
    { id: 'cereales', name: 'Céréales', count: mockProducts.filter(p => p.category === 'cereales').length },
  ];

  const locations = Array.from(new Set(mockProducts.map(p => p.location.split(',')[0])));

  const applyFilters = () => {
    let results = mockProducts;

    // Apply search query
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      results = results.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.producer.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
      );
    }

    // Apply categories
    if (filters.categories.length > 0) {
      results = results.filter(product => filters.categories.includes(product.category));
    }

    // Apply price range
    results = results.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply locations
    if (filters.locations.length > 0) {
      results = results.filter(product =>
        filters.locations.some(location => product.location.includes(location))
      );
    }

    // Apply rating (mock implementation)
    if (filters.rating > 0) {
      // In a real app, this would filter by actual product ratings
      results = results.filter(() => Math.random() > 0.3); // Mock 70% pass rate
    }

    // Apply availability
    if (filters.availability !== 'all') {
      results = results.filter(product => product.status === filters.availability);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort(() => Math.random() - 0.5); // Mock sorting by rating
        break;
      case 'newest':
        results.sort((a, b) => new Date(b.harvest_date || '').getTime() - new Date(a.harvest_date || '').getTime());
        break;
      default:
        // Keep relevance order
        break;
    }

    onSearchResults(results);
    onFiltersChange(filters);
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const updateFilters = (key: keyof SearchFilters, value: string | string[] | number | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    const categories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    updateFilters('categories', categories);
  };

  const toggleLocation = (location: string) => {
    const locations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    updateFilters('locations', locations);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categories: [],
      priceRange: [0, 5000],
      locations: [],
      rating: 0,
      availability: 'all',
      sortBy: 'relevance'
    });
  };

  const getActiveFiltersCount = () => {
    return (
      (filters.query ? 1 : 0) +
      filters.categories.length +
      filters.locations.length +
      (filters.rating > 0 ? 1 : 0) +
      (filters.availability !== 'all' ? 1 : 0) +
      (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000 ? 1 : 0)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Recherche Avancée
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Query */}
          <div>
            <Label htmlFor="search-query">Recherche</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="search-query"
                placeholder="Rechercher des produits, producteurs..."
                value={filters.query}
                onChange={(e) => updateFilters('query', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label>Catégories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="text-sm cursor-pointer">
                    {category.name} ({category.count})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label>Fourchette de prix</Label>
            <div className="mt-4">
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilters('priceRange', value as [number, number])}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-600">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(filters.priceRange[0])}
                </span>
                <span className="text-sm text-gray-600">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(filters.priceRange[1])}
                </span>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div>
            <Label>Localisations</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={location}
                    checked={filters.locations.includes(location)}
                    onCheckedChange={() => toggleLocation(location)}
                  />
                  <Label htmlFor={location} className="text-sm cursor-pointer">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating */}
            <div>
              <Label>Note minimale</Label>
              <Select value={filters.rating.toString()} onValueChange={(value) => updateFilters('rating', parseInt(value))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Toutes les notes</SelectItem>
                  <SelectItem value="3">3 étoiles et plus</SelectItem>
                  <SelectItem value="4">4 étoiles et plus</SelectItem>
                  <SelectItem value="4.5">4.5 étoiles et plus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability */}
            <div>
              <Label>Disponibilité</Label>
              <Select value={filters.availability} onValueChange={(value) => updateFilters('availability', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="available">Disponibles uniquement</SelectItem>
                  <SelectItem value="in_stock">En stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <Label>Trier par</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilters('sortBy', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Pertinence</SelectItem>
                <SelectItem value="price_low">Prix croissant</SelectItem>
                <SelectItem value="price_high">Prix décroissant</SelectItem>
                <SelectItem value="rating">Meilleures notes</SelectItem>
                <SelectItem value="newest">Plus récents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {getActiveFiltersCount() > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Filtres actifs</span>
                  <span className="text-sm text-gray-500">{getActiveFiltersCount()} filtre(s)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.query && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {filters.query}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters('query', '')} />
                    </Badge>
                  )}
                  {filters.categories.map(cat => (
                    <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                      {categories.find(c => c.id === cat)?.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                    </Badge>
                  ))}
                  {filters.locations.map(loc => (
                    <Badge key={loc} variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {loc}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => toggleLocation(loc)} />
                    </Badge>
                  ))}
                  {filters.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {filters.rating}+ étoiles
                      <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters('rating', 0)} />
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={applyFilters} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Appliquer les filtres
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
