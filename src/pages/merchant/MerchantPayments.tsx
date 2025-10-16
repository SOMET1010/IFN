import { useState, useMemo, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, Banknote, TrendingUp, Plus, Search, Filter, Zap, Download } from 'lucide-react';
import { useMerchantPayments } from '@/services/merchant/merchantPaymentService';
import { useMerchantStats } from '@/services/merchant/merchantStatsService';
import { useMerchantOrders } from '@/services/merchant/merchantOrderService';
import { MerchantPayment } from '@/services/merchant/merchantService';
import MultiChannelPayment from '@/components/merchant/MultiChannelPayment';
import { MerchantHeader } from '@/components/merchant/MerchantHeader';
import { StatsCard } from '@/components/merchant/StatsCard';
import { PaymentStatus, PaymentStatusLabels, PaymentStatusVariants, PaymentMethod, PaymentMethodLabels } from '@/types/merchant';
import FloatingVoiceNavigator from '@/components/merchant/FloatingVoiceNavigator';

const MerchantPayments = () => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('history');
  const [quickPaymentAmount, setQuickPaymentAmount] = useState('');
  const [quickPaymentClient, setQuickPaymentClient] = useState('');

  const { payments, processPayment } = useMerchantPayments();
  const { stats } = useMerchantStats();
  const { orders } = useMerchantOrders();

  const [newPayment, setNewPayment] = useState({
    client: '',
    amount: '',
    method: 'mobile_money' as 'mobile_money' | 'bank_transfer' | 'cash',
    reference: '',
    orderId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredPayments = useMemo(() => {
  return payments.data?.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];
}, [payments.data, searchTerm, statusFilter]);

  const sumAmounts = (status: 'completed' | 'pending') =>
    (payments.data || [])
      .filter(p => p.status === status)
      .reduce((sum, p) => sum + Number(String(p.amount || '').replace(/[^0-9]/g, '')), 0);

  const paymentStats = [
    {
      title: "Revenus ce mois",
      value: stats.data?.totalRevenue ? formatCurrency(stats.data.totalRevenue) : formatCurrency(0),
      icon: TrendingUp,
      change: `+${stats.data?.monthlyGrowth || 0}%`
    },
    {
      title: "Paiements reçus",
      value: formatCurrency(sumAmounts('completed')),
      icon: CreditCard,
      change: "+8%"
    },
    {
      title: "En attente",
      value: formatCurrency(sumAmounts('pending')),
      icon: Smartphone,
      change: "-2%"
    },
    {
      title: "Transactions",
      value: payments.data?.length || 0,
      icon: Banknote,
      change: "+12%"
    },
  ];

  const getStatusBadge = useCallback((status: string) => {
    return (
      <Badge variant={PaymentStatusVariants[status as PaymentStatus] || 'default'}>
        {PaymentStatusLabels[status as PaymentStatus] || status}
      </Badge>
    );
  }, []);

  const getMethodIcon = useCallback((method: string) => {
    switch (method) {
      case PaymentMethod.MOBILE_MONEY: return <Smartphone className="h-4 w-4" />;
      case PaymentMethod.BANK_TRANSFER: return <CreditCard className="h-4 w-4" />;
      case PaymentMethod.CASH: return <Banknote className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  }, []);

  const getMethodLabel = useCallback((method: string) => {
    return PaymentMethodLabels[method as PaymentMethod] || 'Autre';
  }, []);

  const handleAddPayment = async () => {
    try {
      await processPayment.mutateAsync({
        client: newPayment.client,
        amount: newPayment.amount,
        method: newPayment.method,
        reference: newPayment.reference,
        orderId: newPayment.orderId || undefined,
        date: newPayment.date
      });
      setShowAddPayment(false);
      setNewPayment({
        client: '',
        amount: '',
        method: 'mobile_money',
        reference: '',
        orderId: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleQuickPaymentComplete = (transaction: { id: string; status: string }) => {
    console.log('Quick payment completed:', transaction);
    setQuickPaymentAmount('');
    setQuickPaymentClient('');
  };

  return (
    <div className="min-h-screen bg-background">
      <MerchantHeader title="Gestion des Paiements" showBackButton={true} backTo="/merchant/dashboard" />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="quick">Paiement rapide</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {paymentStats.map((stat, index) => (
                  <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    trend={stat.change}
                    trendColor="text-green-600"
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      className="pl-10 pr-4"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="completed">Reçus</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="failed">Échoués</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" className="gap-2" onClick={() => {
                    const rows = [
                      ['Client', 'Montant', 'Méthode', 'Référence', 'Date', 'Statut'],
                      ...((payments.data || []).map(p => [p.client, p.amount, p.method, p.reference, p.date, p.status]))
                    ];
                    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'paiements.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                  }}>
                    <Download className="h-4 w-4" /> Exporter CSV
                  </Button>
                  <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
                    <DialogTrigger asChild>
                      <Button variant="ivoire" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Ajouter Paiement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un paiement</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Nom du client"
                          value={newPayment.client}
                          onChange={(e) => setNewPayment({...newPayment, client: e.target.value})}
                        />
                        <Input
                          placeholder="Montant (ex: 50,000 FCFA)"
                          value={newPayment.amount}
                          onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                        />
                        <Select value={newPayment.method} onValueChange={(value: 'mobile_money' | 'bank_transfer' | 'cash') => setNewPayment({...newPayment, method: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                            <SelectItem value="cash">Espèces</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Référence (ex: MM240315001)"
                          value={newPayment.reference}
                          onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                        />
                        <Select value={newPayment.orderId} onValueChange={(value) => setNewPayment({...newPayment, orderId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Commande associée (optionnel)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Aucune commande</SelectItem>
                            {orders.data?.map(order => (
                              <SelectItem key={order.id} value={order.id}>
                                {order.id} - {order.client}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                          <Button onClick={handleAddPayment} disabled={processPayment.isPending}>
                            {processPayment.isPending ? 'Traitement...' : 'Ajouter'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Loading State */}
              {payments.isLoading && (
                <div className="text-center py-8">
                  <p>Chargement des paiements...</p>
                </div>
              )}

              {/* Payments List */}
              <Card>
                <CardHeader>
                  <CardTitle>Historique des paiements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 text-sm font-medium text-muted-foreground">
                      <span>CLIENT</span>
                      <span>MONTANT</span>
                      <span className="hidden sm:table-cell">MÉTHODE</span>
                      <span className="hidden md:table-cell">RÉFÉRENCE</span>
                      <span className="hidden lg:table-cell">DATE</span>
                      <span>STATUT</span>
                    </div>
                    {filteredPayments.map((payment) => (
                      <div key={payment.id} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 text-sm py-3 border-b">
                        <span className="font-medium truncate">{payment.client}</span>
                        <span className="font-semibold text-green-600">{payment.amount}</span>
                        <div className="flex items-center gap-2 hidden sm:table-cell">
                          {getMethodIcon(payment.method)}
                          <span>{getMethodLabel(payment.method)}</span>
                        </div>
                        <span className="font-mono text-xs hidden md:table-cell">{payment.reference}</span>
                        <span className="hidden lg:table-cell">{payment.date}</span>
                        <span>{getStatusBadge(payment.status)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Empty State */}
              {!payments.isLoading && filteredPayments.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun paiement trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' ? 'Aucun paiement ne correspond à vos filtres.' : 'Commencez par ajouter des paiements.'}
                  </p>
                  {(!searchTerm && statusFilter === 'all') && (
                    <Button onClick={() => setShowAddPayment(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un paiement
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

          <TabsContent value="quick">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Paiement Rapide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Nom du client</label>
                      <Input
                        placeholder="Nom du client"
                        value={quickPaymentClient}
                        onChange={(e) => setQuickPaymentClient(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Montant (FCFA)</label>
                      <Input
                        placeholder="50,000"
                        value={quickPaymentAmount}
                        onChange={(e) => setQuickPaymentAmount(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>

                  {quickPaymentAmount && quickPaymentClient && (
                    <MultiChannelPayment
                      amount={Number(quickPaymentAmount)}
                      customerInfo={{
                        name: quickPaymentClient,
                        phone: "+22500000000", // Default phone for quick payment
                      }}
                      onPaymentComplete={handleQuickPaymentComplete}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MerchantPayments;
