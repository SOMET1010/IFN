import { useState, useEffect } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsService, Transaction } from '@/services/supabase/transactionsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MerchantTransactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, statusFilter, operatorFilter]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await transactionsService.getTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.transaction_code.toLowerCase().includes(term) ||
        t.phone_number.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (operatorFilter !== 'all') {
      filtered = filtered.filter(t => t.operator === operatorFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
      success: { label: 'Réussi', variant: 'default', icon: CheckCircle2 },
      failed: { label: 'Échoué', variant: 'destructive', icon: XCircle },
      pending: { label: 'En attente', variant: 'secondary', icon: Clock },
      processing: { label: 'Traitement', variant: 'outline', icon: Loader2 },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getOperatorEmoji = (operator: string) => {
    const emojis: Record<string, string> = {
      orange: '🟠',
      mtn: '🟡',
      wave: '🔵',
      moov: '🔴'
    };
    return emojis[operator] || '💳';
  };

  const exportToCSV = () => {
    const headers = ['Code', 'Date', 'Opérateur', 'Téléphone', 'Montant', 'Statut'];
    const rows = filteredTransactions.map(t => [
      t.transaction_code,
      format(new Date(t.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
      t.operator,
      t.phone_number,
      t.amount.toString(),
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions-${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: 'Les transactions ont été exportées',
    });
  };

  const calculateStats = () => {
    const successful = transactions.filter(t => t.status === 'success');
    const totalAmount = successful.reduce((sum, t) => sum + t.amount, 0);
    const avgAmount = successful.length > 0 ? totalAmount / successful.length : 0;

    return {
      total: transactions.length,
      successful: successful.length,
      failed: transactions.filter(t => t.status === 'failed').length,
      pending: transactions.filter(t => t.status === 'pending' || t.status === 'processing').length,
      totalAmount,
      avgAmount,
      successRate: transactions.length > 0 ? (successful.length / transactions.length) * 100 : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions Mobile Money</h1>
          <p className="text-muted-foreground mt-2">
            Consultez l'historique de toutes vos transactions
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Montant total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} F</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de réussite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Montant moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgAmount.toLocaleString()} F</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historique des transactions</CardTitle>
                <CardDescription>
                  {filteredTransactions.length} transaction(s) trouvée(s)
                </CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par code ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="success">Réussi</SelectItem>
                    <SelectItem value="failed">Échoué</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={operatorFilter} onValueChange={setOperatorFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Opérateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les opérateurs</SelectItem>
                    <SelectItem value="orange">Orange Money</SelectItem>
                    <SelectItem value="mtn">MTN Money</SelectItem>
                    <SelectItem value="wave">Wave</SelectItem>
                    <SelectItem value="moov">Moov Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Opérateur</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucune transaction trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-sm">
                            {transaction.transaction_code}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(transaction.created_at), 'dd/MM/yy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getOperatorEmoji(transaction.operator)}</span>
                              <span className="text-sm capitalize">{transaction.operator}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{transaction.phone_number}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {transaction.amount.toLocaleString()} F
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MerchantLayout>
  );
}
