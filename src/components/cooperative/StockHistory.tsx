import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Plus,
  Minus,
  ShoppingCart,
  Edit,
  Filter,
  Calendar,
  TrendingUp,
  Package,
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
import type { StockMovement, StockMovementType } from "@/types/stock";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Données mockées
const mockMovements: StockMovement[] = [
  {
    id: "1",
    type: "add",
    productId: "1",
    productName: "Cacao",
    memberId: "1",
    memberName: "Kouadio Yao",
    quantity: 2500,
    timestamp: "2025-10-15T10:30:00",
    resultingStock: 8500,
  },
  {
    id: "2",
    type: "sale",
    productId: "1",
    productName: "Cacao",
    memberId: "2",
    memberName: "Aminata Traoré",
    quantity: -1000,
    timestamp: "2025-10-14T14:20:00",
    resultingStock: 6000,
  },
  {
    id: "3",
    type: "add",
    productId: "2",
    productName: "Café",
    memberId: "2",
    memberName: "Aminata Traoré",
    quantity: 1500,
    timestamp: "2025-10-13T09:15:00",
    resultingStock: 3200,
  },
  {
    id: "4",
    type: "adjustment",
    productId: "1",
    productName: "Cacao",
    memberId: "admin",
    memberName: "Administrateur",
    quantity: -200,
    timestamp: "2025-10-12T16:45:00",
    resultingStock: 7000,
    notes: "Correction d'inventaire",
  },
  {
    id: "5",
    type: "add",
    productId: "3",
    productName: "Anacarde",
    memberId: "3",
    memberName: "Koné Seydou",
    quantity: 2800,
    timestamp: "2025-10-11T11:00:00",
    resultingStock: 5600,
  },
  {
    id: "6",
    type: "remove",
    productId: "1",
    productName: "Cacao",
    memberId: "4",
    memberName: "Bamba Fatou",
    quantity: -500,
    timestamp: "2025-10-10T13:30:00",
    resultingStock: 7200,
    notes: "Stock endommagé",
  },
];

const evolutionData = [
  { date: "10 Oct", stock: 7200 },
  { date: "11 Oct", stock: 7500 },
  { date: "12 Oct", stock: 7000 },
  { date: "13 Oct", stock: 7800 },
  { date: "14 Oct", stock: 6000 },
  { date: "15 Oct", stock: 8500 },
];

interface StockHistoryProps {
  onClose?: () => void;
}

export const StockHistory = ({ onClose }: StockHistoryProps) => {
  const [movements] = useState<StockMovement[]>(mockMovements);
  const [filterType, setFilterType] = useState<StockMovementType | "all">("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  const filteredMovements = movements.filter((m) => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (filterProduct !== "all" && m.productId !== filterProduct) return false;
    return true;
  });

  const products = Array.from(new Set(movements.map((m) => m.productName)));

  const getMovementConfig = (type: StockMovementType) => {
    const configs = {
      add: {
        icon: Plus,
        label: "Ajout",
        color: "green",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      },
      remove: {
        icon: Minus,
        label: "Retrait",
        color: "orange",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
      },
      sale: {
        icon: ShoppingCart,
        label: "Vente",
        color: "blue",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
      },
      adjustment: {
        icon: Edit,
        label: "Ajustement",
        color: "purple",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-200",
      },
    };
    return configs[type];
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historique des Stocks</h2>
          <p className="text-gray-500">Tous les mouvements de stock</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        )}
      </div>

      {/* Graphique d'évolution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution du Stock Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} kg`} />
              <Area
                type="monotone"
                dataKey="stock"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#stockGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filtres:</span>
            </div>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type d'opération" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="add">Ajouts</SelectItem>
                <SelectItem value="remove">Retraits</SelectItem>
                <SelectItem value="sale">Ventes</SelectItem>
                <SelectItem value="adjustment">Ajustements</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[180px]">
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

            <Badge variant="outline" className="ml-auto">
              {filteredMovements.length} mouvement(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline des mouvements */}
      <div className="relative">
        {/* Ligne verticale */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {filteredMovements.map((movement, index) => {
            const config = getMovementConfig(movement.type);
            const Icon = config.icon;

            return (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-20"
              >
                {/* Icône */}
                <div
                  className={`absolute left-4 w-8 h-8 rounded-full ${config.bgColor} ${config.borderColor} border-2 flex items-center justify-center z-10`}
                >
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                </div>

                {/* Card */}
                <Card className={`${config.borderColor} border-l-4`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${config.bgColor} ${config.textColor}`}>
                            {config.label}
                          </Badge>
                          <span className="font-semibold">{movement.productName}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Membre:</span>
                            <p className="font-semibold">{movement.memberName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantité:</span>
                            <p className={`font-bold ${movement.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                              {movement.quantity > 0 ? "+" : ""}
                              {movement.quantity.toLocaleString("fr-FR")} kg
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Stock résultant:</span>
                            <p className="font-semibold">
                              {movement.resultingStock.toLocaleString("fr-FR")} kg
                            </p>
                          </div>
                        </div>

                        {movement.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            Note: {movement.notes}
                          </p>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {format(new Date(movement.timestamp), "dd MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(movement.timestamp), "HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredMovements.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Aucun mouvement trouvé avec ces filtres</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

