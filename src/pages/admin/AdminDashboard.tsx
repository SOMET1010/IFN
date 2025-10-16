import { DashboardLayout } from '@/components/common/DashboardLayout';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Building2, Store, Activity, Settings, Shield, BarChart3, Bell, CreditCard, Truck, AlertTriangle, PackageSearch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MerchantCreditService } from '@/services/merchant/merchantCreditService';
import { merchantService } from '@/services/merchant/merchantService';

const AdminDashboard = () => {
  const [stats, setStats] = useState<Array<{title: string; value: string; description: string; icon: React.ReactNode}>>([ 
    {
      title: "Utilisateurs Total",
      value: "12,847",
      description: "+12% ce mois",
      icon: <Users className="h-4 w-4" />,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Producteurs Actifs",
      value: "4,523",
      description: "+8% ce mois",
      icon: <Building2 className="h-4 w-4" />,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Marchands",
      value: "2,341",
      description: "+15% ce mois",
      icon: <Store className="h-4 w-4" />,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Transactions",
      value: "48,392",
      description: "+23% ce mois",
      icon: <Activity className="h-4 w-4" />,
      trend: { value: 23, isPositive: true }
    }
  ]);

  const [overdues, setOverdues] = useState<Record<string, unknown>[]>([]);
  const [issues, setIssues] = useState<{ low: number; critical: number; pendingOrders: number }>({ low: 0, critical: 0, pendingOrders: 0 });

  useEffect(() => {
    (async () => {
      // Credits actifs
      const creditSvc = MerchantCreditService.getInstance();
      const credits = await creditSvc.list();
      // POs/commandes count uses merchant orders
      const orders = await merchantService.getOrders();
      // compute/update overdues (mock)
      const updatedOverdues = await creditSvc.checkOverdues();
      setOverdues(updatedOverdues.slice(0, 5));
      // open issues (stocks + pending orders)
      const low = await merchantService.getLowStockItems();
      const critical = await merchantService.getCriticalStockItems();
      setIssues({ low: low.length, critical: critical.length, pendingOrders: orders.filter(o => o.status === 'pending').length });
      setStats(prev => [
        ...prev,
        {
          title: 'Crédits actifs',
          value: String(credits.filter(c => c.status === 'active').length),
          description: 'Crédits en cours de remboursement',
          icon: <CreditCard className="h-4 w-4" />,
          trend: { value: 0, isPositive: true }
        },
        {
          title: 'Bons de commande',
          value: String(orders.length),
          description: 'Commandes fournisseurs (mock)',
          icon: <Truck className="h-4 w-4" />,
          trend: { value: 0, isPositive: true }
        }
      ]);
    })();
    // periodic refresh (mock cron)
    const id = setInterval(async () => {
      const updatedOverdues = await MerchantCreditService.getInstance().checkOverdues();
      setOverdues(updatedOverdues.slice(0, 5));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const recentActivities = [
    { user: "Kouadio Amani", action: "Nouveau producteur inscrit", time: "Il y a 2h", status: "success" },
    { user: "Fatou Traoré", action: "Transaction validée", time: "Il y a 3h", status: "success" },
    { user: "Yao N'Guessan", action: "Formation terminée", time: "Il y a 5h", status: "info" },
    { user: "Aya Koné", action: "Problème signalé", time: "Il y a 1j", status: "warning" },
    { user: "Mamadou Diallo", action: "Compte suspendu", time: "Il y a 2j", status: "error" }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Activités Récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activités Récentes
              </CardTitle>
              <CardDescription>
                Dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={getStatusVariant(activity.status)}>
                        {activity.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions Rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions Rapides
              </CardTitle>
              <CardDescription>
                Outils d'administration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-12">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les Utilisateurs
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Shield className="mr-2 h-4 w-4" />
                  Sécurité & Permissions
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Rapports & Analytics
                </Button>
                <Button variant="outline" className="justify-start h-12">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications Système
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Alertes (échéances en retard) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Alertes
              </CardTitle>
              <CardDescription>
                Échéances de crédit en retard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdues.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucune alerte pour l’instant.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Crédit</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdues.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{it.creditId}</TableCell>
                        <TableCell>{it.dueDate}</TableCell>
                        <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(it.amount)}</TableCell>
                        <TableCell><Badge variant="destructive">En retard</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tableau des Utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="h-5 w-5" /> Problèmes ouverts
            </CardTitle>
            <CardDescription>Stocks critiques/faibles et commandes en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Stocks critiques</div>
                <div className="text-2xl font-bold text-red-600">{issues.critical}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Stocks faibles</div>
                <div className="text-2xl font-bold text-orange-600">{issues.low}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Commandes en attente</div>
                <div className="text-2xl font-bold text-blue-600">{issues.pendingOrders}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des Utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs Récents</CardTitle>
            <CardDescription>
              Liste des derniers utilisateurs inscrits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Kouadio Amani</TableCell>
                  <TableCell>kouadio@agritrack.ci</TableCell>
                  <TableCell>
                    <Badge variant="outline">Producteur</Badge>
                  </TableCell>
                  <TableCell>Abidjan</TableCell>
                  <TableCell>
                    <Badge>Actif</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Fatou Traoré</TableCell>
                  <TableCell>fatou@marketci.ci</TableCell>
                  <TableCell>
                    <Badge variant="outline">Marchand</Badge>
                  </TableCell>
                  <TableCell>Bouaké</TableCell>
                  <TableCell>
                    <Badge>Actif</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Yao N'Guessan</TableCell>
                  <TableCell>yao@cooperative.ci</TableCell>
                  <TableCell>
                    <Badge variant="outline">Coopérative</Badge>
                  </TableCell>
                  <TableCell>Korhogo</TableCell>
                  <TableCell>
                    <Badge>Actif</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
