import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ProductStock } from "@/types/stock";

// Données mockées
const mockStocks: ProductStock[] = [
  {
    productId: "1",
    productName: "Cacao",
    productImage: "/assets/products/cacao.jpg",
    totalQuantity: 8500,
    unit: "kg",
    estimatedValue: 12750000,
    lastUpdate: new Date().toISOString(),
    contributions: [
      { memberId: "1", memberName: "Kouadio Yao", quantity: 2500, quality: "A", location: "Entrepôt A", declaredAt: "2025-10-10" },
      { memberId: "2", memberName: "Aminata Traoré", quantity: 1800, quality: "A", location: "Entrepôt A", declaredAt: "2025-10-12" },
      { memberId: "4", memberName: "Bamba Fatou", quantity: 3200, quality: "B", location: "Entrepôt B", declaredAt: "2025-10-14" },
      { memberId: "5", memberName: "Ouattara Ibrahim", quantity: 1000, quality: "C", location: "Entrepôt C", declaredAt: "2025-10-15" },
    ],
  },
  {
    productId: "2",
    productName: "Café",
    productImage: "/assets/products/cafe.jpg",
    totalQuantity: 3200,
    unit: "kg",
    estimatedValue: 6400000,
    lastUpdate: new Date().toISOString(),
    contributions: [
      { memberId: "2", memberName: "Aminata Traoré", quantity: 1500, quality: "A", location: "Entrepôt A", declaredAt: "2025-10-11" },
      { memberId: "4", memberName: "Bamba Fatou", quantity: 1700, quality: "B", location: "Entrepôt B", declaredAt: "2025-10-13" },
    ],
  },
  {
    productId: "3",
    productName: "Anacarde",
    productImage: "/assets/products/anacarde.jpg",
    totalQuantity: 5600,
    unit: "kg",
    estimatedValue: 8400000,
    lastUpdate: new Date().toISOString(),
    contributions: [
      { memberId: "3", memberName: "Koné Seydou", quantity: 2800, quality: "A", location: "Entrepôt A", declaredAt: "2025-10-09" },
      { memberId: "5", memberName: "Ouattara Ibrahim", quantity: 2800, quality: "A", location: "Entrepôt B", declaredAt: "2025-10-10" },
    ],
  },
  {
    productId: "4",
    productName: "Karité",
    productImage: "/assets/products/karite.jpg",
    totalQuantity: 1200,
    unit: "kg",
    estimatedValue: 2400000,
    lastUpdate: new Date().toISOString(),
    contributions: [
      { memberId: "4", memberName: "Bamba Fatou", quantity: 1200, quality: "A", location: "Entrepôt A", declaredAt: "2025-10-08" },
    ],
  },
];

interface StockAggregationDashboardProps {
  onAddStock?: () => void;
  onViewHistory?: () => void;
  onViewAlerts?: () => void;
}

export const StockAggregationDashboard = ({
  onAddStock,
  onViewHistory,
  onViewAlerts,
}: StockAggregationDashboardProps) => {
  const [stocks] = useState<ProductStock[]>(mockStocks);
  const [lastSync, setLastSync] = useState(new Date());
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Simuler la synchronisation en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalStock = stocks.reduce((sum, s) => sum + s.totalQuantity, 0);
  const totalValue = stocks.reduce((sum, s) => sum + s.estimatedValue, 0);
  const totalProducts = stocks.length;
  const totalContributors = new Set(stocks.flatMap((s) => s.contributions.map((c) => c.memberId))).size;

  const getStockLevel = (quantity: number): { level: number; color: string; label: string } => {
    if (quantity > 5000) return { level: 100, color: "green", label: "Élevé" };
    if (quantity > 2000) return { level: 70, color: "blue", label: "Normal" };
    if (quantity > 500) return { level: 40, color: "orange", label: "Moyen" };
    return { level: 20, color: "red", label: "Faible" };
  };

  const getChartData = (product: ProductStock) => {
    return product.contributions.map((c) => ({
      name: c.memberName.split(" ")[0],
      quantity: c.quantity,
      quality: c.quality,
    }));
  };

  const selectedProductData = selectedProduct
    ? stocks.find((s) => s.productId === selectedProduct)
    : null;

  const secondsSinceSync = Math.floor((new Date().getTime() - lastSync.getTime()) / 1000);

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agrégation des Stocks</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-500">
                Synchronisé il y a {secondsSinceSync}s
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewHistory}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Historique
          </Button>
          <Button variant="outline" onClick={onViewAlerts}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Alertes
          </Button>
          <Button
            onClick={onAddStock}
            className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Déclarer du Stock
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {(totalStock / 1000).toFixed(1)}T
            </h3>
            <p className="text-sm text-gray-500">Stock Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalProducts}</h3>
            <p className="text-sm text-gray-500">Produits Différents</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {(totalValue / 1000000).toFixed(1)}M
            </h3>
            <p className="text-sm text-gray-500">Valeur Estimée (FCFA)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalContributors}</h3>
            <p className="text-sm text-gray-500">Membres Contributeurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Cards par produit */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock, index) => {
          const stockLevel = getStockLevel(stock.totalQuantity);
          const isSelected = selectedProduct === stock.productId;

          return (
            <motion.div
              key={stock.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-lg transition-all ${
                  isSelected ? "ring-2 ring-orange-500" : ""
                }`}
                onClick={() => setSelectedProduct(isSelected ? null : stock.productId)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{stock.productName}</span>
                    <Badge className={`bg-${stockLevel.color}-100 text-${stockLevel.color}-700`}>
                      {stockLevel.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Quantité totale</span>
                        <span className="font-bold text-lg">
                          {stock.totalQuantity.toLocaleString("fr-FR")} {stock.unit}
                        </span>
                      </div>
                      <Progress value={stockLevel.level} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Contributeurs</span>
                      <span className="font-semibold">{stock.contributions.length} membres</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valeur estimée</span>
                      <span className="font-semibold text-green-600">
                        {(stock.estimatedValue / 1000000).toFixed(1)}M FCFA
                      </span>
                    </div>

                    <div className="text-xs text-gray-400">
                      Mis à jour: {new Date(stock.lastUpdate).toLocaleTimeString("fr-FR")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Graphique détaillé du produit sélectionné */}
      {selectedProductData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Détail des Contributions - {selectedProductData.productName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData(selectedProductData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} kg`} />
                  <Legend />
                  <Bar dataKey="quantity" fill="#f97316" name="Quantité (kg)" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedProductData.contributions.map((contribution) => (
                  <Card key={contribution.memberId}>
                    <CardContent className="p-4">
                      <p className="font-semibold mb-2">{contribution.memberName}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantité</span>
                          <span className="font-semibold">{contribution.quantity} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Qualité</span>
                          <Badge
                            className={
                              contribution.quality === "A"
                                ? "bg-green-100 text-green-700"
                                : contribution.quality === "B"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {contribution.quality}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Localisation</span>
                          <span className="font-semibold text-xs">{contribution.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

