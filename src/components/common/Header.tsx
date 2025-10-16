import { Bell, Globe, Mic, User, LayoutDashboard, Store, Menu, Leaf, Package, Truck, DollarSign, Users, TrendingUp, Warehouse, Shield, FileText, MessageSquare, Route, BarChart3, Activity, Monitor, Settings, HardDrive, Key, Lock, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import ivoireLogo from '@/assets/ivoire-logo.png';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showConnectionHeader?: boolean;
}

export const Header = ({ title, subtitle, showConnectionHeader = true }: HeaderProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getRoleName = (role: string) => {
    switch (role) {
      case 'producer': return 'AgriTrack';
      case 'merchant': return 'Ivoire Market';
      case 'cooperative': return 'Coopérative';
      case 'admin': return 'Administration';
      default: return 'Inclusion Numérique';
    }
  };

  const getNavigationTabs = () => {
    switch (user?.role) {
      case 'producer':
        return [
          { label: 'Tableau de bord', href: '/producer/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { label: 'Gestion des Prix', href: '/producer/price-management', icon: <DollarSign className="h-4 w-4" /> },
          { label: 'Production', href: '/producer/production-management', icon: <Leaf className="h-4 w-4" /> },
          { label: 'Récoltes', href: '/producer/harvests', icon: <Package className="h-4 w-4" /> },
          { label: 'Offres', href: '/producer/offers', icon: <Store className="h-4 w-4" /> },
          { label: 'Commandes', href: '/producer/order-management', icon: <Truck className="h-4 w-4" /> },
          { label: 'Ventes', href: '/producer/sales', icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'Revenus', href: '/producer/revenue', icon: <BarChart3 className="h-4 w-4" /> },
          { label: 'Assistant Vocal', href: '/producer/vocal-interface', icon: <Mic className="h-4 w-4" /> },
        ];
      case 'merchant':
        return [
          { label: 'Tableau de bord', href: '/merchant/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { label: 'Ventes', href: '/merchant/sales', icon: <Store className="h-4 w-4" /> },
          { label: 'Stocks', href: '/merchant/inventory', icon: <Store className="h-4 w-4" /> },
          { label: 'Commandes', href: '/merchant/orders', icon: <Store className="h-4 w-4" /> },
          { label: 'Paiements', href: '/merchant/payments', icon: <Store className="h-4 w-4" /> },
        ];
      case 'cooperative':
        return [
          { label: 'Tableau de bord', href: '/cooperative/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { label: 'Membres', href: '/cooperative/members', icon: <Users className="h-4 w-4" /> },
          { label: 'Commandes', href: '/cooperative/orders', icon: <Store className="h-4 w-4" /> },
          { label: 'Distribution', href: '/cooperative/distribution', icon: <Truck className="h-4 w-4" /> },
          { label: 'Finances', href: '/cooperative/finances', icon: <DollarSign className="h-4 w-4" /> },
          { label: 'Récoltes', href: '/cooperative/harvests', icon: <Leaf className="h-4 w-4" /> },
          { label: 'Stocks', href: '/cooperative/inventory', icon: <Package className="h-4 w-4" /> },
          { label: 'Planification', href: '/cooperative/planning', icon: <TrendingUp className="h-4 w-4" /> },
          { label: 'Qualité', href: '/cooperative/quality', icon: <Shield className="h-4 w-4" /> },
          { label: 'Subventions', href: '/cooperative/subsidies', icon: <FileText className="h-4 w-4" /> },
          { label: 'Crédits', href: '/cooperative/credits', icon: <DollarSign className="h-4 w-4" /> },
          { label: 'Assurance', href: '/cooperative/insurance', icon: <Shield className="h-4 w-4" /> },
          { label: 'Analytiques', href: '/cooperative/analytics', icon: <BarChart3 className="h-4 w-4" /> },
          { label: 'Entrepôts', href: '/cooperative/warehouses', icon: <Warehouse className="h-4 w-4" /> },
          { label: 'Tournées', href: '/cooperative/routes', icon: <Route className="h-4 w-4" /> },
          { label: 'Communication', href: '/cooperative/communication', icon: <MessageSquare className="h-4 w-4" /> },
        ];
      case 'admin':
        return [
          { label: 'Tableau de bord', href: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { label: 'Utilisateurs', href: '/admin/users', icon: <User className="h-4 w-4" /> },
          { label: 'Sécurité', href: '/admin/security', icon: <Shield className="h-4 w-4" /> },
          { label: 'Rapports', href: '/admin/reports', icon: <FileText className="h-4 w-4" /> },
          { label: 'Paramètres', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
          { label: 'Audit Logs', href: '/admin/audit-logs', icon: <Activity className="h-4 w-4" /> },
          { label: 'Monitoring', href: '/admin/system-monitoring', icon: <Monitor className="h-4 w-4" /> },
          { label: 'Notifications', href: '/admin/notifications', icon: <Bell className="h-4 w-4" /> },
          { label: 'Marketplace', href: '/admin/marketplace', icon: <Store className="h-4 w-4" /> },
          { label: 'Finances', href: '/admin/financial', icon: <DollarSign className="h-4 w-4" /> },
          { label: 'Sauvegardes', href: '/admin/backup', icon: <HardDrive className="h-4 w-4" /> },
          { label: 'Clés API', href: '/admin/api-keys', icon: <Key className="h-4 w-4" /> },
          { label: 'Permissions', href: '/admin/permissions', icon: <Lock className="h-4 w-4" /> },
          { label: 'Santé', href: '/admin/health', icon: <HeartPulse className="h-4 w-4" /> },
        ];
      default:
        return [];
    }
  };

  const tabs = getNavigationTabs();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Left: Logo + Titles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar trigger for cooperative */}
            {(user?.role === 'cooperative' || user?.role === 'admin') && (
              <SidebarTrigger className="h-8 w-8 sm:h-10 sm:w-10" />
            )}
            <img src={ivoireLogo} alt="Logo Côte d'Ivoire" className="h-8 w-8 sm:h-10 sm:w-10" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">
                {title || getRoleName(user?.role || '')}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Center: Desktop navigation */}
          {showConnectionHeader && user && user.role !== 'cooperative' && user.role !== 'admin' && (
            <nav aria-label="Navigation principale" className="hidden lg:flex flex-1 min-w-0 items-center gap-2 lg:gap-4 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.href;
                return (
                  <Link
                    key={tab.href}
                    to={tab.href}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap px-2 py-2 text-sm font-medium border-b-2 transition-all flex-shrink-0",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    )}
                  >
                    <div className="h-4 w-4 flex items-center justify-center">
                      {tab.icon}
                    </div>
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Actions + Mobile menu trigger */}
          {showConnectionHeader && (
            <div className="ml-auto flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Support Vocal */}
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Multilingue */}
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 sm:h-3 sm:w-3 bg-primary rounded-full"></span>
              </Button>

              {/* Profil utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-xs sm:text-sm font-medium leading-none truncate">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu trigger (shown < lg) */}
              {user && user.role !== 'cooperative' && user.role !== 'admin' && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 sm:h-10 sm:w-10">
                      <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 overflow-y-auto">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col py-2" aria-label="Mobile navigation">
                      {tabs.map((tab) => {
                        const isActive = location.pathname === tab.href;
                        return (
                          <SheetClose asChild key={tab.href}>
                            <Link
                              to={tab.href}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground hover:bg-muted"
                              )}
                            >
                              <div className="h-5 w-5 flex items-center justify-center">
                                {tab.icon}
                              </div>
                              <span>{tab.label}</span>
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
