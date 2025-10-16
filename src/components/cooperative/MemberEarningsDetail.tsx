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
  X,
  Download,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
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
import type { MemberEarnings } from "@/types/payments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockEarnings: MemberEarnings = {
  memberId: "1",
  memberName: "Kouadio Yao",
  memberAvatar: "KY",
  totalEarnings: 18750000,
  earningsThisMonth: 6250000,
  numberOfSales: 12,
  topProduct: "Cacao",
  earningsHistory: [
    {
      date: "2025-10-15",
      amount: 6156250,
      productName: "Cacao",
      quantity: 2500,
      paymentId: "PAY-001",
      status: "completed",
    },
    {
      date: "2025-10-10",
      amount: 2400000,
      productName: "Café",
      quantity: 1200,
      paymentId: "PAY-002",
      status: "completed",
    },
    {
      date: "2025-10-05",
      amount: 1800000,
      productName: "Anacarde",
      quantity: 1200,
      paymentId: "PAY-003",
      status: "completed",
    },
    {
      date: "2025-09-28",
      amount: 3200000,
      productName: "Cacao",
      quantity: 1600,
      paymentId: "PAY-004",
      status: "completed",
    },
    {
      date: "2025-09-20",
      amount: 1500000,
      productName: "Karité",
      quantity: 750,
      paymentId: "PAY-005",
      status: "completed",
    },
  ],
};

const earningsByProduct = [
  { productName: "Cacao", earnings: 9356250 },
  { productName: "Café", earnings: 4800000 },
  { productName: "Anacarde", earnings: 2793750 },
  { productName: "Karité", earnings: 1800000 },
];

const earningsEvolution = [
  { month: "Mai", earnings: 2800000 },
  { month: "Juin", earnings: 3200000 },
  { month: "Juil", earnings: 2900000 },
  { month: "Août", earnings: 3500000 },
  { month: "Sept", earnings: 4700000 },
  { month: "Oct", earnings: 6250000 },
];

interface MemberEarningsDetailProps {
  memberId: string;
  memberName: string;
  onClose?: () => void;
  onDownloadStatement?: () => void;
}

export const MemberEarningsDetail = ({
  memberName,
  onClose,
  onDownloadStatement,
}: MemberEarningsDetailProps) => {
  const [earnings] = useState<MemberEarnings>(mockEarnings);
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  const filteredHistory = earnings.earningsHistory.filter((item) => {
    if (filterProduct !== "all" && item.productName !== filterProduct) return false;
    // Filtrage par période pourrait être ajouté ici
    return true;
  });

  const products = Array.from(new Set(earnings.earningsHistory.map((h) => h.productName)));

  const getStatusConfig = (status: string) => {
    const configs = {
      completed: {
        icon: CheckCircle,
        label: "Payé",
        color: "bg-green-100 text-green-700",
      },
      pending: {
        icon: Clock,
        label: "En attente",
        color: "bg-orange-100 text-orange-700",
      },
      failed: {
        icon: AlertCircle,
        label: "Échoué",
        color: "bg-red-100 text-red-700",
      },
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {earnings.memberAvatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{memberName}</h2>
                <p className="text-white/80 mt-1">Revenus et Historique de Paiements</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={onDownloadStatement}
                className="text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le Relevé
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Revenus Totaux</span>
              </div>
              <p className="text-2xl font-bold">
                {(earnings.totalEarnings / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Ce Mois</span>
              </div>
              <p className="text-2xl font-bold">
                {(earnings.earningsThisMonth / 1000000).toFixed(1)}M FCFA
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Nombre de Ventes</span>
              </div>
              <p className="text-2xl font-bold">{earnings.numberOfSales}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">Produit Principal</span>
              </div>
              <p className="text-2xl font-bold">{earnings.topProduct}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenus par produit */}
            <Card>
              <CardHeader>
                <CardTitle>Revenus par Produit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={earningsByProduct}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M FCFA`}
                    />
                    <Legend />
                    <Bar dataKey="earnings" fill="#22c55e" name="Revenus (FCFA)" />
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
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={earningsEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M FCFA`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Revenus (FCFA)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Historique des paiements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historique des Paiements</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="quarter">Ce trimestre</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterProduct} onValueChange={setFilterProduct}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Produit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les produits</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Ligne verticale de timeline */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {filteredHistory.map((item, index) => {
                    const statusConfig = getStatusConfig(item.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.div
                        key={item.paymentId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative pl-20"
                      >
                        {/* Icône de statut */}
                        <div
                          className={`absolute left-4 w-8 h-8 rounded-full ${statusConfig.color} border-2 border-white flex items-center justify-center z-10`}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </div>

                        {/* Card de paiement */}
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={statusConfig.color}>
                                    {statusConfig.label}
                                  </Badge>
                                  <span className="font-mono text-sm text-gray-600">
                                    {item.paymentId}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Produit</p>
                                    <p className="font-semibold">{item.productName}</p>
                                    <p className="text-xs text-gray-500">
                                      {item.quantity.toLocaleString("fr-FR")} kg
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Montant</p>
                                    <p className="text-xl font-bold text-green-600">
                                      {item.amount.toLocaleString("fr-FR")} FCFA
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-semibold">
                                      {format(new Date(item.date), "dd MMMM yyyy", {
                                        locale: fr,
                                      })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(item.date), "HH:mm", { locale: fr })}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {item.status === "completed" && (
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4 mr-1" />
                                  Reçu
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredHistory.length === 0 && (
                  <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Aucun paiement trouvé avec ces filtres</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

