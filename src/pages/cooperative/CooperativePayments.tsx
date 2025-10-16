import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/format';
import { paymentsService, Contribution, SupplierPayment } from '@/services/cooperative/paymentsService';
import { membershipService } from '@/services/cooperative/membershipService';
import {
  Plus,
  Search,
  Filter,
  Download,
  CreditCard,
  Users,
  DollarSign,
  ReceiptText,
  Printer,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { PaymentForm } from '@/components/cooperative/PaymentForm';

interface PaymentStats {
  totalContributions: number;
  totalSupplierPayments: number;
  balance: number;
  pendingReconciliation: number;
  monthlyTotal: number;
  averageContribution: number;
  activeMembers: number;
}

const CooperativePayments = () => {
  const [members, setMembers] = useState<{ id: string; name: string }[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [profit, setProfit] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = () => {
    try {
      const membersData = membershipService.getActiveMembers();
      const contributionsData = paymentsService.listContributions();
      const supplierPaymentsData = paymentsService.listSupplierPayments();
      const totals = paymentsService.totals();

      setMembers(membersData);
      setContributions(contributionsData);
      setSupplierPayments(supplierPaymentsData);

      const monthlyContributions = contributionsData.filter(c => {
        const contributionDate = new Date(c.date);
        const now = new Date();
        return contributionDate.getMonth() === now.getMonth() &&
               contributionDate.getFullYear() === now.getFullYear();
      });

      const monthlyTotal = monthlyContributions.reduce((sum, c) => sum + c.amount, 0);
      const averageContribution = contributionsData.length > 0 ?
        contributionsData.reduce((sum, c) => sum + c.amount, 0) / contributionsData.length : 0;

      setStats({
        totalContributions: totals.totalContrib,
        totalSupplierPayments: totals.totalSupplier,
        balance: totals.balance,
        pendingReconciliation: contributionsData.filter(c => c.status === 'pending').length,
        monthlyTotal,
        averageContribution,
        activeMembers: membersData.length
      });
    } catch (error) {
      console.error('Error loading payments data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredContributions = contributions.filter(contribution => {
    const matchesSearch = contribution.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contribution.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || contribution.status === selectedStatus;
    const matchesMethod = selectedMethod === 'all' || contribution.method === selectedMethod;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const filteredSupplierPayments = supplierPayments.filter(payment => {
    const matchesSearch = payment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = selectedMethod === 'all' || payment.method === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reconciled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'check': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const printContribution = (contribution: Contribution) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Reçu Contribution ${contribution.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; }
            h1 { font-size: 24px; color: #333; border-bottom: 2px solid #007cba; padding-bottom: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .receipt-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .amount { font-size: 18px; font-weight: bold; color: #007cba; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reçu de Contribution</h1>
            <p>Coopérative Agricole Unie</p>
          </div>

          <div class="receipt-info">
            <div class="row">
              <span class="label">Numéro de reçu:</span>
              <span><strong>${contribution.receiptNumber}</strong></span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span>${new Date(contribution.date).toLocaleString('fr-FR')}</span>
            </div>
            <div class="row">
              <span class="label">Membre:</span>
              <span>${contribution.memberName}</span>
            </div>
            <div class="row">
              <span class="label">Montant:</span>
              <span class="amount">${contribution.amount.toLocaleString()} FCFA</span>
            </div>
            <div class="row">
              <span class="label">Méthode de paiement:</span>
              <span>${contribution.method}</span>
            </div>
            <div class="row">
              <span class="label">Statut:</span>
              <span>${contribution.status === 'reconciled' ? 'Rapproché' : 'Enregistré'}</span>
            </div>
          </div>

          <div class="footer">
            <p>Merci pour votre contribution à la coopérative.</p>
            <p>Ce reçu sert de preuve de paiement.</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const printSupplierPayment = (payment: SupplierPayment) => {
    const w = window.open('', '_blank');
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Paiement Fournisseur ${payment.reference || payment.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; }
            h1 { font-size: 24px; color: #333; border-bottom: 2px solid #007cba; padding-bottom: 10px; }
            .header { text-align: center; margin-bottom: 30px; }
            .payment-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .amount { font-size: 18px; font-weight: bold; color: #dc3545; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reçu de Paiement Fournisseur</h1>
            <p>Coopérative Agricole Unie</p>
          </div>

          <div class="payment-info">
            <div class="row">
              <span class="label">Référence:</span>
              <span><strong>${payment.reference || payment.id}</strong></span>
            </div>
            <div class="row">
              <span class="label">Date:</span>
              <span>${new Date(payment.date).toLocaleString('fr-FR')}</span>
            </div>
            <div class="row">
              <span class="label">Fournisseur:</span>
              <span>${payment.supplierName}</span>
            </div>
            <div class="row">
              <span class="label">Montant:</span>
              <span class="amount">${payment.amount.toLocaleString()} FCFA</span>
            </div>
            <div class="row">
              <span class="label">Méthode de paiement:</span>
              <span>${payment.method}</span>
            </div>
          </div>

          <div class="footer">
            <p>Paiement enregistré avec succès.</p>
            <p>Ce reçu sert de preuve de transaction.</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const exportContributionsCSV = () => {
    const rows = [
      ['Date', 'Membre', 'Montant', 'Méthode', 'Statut', 'Reçu'].join(','),
      ...filteredContributions.map(c => [
        new Date(c.date).toLocaleString('fr-FR'),
        c.memberName,
        c.amount,
        c.method,
        c.status,
        c.receiptNumber
      ].join(','))
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contributions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSupplierPaymentsCSV = () => {
    const rows = [
      ['Date', 'Fournisseur', 'Montant', 'Méthode', 'Référence'].join(','),
      ...filteredSupplierPayments.map(p => [
        new Date(p.date).toLocaleString('fr-FR'),
        p.supplierName,
        p.amount,
        p.method,
        p.reference || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_fournisseurs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reconcileContributions = () => {
    try {
      paymentsService.reconcileContributions();
      loadData();
    } catch (error) {
      console.error('Error reconciling contributions:', error);
    }
  };

  const getPaymentDistribution = () => {
    if (!stats || profit <= 0) return [];

    const totalContributions = stats.totalContributions;
    return contributions.map(contribution => ({
      memberId: contribution.memberId,
      memberName: contribution.memberName,
      contribution: contribution.amount,
      share: Math.round((contribution.amount / totalContributions) * profit)
    }));
  };

  const paymentStats = [
    {
      title: "Total Contributions",
      value: stats ? formatCurrency(stats.totalContributions) : "0 FCFA",
      icon: Users,
      change: stats ? `${stats.activeMembers} membres` : "0 membres",
      color: "text-blue-600"
    },
    {
      title: "Paiements Fournisseurs",
      value: stats ? formatCurrency(stats.totalSupplierPayments) : "0 FCFA",
      icon: CreditCard,
      change: stats ? `${Math.round((stats.totalSupplierPayments / stats.totalContributions) * 100)}% des contributions` : "0%",
      color: "text-purple-600"
    },
    {
      title: "Solde Disponible",
      value: stats ? formatCurrency(stats.balance) : "0 FCFA",
      icon: DollarSign,
      change: stats?.balance >= 0 ? "Positif" : "Négatif",
      color: stats?.balance >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Moyenne Contribution",
      value: stats ? formatCurrency(stats.averageContribution) : "0 FCFA",
      icon: TrendingUp,
      change: stats ? `Ce mois: ${formatCurrency(stats.monthlyTotal)}` : "Ce mois: 0 FCFA",
      color: "text-orange-600"
    }
  ];

  return (
    <DashboardLayout title="Paiements" subtitle="Gestion des paiements collectifs et transactions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6" onClick={() => {
              setEditingItem({ type: 'contribution' });
              setIsDialogOpen(true);
            }}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Nouvelle Contribution</h3>
                  <p className="text-sm text-muted-foreground">Enregistrer une contribution membre</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6" onClick={() => {
              setEditingItem({ type: 'supplier' });
              setIsDialogOpen(true);
            }}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Paiement Fournisseur</h3>
                  <p className="text-sm text-muted-foreground">Enregistrer un paiement fournisseur</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6" onClick={reconcileContributions}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Rapprocher</h3>
                  <p className="text-sm text-muted-foreground">Rapprocher les contributions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
            <TabsTrigger value="distribution">Répartition</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle>Contributions récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredContributions.slice(0, 5).map((contribution) => (
                      <div key={contribution.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{contribution.memberName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(contribution.date).toLocaleDateString()} • {contribution.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(contribution.amount)}
                          </p>
                          <Badge className={getStatusColor(contribution.status)}>
                            {contribution.status === 'reconciled' ? 'Rapproché' : 'Enregistré'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Supplier Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Paiements fournisseurs récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSupplierPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.supplierName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString()} • {payment.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600">
                            {formatCurrency(payment.amount)}
                          </p>
                          {payment.reference && (
                            <p className="text-xs text-muted-foreground">{payment.reference}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contributions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des contributions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="reconciled">Rapproché</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes méthodes</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="transfer">Virement</SelectItem>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportContributionsCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                  <Button onClick={() => {
                    setEditingItem({ type: 'contribution' });
                    setIsDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle contribution
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contributions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Membre</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Reçu</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContributions.map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell>{new Date(contribution.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{contribution.memberName}</TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {formatCurrency(contribution.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getMethodColor(contribution.method)}>
                            {contribution.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(contribution.status)}>
                            {contribution.status === 'reconciled' ? 'Rapproché' : 'Enregistré'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{contribution.receiptNumber}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => printContribution(contribution)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {contribution.status === 'pending' && (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Paiements Fournisseurs</h2>
              <Button onClick={() => {
                setEditingItem({ type: 'supplier' });
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau paiement
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des paiements..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes méthodes</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="transfer">Virement</SelectItem>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportSupplierPaymentsCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Liste des paiements fournisseurs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Méthode</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupplierPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{payment.supplierName}</TableCell>
                        <TableCell className="font-semibold text-purple-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getMethodColor(payment.method)}>
                            {payment.method}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{payment.reference || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => printSupplierPayment(payment)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Bénéfices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profit">Bénéfice à répartir (FCFA)</Label>
                    <Input
                      id="profit"
                      type="number"
                      value={profit || ''}
                      onChange={(e) => setProfit(parseInt(e.target.value) || 0)}
                      placeholder="Entrez le montant du bénéfice"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const distribution = getPaymentDistribution();
                        const rows = [
                          ['Membre', 'Contribution', 'Part (FCFA)'].join(','),
                          ...distribution.map(d => [d.memberName, d.contribution.toString(), d.share.toString()].join(','))
                        ].join('\n');

                        const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `repartition_benefices_${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exporter la répartition
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Répartition proposée</h3>
                  {getPaymentDistribution().length === 0 ? (
                    <p className="text-muted-foreground">Aucune contribution enregistrée ou bénéfice à répartir.</p>
                  ) : (
                    <div className="space-y-3">
                      {getPaymentDistribution().map((distribution) => (
                        <div key={distribution.memberId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{distribution.memberName}</p>
                            <p className="text-sm text-muted-foreground">
                              Contribution: {formatCurrency(distribution.contribution)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">
                              Part: {formatCurrency(distribution.share)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem?.type === 'supplier' ? 'Paiement Fournisseur' : 'Nouvelle Contribution'}
              </DialogTitle>
            </DialogHeader>
            <PaymentForm
              item={editingItem}
              members={members}
              onSubmit={async (data) => {
                try {
                  if (editingItem?.type === 'supplier') {
                    paymentsService.addSupplierPayment(data);
                  } else {
                    const member = members.find(m => m.id === data.memberId);
                    if (member) {
                      paymentsService.addContribution({
                        memberId: member.id,
                        memberName: member.name,
                        amount: data.amount,
                        method: data.method
                      });
                    }
                  }
                  setIsDialogOpen(false);
                  loadData();
                } catch (err) {
                  console.error('Error submitting payment:', err);
                }
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CooperativePayments;