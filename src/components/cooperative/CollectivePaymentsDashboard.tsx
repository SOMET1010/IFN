import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Download,
  Filter,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CollectivePayment, PaymentStats } from "@/types/payments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockPayments: CollectivePayment[] = [
  {
    id: "PAY-001",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    amount: 12500000,
    currency: "XOF",
    paymentMethod: "mobile-money",
    status: "received",
    receivedAt: "2025-10-15T10:30:00",
    saleId: "SALE-001",
    products: [
      { productId: "1", productName: "Cacao", quantity: 5000, unitPrice: 2500, totalPrice: 12500000 },
    ],
    buyer: { id: "BUYER-1", name: "Établissements KOFFI", contact: "+225 07 12 34 56 78" },
    invoiceNumber: "FACT-2025-001",
  },
  {
    id: "PAY-002",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    amount: 6400000,
    currency: "XOF",
    paymentMethod: "bank-transfer",
    status: "redistributed",
    receivedAt: "2025-10-10T14:20:00",
    redistributedAt: "2025-10-11T09:00:00",
    saleId: "SALE-002",
    products: [
      { productId: "2", productName: "Café", quantity: 3200, unitPrice: 2000, totalPrice: 6400000 },
    ],
    buyer: { id: "BUYER-2", name: "SARL AGRO-EXPORT", contact: "+225 07 23 45 67 89" },
    invoiceNumber: "FACT-2025-002",
  },
  {
    id: "PAY-003",
    cooperativeId: "COOP-1",
    cooperativeName: "Coopérative N'Zi",
    amount: 8400000,
    currency: "XOF",
    paymentMethod: "mobile-money",
    status: "pending",
    saleId: "SALE-003",
    products: [
      { productId: "3", productName: "Anacarde", quantity: 5600, unitPrice: 1500, totalPrice: 8400000 },
    ],
    buyer: { id: "BUYER-3", name: "Comptoir Commercial", contact: "+225 07 34 56 78 90" },
  },
];

const mockStats: PaymentStats = {
  totalRevenue: 45300000,
  pendingPayments: 2,
  membersPaid: 32,
  redistributionRate: 87,
  revenueByProduct: [
    { productName: "Cacao", revenue: 18500000, quantity: 7400 },
    { productName: "Café", revenue: 12300000, quantity: 6150 },
    { productName: "Anacarde", revenue: 8400000, quantity: 5600 },
    { productName: "Karité", revenue: 6100000, quantity: 2540 },
  ],
  revenueHistory: [
    { month: "Mai", revenue: 32000000 },
    { month: "Juin", revenue: 38000000 },
    { month: "Juil", revenue: 35000000 },
    { month: "Août", revenue: 42000000 },
    { month: "Sept", revenue: 39000000 },
    { month: "Oct", revenue: 45300000 },
  ],
};

interface CollectivePaymentsDashboardProps {
  onViewPayment?: (paymentId: string) => void;
  onRedistribute?: (paymentId: string) => void;
  onGenerateInvoice?: (paymentId: string) => void;
  onViewMemberEarnings?: (memberId: string) => void;
}

export const CollectivePaymentsDashboard = ({
  onViewPayment,
  onRedistribute,
  onGenerateInvoice,
}: CollectivePaymentsDashboardProps) => {
  const [payments] = useState<CollectivePayment[]>(mockPayments);
  const [stats] = useState<PaymentStats>(mockStats);
  const [period, setPeriod] = useState<string>("month");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredPayments = filterStatus === "all" 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  const getStatusConfig = (status: CollectivePayment["status"]) => {
    const configs = {
      pending: { label: "En attente", color: "bg-orange-100 text-orange-700" },
      received: { label: "Reçu", color: "bg-blue-100 text-blue-700" },
      redistributed: { label: "Redistribué", color: "bg-green-100 text-green-700" },
      failed: { label: "Échoué", color: "bg-red-100 text-red-700" },
    };
    return configs[status];
  };

  const getPaymentMethodLabel = (method: CollectivePayment["paymentMethod"]) => {
    const labels = {
      "mobile-money": "Mobile Money",
      "bank-transfer": "Virement bancaire",
      "cash": "Espèces",
    };
    return labels[method];
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paiements Collectifs</h2>
          <p className="text-gray-500">Gestion des revenus et redistribution</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {(stats.totalRevenue / 1000000).toFixed(1)}M
            </h3>
            <p className="text-sm text-gray-500">Revenus Totaux (FCFA)</p>
            <p className="text-xs text-green-600 mt-2">+23% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingPayments}</h3>
            <p className="text-sm text-gray-500">Paiements en Attente</p>
            <p className="text-xs text-orange-600 mt-2">À redistribuer</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.membersPaid}</h3>
            <p className="text-sm text-gray-500">Membres Payés</p>
            <p className="text-xs text-blue-600 mt-2">Ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.redistributionRate}%</h3>
            <p className="text-sm text-gray-500">Taux de Redistribution</p>
            <p className="text-xs text-purple-600 mt-2">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par produit */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus par Produit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.revenueByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M FCFA`} />
                <Legend />
                <Bar dataKey="revenue" fill="#f97316" name="Revenus (FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution des revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Revenus (6 mois)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M FCFA`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Revenus (FCFA)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des paiements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Historique des Paiements</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="received">Reçus</SelectItem>
                  <SelectItem value="redistributed">Redistribués</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment, index) => {
              const statusConfig = getStatusConfig(payment.status);
              
              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            <span className="font-mono text-sm text-gray-600">{payment.id}</span>
                            {payment.invoiceNumber && (
                              <span className="text-sm text-gray-500">
                                Facture: {payment.invoiceNumber}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Acheteur</p>
                              <p className="font-semibold">{payment.buyer.name}</p>
                              <p className="text-xs text-gray-500">{payment.buyer.contact}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Produits</p>
                              {payment.products.map((product) => (
                                <p key={product.productId} className="font-semibold">
                                  {product.productName} ({product.quantity} kg)
                                </p>
                              ))}
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Montant</p>
                              <p className="text-xl font-bold text-green-600">
                                {payment.amount.toLocaleString("fr-FR")} FCFA
                              </p>
                              <p className="text-xs text-gray-500">
                                {getPaymentMethodLabel(payment.paymentMethod)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-semibold">
                                {payment.receivedAt
                                  ? format(new Date(payment.receivedAt), "dd MMM yyyy", { locale: fr })
                                  : "En attente"}
                              </p>
                              {payment.redistributedAt && (
                                <p className="text-xs text-green-600">
                                  Redistribué le{" "}
                                  {format(new Date(payment.redistributedAt), "dd MMM", { locale: fr })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewPayment?.(payment.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                          {payment.status === "received" && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-green-600"
                              onClick={() => onRedistribute?.(payment.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Redistribuer
                            </Button>
                          )}
                          {payment.invoiceNumber && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onGenerateInvoice?.(payment.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Facture
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Aucun paiement trouvé avec ces filtres</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

