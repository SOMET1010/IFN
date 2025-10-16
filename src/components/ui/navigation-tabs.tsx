import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavigationTab {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface NavigationTabsProps {
  tabs: NavigationTab[];
  className?: string;
}

export const NavigationTabs = ({ tabs, className }: NavigationTabsProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileTabClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={cn("border-b border-border bg-background", className)}>
      {/* Mobile Menu Button */}
      <div className="sm:hidden flex items-center justify-between px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">Navigation</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-8 w-8 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4 transition-all duration-300 rotate-0" />
          ) : (
            <Menu className="h-4 w-4 transition-all duration-300" />
          )}
        </Button>
      </div>

      {/* Mobile Menu - Dropdown Style */}
      <div
        className={cn(
          "sm:hidden bg-background border-b border-border overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col py-2" aria-label="Mobile navigation">
          {tabs.map((tab, index) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                onClick={handleMobileTabClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 transform hover:translate-x-1",
                  isActive
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                style={{
                  animationDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                  animation: isMobileMenuOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                }}
              >
                <div className="h-5 w-5 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  {tab.icon}
                </div>
                <span className="transition-all duration-200">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Navigation - Horizontal Tabs */}
      <div className="hidden sm:block">
        <nav className="flex space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 overflow-x-auto scrollbar-hide px-4 sm:px-6" aria-label="Desktop navigation">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 whitespace-nowrap py-2 sm:py-4 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 transform hover:scale-105 flex-shrink-0 relative",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <div className="h-4 w-4 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                  {tab.icon}
                </div>
                <span className="transition-all duration-200">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

// Ajouter les animations CSS globales
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;
document.head.appendChild(style);