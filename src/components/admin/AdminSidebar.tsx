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
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  FileText,
  Activity,
  Bell,
  Store,
  DollarSign,
  Database,
  Key,
  Lock,
  HeartPulse,
  BarChart3,
  Monitor,
  HardDrive,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const location = useLocation();

  const mainItems = [
    { label: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Utilisateurs', href: '/admin/users', icon: Users },
    { label: 'Sécurité', href: '/admin/security', icon: Shield },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings },
    { label: 'Rapports', href: '/admin/reports', icon: FileText },
    { label: 'Avis', href: '/admin/reviews', icon: MessageSquare },
  ];

  const monitoringItems = [
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
    { label: 'Monitoring Système', href: '/admin/system-monitoring', icon: Monitor },
    { label: 'Santé Système', href: '/admin/health', icon: HeartPulse },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  const marketplaceItems = [
    { label: 'Marketplace', href: '/admin/marketplace', icon: Store },
    { label: 'Litiges', href: '/admin/disputes', icon: AlertTriangle },
    { label: 'Finances', href: '/admin/financial', icon: DollarSign },
    { label: 'Sauvegardes', href: '/admin/backup', icon: HardDrive },
    { label: 'Analytiques', href: '/admin/analytics', icon: BarChart3 },
  ];

  const securityItems = [
    { label: 'Permissions', href: '/admin/permissions', icon: Lock },
    { label: 'Clés API', href: '/admin/api-keys', icon: Key },
    { label: 'Alertes', href: '/admin/alerts', icon: AlertTriangle },
    { label: 'Performance', href: '/admin/performance', icon: TrendingUp },
  ];

  const renderMenuGroup = (label: string, items: Array<{label: string; href: string; icon: React.ComponentType<Record<string, unknown>>}>) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-medium text-muted-foreground">{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = location.pathname === href;
          return (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link to={href} className={cn('gap-3')}>
                  <Icon className={cn('h-4 w-4')} />
                  <span className="truncate">{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );

  return (
    <Sidebar>
      <SidebarHeader className="px-3 py-4 border-b">
        <SidebarGroupLabel className="text-base font-semibold text-foreground">Administration</SidebarGroupLabel>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="py-2">
        {renderMenuGroup('Principal', mainItems)}
        <SidebarSeparator className="my-2" />
        {renderMenuGroup('Monitoring', monitoringItems)}
        <SidebarSeparator className="my-2" />
        {renderMenuGroup('Marketplace', marketplaceItems)}
        <SidebarSeparator className="my-2" />
        {renderMenuGroup('Sécurité', securityItems)}
      </SidebarContent>
    </Sidebar>
  );
}
