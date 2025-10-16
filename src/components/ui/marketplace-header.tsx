import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CartDrawer } from '@/components/ui/cart-drawer';
import { Input } from '@/components/ui/input';
import { Search, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MarketplaceHeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  onSearch,
  showSearch = true
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span className="font-semibold text-sm sm:text-base">AgriMarket</span>
            </Button>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher des produits, producteurs..."
                  className="pl-10 pr-4"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart */}
            <CartDrawer />

            {/* Login Button */}
            {!user && (
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher des produits, producteurs..."
                className="pl-10 pr-4"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
