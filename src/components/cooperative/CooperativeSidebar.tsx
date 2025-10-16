import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Users, Store, Truck, DollarSign, Leaf, Package, TrendingUp, Shield, FileText, Warehouse, Route, MessageSquare, BarChart3, ClipboardCheck, HandCoins, ClipboardList, PackageSearch, Handshake, Sprout, CalendarDays, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CooperativeSidebar() {
  const location = useLocation();

  const items = [
    { label: 'Accueil', href: '/cooperative/dashboard', icon: LayoutDashboard },
    { label: 'Marchands', href: '/cooperative/members', icon: Users },
    { label: 'Commandes', href: '/cooperative/orders', icon: Store },
    { label: 'Négociation', href: '/cooperative/negotiation', icon: Handshake },
    { label: 'Entrepôts', href: '/cooperative/warehouses', icon: Warehouse },
    { label: 'Réceptions', href: '/cooperative/receiving', icon: PackageCheck },
    { label: 'Planification', href: '/cooperative/planning', icon: CalendarDays },
    { label: 'Récoltes', href: '/cooperative/harvests', icon: Sprout },
    { label: 'Livraisons', href: '/cooperative/distribution', icon: Truck },
    { label: 'Paiements', href: '/cooperative/payments', icon: HandCoins },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4">
        <SidebarGroupLabel className="text-base font-semibold text-foreground">Coopérative</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map(({ label, href, icon: Icon }) => {
              const isActive = location.pathname === href;
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={href} className={cn('gap-3')}>
                      <Icon className="h-4 w-4 text-orange-600" />
                      <span className="truncate">{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
