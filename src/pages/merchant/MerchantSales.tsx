import { useState, useMemo, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, ShoppingCart, Users, Calendar, Plus, Search, Filter, Workflow, Download } from 'lucide-react';
import { useMerchantSales } from '@/services/merchant/merchantSaleService';
import { useMerchantStats } from '@/services/merchant/merchantStatsService';
import { MerchantSale } from '@/services/merchant/merchantService';
import MerchantSalesWorkflow from './MerchantSalesWorkflow';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { StatsCard } from '@/components/merchant/StatsCard';
import { SaleStatus, SaleStatusLabels, SaleStatusVariants } from '@/types/merchant';

const MerchantSales = () => {
  const [showAddSale, setShowAddSale] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('list');

  const { sales, createSale } = useMerchantSales();
  const { stats } = useMerchantStats();

  const [newSale, setNewSale] = useState({
    client: '',
    products: '',
    amount: '',
    paymentMethod: 'mobile_money'
  });

  const filteredSales = useMemo(() => {
  return sales.data?.filter(sale => {
    const matchesSearch = sale.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.products.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];
}, [sales.data, searchTerm, statusFilter]);

  const salesStats = [
    {
      title: "Ventes aujourd'hui",
      value: stats.data?.totalRevenue ? formatCurrency(stats.data.totalRevenue / 30) : formatCurrency(8167),
      icon: Calendar,
      trend: "+8%"
    },
    {
      title: "Commandes",
      value: stats.data?.totalSales || 0,
      icon: ShoppingCart,
      trend: "+12%"
    },
    {
      title: "Clients actifs",
      value: stats.data?.activeClients || 0,
      icon: Users,
      trend: "+5%"
    },
    {
      title: "Croissance",
      value: `+${stats.data?.monthlyGrowth || 0}%`,
      icon: TrendingUp,
      trend: "+3%"
    },
  ];

  const getStatusBadge = useCallback((status: string) => {
    return (
      <Badge variant={SaleStatusVariants[status as SaleStatus] || 'default'}>
        {SaleStatusLabels[status as SaleStatus] || status}
      </Badge>
    );
  }, []);

  const handleAddSale = async () => {
    try {
      await createSale.mutateAsync({
        client: newSale.client,
        products: newSale.products,
        amount: newSale.amount,
        status: 'completed',
        paymentMethod: newSale.paymentMethod,
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddSale(false);
      setNewSale({
        client: '',
        products: '',
        amount: '',
        paymentMethod: 'mobile_money'
      });
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  const exportSalesCSV = () => {
    const rows = [
      ['Client', 'Produits', 'Montant', 'Date', 'Statut', 'Paiement'],
      ...filteredSales.map(s => [s.client, s.products, s.amount, s.date, s.status, s.paymentMethod])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ventes.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  return (
    <MerchantLayout title="Ventes" showBackButton={true} backTo="/merchant/dashboard">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="list" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Historique des ventes
                  </TabsTrigger>
                  <TabsTrigger value="workflow" className="gap-2">
                    <Workflow className="h-4 w-4" />
                    Workflow de vente
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="list" className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {salesStats.map((stat, index) => (
                    <StatsCard
                      key={index}
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      trend={stat.trend}
                      trendColor="text-green-600"
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="bg-muted/30 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher une vente..."
                          className="pl-10 pr-4 w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="border border-input rounded-lg px-4 py-2.5 text-sm bg-background min-w-[180px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="completed">Terminées</option>
                        <option value="pending">En cours</option>
                        <option value="cancelled">Annulées</option>
                      </select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={exportSalesCSV} className="gap-2 flex-1 sm:flex-initial">
                        <Download className="h-4 w-4" /> Exporter CSV
                      </Button>
                      <Dialog open={showAddSale} onOpenChange={setShowAddSale}>
                        <DialogTrigger asChild>
                          <Button variant="ivoire" className="gap-2 flex-1 sm:flex-initial">
                            <Plus className="h-4 w-4" />
                            Nouvelle Vente
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Ajouter une vente</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Nom du client</label>
                              <Input
                                placeholder="Entrez le nom du client"
                                value={newSale.client}
                                onChange={(e) => setNewSale({...newSale, client: e.target.value})}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Produits</label>
                              <Input
                                placeholder="ex: Bananes, Mangues"
                                value={newSale.products}
                                onChange={(e) => setNewSale({...newSale, products: e.target.value})}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Montant</label>
                              <Input
                                placeholder="ex: 50,000 FCFA"
                                value={newSale.amount}
                                onChange={(e) => setNewSale({...newSale, amount: e.target.value})}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Méthode de paiement</label>
                              <select
                                className="border border-input rounded-lg px-4 py-2.5 w-full h-11 bg-background"
                                value={newSale.paymentMethod}
                                onChange={(e) => setNewSale({...newSale, paymentMethod: e.target.value as 'mobile_money' | 'bank_transfer' | 'cash'})}
                              >
                                <option value="mobile_money">Mobile Money</option>
                                <option value="bank_transfer">Virement bancaire</option>
                                <option value="cash">Espèces</option>
                              </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button onClick={handleAddSale} disabled={createSale.isPending} className="flex-1">
                                {createSale.isPending ? 'Création...' : 'Ajouter la vente'}
                              </Button>
                              <Button variant="outline" onClick={() => setShowAddSale(false)} className="flex-1">
                                Annuler
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {sales.isLoading && (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-muted-foreground">Chargement des ventes...</p>
                    </div>
                  </div>
                )}

                {/* Sales List */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Ventes récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {/* Header responsive */}
                      <div className="grid grid-cols-5 gap-2 sm:gap-4 text-sm font-medium text-muted-foreground pb-3 border-b">
                        <span>CLIENT</span>
                        <span className="hidden sm:block">PRODUITS</span>
                        <span>MONTANT</span>
                        <span className="hidden md:block">DATE</span>
                        <span>STATUT</span>
                      </div>
                      {filteredSales.map((sale) => (
                        <div key={sale.id} className="grid grid-cols-5 gap-2 sm:gap-4 text-sm py-4 border-b last:border-0 hover:bg-muted/30 rounded-lg px-3 -mx-3 transition-colors">
                          <span className="font-medium truncate">{sale.client}</span>
                          <span className="text-muted-foreground hidden sm:block truncate">{sale.products}</span>
                          <span className="font-semibold text-green-600">{sale.amount}</span>
                          <span className="text-muted-foreground hidden md:block">{sale.date}</span>
                          <span>{getStatusBadge(sale.status)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Empty State */}
                {!sales.isLoading && filteredSales.length === 0 && (
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-muted/30 rounded-full">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Aucune vente trouvée</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {searchTerm || statusFilter !== 'all' ? 'Aucune vente ne correspond à vos filtres.' : 'Commencez par ajouter des ventes pour voir votre historique.'}
                        </p>
                        {(!searchTerm && statusFilter === 'all') && (
                          <Button onClick={() => setShowAddSale(true)} size="lg" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter votre première vente
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="workflow">
                <MerchantSalesWorkflow />
              </TabsContent>
            </Tabs>
          </div>
        </main>
    </MerchantLayout>
  );
};

export default MerchantSales;
