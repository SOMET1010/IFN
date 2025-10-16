import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  CreditCard,
  Banknote,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { adminFinancialService, type FinancialStats, type FinancialTransaction, type PayoutRequest } from '@/services/admin/adminFinancialService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/format';

export default function AdminFinancial() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsResponse, transactionsResponse, payoutsResponse] = await Promise.all([
        adminFinancialService.getFinancialStats(),
        adminFinancialService.getTransactions(),
        adminFinancialService.getPayoutRequests()
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data);
      }
      if (payoutsResponse.success && payoutsResponse.data) {
        setPayouts(payoutsResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement finances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paiement</Badge>;
      case 'refund':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Remboursement</Badge>;
      case 'transfer':
        return <Badge variant="secondary">Transfert</Badge>;
      case 'fee':
        return <Badge variant="outline">Frais</Badge>;
      case 'commission':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Commission</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complété</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Approuvé</Badge>;
      case 'processed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Traité</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Finances">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<></>} title="Finances">
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Revenu Total"
              value={formatCurrency(stats.total_revenue)}
              description="Revenus générés"
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: stats.total_revenue, isPositive: true }}
            />
            <StatsCard
              title="Dépenses"
              value={formatCurrency(stats.total_expenses)}
              description="Dépenses totales"
              icon={<TrendingDown className="h-4 w-4" />}
              trend={{ value: stats.total_expenses, isPositive: false }}
            />
            <StatsCard
              title="Profit Net"
              value={formatCurrency(stats.net_profit)}
              description="Bénéfice net"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{ value: stats.net_profit, isPositive: stats.net_profit > 0 }}
            />
            <StatsCard
              title="Valeur Moyenne"
              value={formatCurrency(stats.average_transaction_value)}
              description="Transaction moyenne"
              icon={<BarChart3 className="h-4 w-4" />}
              trend={{ value: stats.average_transaction_value, isPositive: true }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Payouts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Demandes de Retrait</CardTitle>
                  <CardDescription>Demandes en attente de traitement</CardDescription>
                </div>
                <Badge variant="outline">
                  {payouts.filter(p => p.status === 'pending').length} en attente
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payouts.filter(p => p.status === 'pending').slice(0, 5).map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payout.user_name}</div>
                      <div className="text-sm text-gray-500">{payout.user_email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(payout.requested_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payout.net_amount)}</div>
                      <div className="text-sm text-gray-500">Frais: {formatCurrency(payout.fees)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {getPayoutStatusBadge(payout.status)}
                      </div>
                    </div>
                  </div>
                ))}
                {payouts.filter(p => p.status === 'pending').length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Aucune demande en attente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transactions Récentes</CardTitle>
                  <CardDescription>Dernières transactions</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(transaction.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div className="text-right">
                      {getTransactionTypeBadge(transaction.type)}
                      <div className="mt-1">
                        {getTransactionStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
