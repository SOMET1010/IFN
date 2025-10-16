import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  BarChart3,
  Calendar,
  Package,
  DollarSign,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickStat {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  to: string;
  color: string;
  badge?: string;
}

interface MobileQuickActionsProps {
  stats?: QuickStat[];
  actions?: QuickAction[];
}

export function MobileQuickActions({
  stats = [
    {
      label: 'Récoltes',
      value: '12',
      change: '+2',
      icon: <Package className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      label: 'Ventes',
      value: '8',
      change: '+1',
      icon: <DollarSign className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      label: 'En attente',
      value: '3',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-orange-600'
    }
  ],
  actions = [
    {
      label: 'Nouvelle récolte',
      icon: <Plus className="h-5 w-5" />,
      to: '/producer/harvests',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Nouvelle offre',
      icon: <Package className="h-5 w-5" />,
      to: '/producer/offers',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Gérer les prix',
      icon: <TrendingUp className="h-5 w-5" />,
      to: '/producer/prices',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      label: 'Voir les ventes',
      icon: <DollarSign className="h-5 w-5" />,
      to: '/producer/sales',
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: '2'
    }
  ]
}: MobileQuickActionsProps) {
  return (
    <div className="space-y-4 p-4">
      {/* Quick Stats */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aperçu rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mb-2 ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="text-lg font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
                {stat.change && (
                  <div className="text-xs text-green-600 font-medium">{stat.change}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className="relative group"
              >
                <Button
                  className={`w-full h-20 flex-col gap-2 ${action.color} text-white touch-manipulation`}
                  variant="default"
                >
                  {action.icon}
                  <span className="text-xs font-medium text-center">{action.label}</span>
                  {action.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500"
                    >
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Récolte terminée</div>
                <div className="text-xs text-muted-foreground">Cacao - 250kg</div>
              </div>
              <div className="text-xs text-muted-foreground">Il y a 2h</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Nouvelle commande</div>
                <div className="text-xs text-muted-foreground">Commande #1234</div>
              </div>
              <div className="text-xs text-muted-foreground">Il y a 5h</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}