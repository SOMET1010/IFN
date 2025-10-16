import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingUp,
  X,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StockAlert } from "@/types/stock";

// Données mockées
const mockAlerts: StockAlert[] = [
  {
    id: "1",
    type: "low-stock",
    severity: "critical",
    productId: "4",
    productName: "Karité",
    message: "Stock critique: seulement 450 kg restants",
    recommendations: [
      "Contacter les membres pour augmenter la production",
      "Lancer une commande groupée d'approvisionnement",
      "Réduire temporairement les ventes",
    ],
    createdAt: "2025-10-15T10:00:00",
  },
  {
    id: "2",
    type: "no-movement",
    severity: "warning",
    productId: "6",
    productName: "Bananes",
    message: "Aucun mouvement depuis 35 jours",
    recommendations: [
      "Vérifier la qualité du stock",
      "Proposer une promotion pour écouler le stock",
      "Contacter les marchands potentiels",
    ],
    createdAt: "2025-10-14T14:30:00",
  },
  {
    id: "3",
    type: "quality-disparity",
    severity: "warning",
    productId: "1",
    productName: "Cacao",
    message: "Disparité de qualité détectée: 60% qualité A, 40% qualité C",
    recommendations: [
      "Former les membres aux standards de qualité",
      "Séparer les lots par qualité pour la vente",
      "Mettre en place un système de contrôle qualité",
    ],
    createdAt: "2025-10-13T09:15:00",
  },
  {
    id: "4",
    type: "opportunity",
    severity: "info",
    productId: "2",
    productName: "Café",
    message: "Demande élevée détectée: 5 marchands intéressés",
    recommendations: [
      "Préparer une offre groupée attractive",
      "Négocier un prix avantageux",
      "Contacter les membres pour augmenter la production",
    ],
    createdAt: "2025-10-12T16:45:00",
  },
  {
    id: "5",
    type: "low-stock",
    severity: "warning",
    productId: "5",
    productName: "Mangues",
    message: "Stock faible: 800 kg restants (seuil: 1000 kg)",
    recommendations: [
      "Surveiller l'évolution du stock",
      "Planifier un réapprovisionnement",
    ],
    createdAt: "2025-10-11T11:20:00",
  },
];

interface StockAlertsProps {
  onClose?: () => void;
}

export const StockAlerts = ({ onClose }: StockAlertsProps) => {
  const [alerts, setAlerts] = useState<StockAlert[]>(mockAlerts);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");

  const filteredAlerts = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  const getSeverityConfig = (severity: StockAlert["severity"]) => {
    const configs = {
      critical: {
        icon: AlertTriangle,
        label: "Critique",
        color: "red",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-500",
        badgeColor: "bg-red-100 text-red-700",
      },
      warning: {
        icon: AlertCircle,
        label: "Important",
        color: "orange",
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-500",
        badgeColor: "bg-orange-100 text-orange-700",
      },
      info: {
        icon: Info,
        label: "Information",
        color: "blue",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-500",
        badgeColor: "bg-blue-100 text-blue-700",
      },
    };
    return configs[severity];
  };

  const getTypeConfig = (type: StockAlert["type"]) => {
    const configs = {
      "low-stock": {
        label: "Stock Faible",
        icon: AlertTriangle,
      },
      "no-movement": {
        label: "Stock Dormant",
        icon: EyeOff,
      },
      "quality-disparity": {
        label: "Disparité Qualité",
        icon: Eye,
      },
      opportunity: {
        label: "Opportunité",
        icon: TrendingUp,
      },
    };
    return configs[type];
  };

  const handleResolve = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleIgnore = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alertes de Stock</h2>
          <p className="text-gray-500">{alerts.length} alerte(s) active(s)</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            filter === "all" ? "ring-2 ring-gray-500" : ""
          }`}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filter === "critical" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => setFilter("critical")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filter === "warning" ? "ring-2 ring-orange-500" : ""
          }`}
          onClick={() => setFilter("warning")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Importants</p>
                <p className="text-2xl font-bold text-orange-600">{warningCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            filter === "info" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setFilter("info")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Infos</p>
                <p className="text-2xl font-bold text-blue-600">{infoCount}</p>
              </div>
              <Info className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlerts.map((alert, index) => {
          const severityConfig = getSeverityConfig(alert.severity);
          const typeConfig = getTypeConfig(alert.type);
          const SeverityIcon = severityConfig.icon;
          const TypeIcon = typeConfig.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-l-4 ${severityConfig.borderColor}`}>
                <CardHeader className={severityConfig.bgColor}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <SeverityIcon className={`w-6 h-6 ${severityConfig.textColor} mt-1`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={severityConfig.badgeColor}>
                            {severityConfig.label}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{alert.productName}</CardTitle>
                        <p className={`text-sm ${severityConfig.textColor} mt-1`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleIgnore(alert.id)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Actions recommandées:</p>
                      <ul className="space-y-1">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleIgnore(alert.id)}
                        >
                          Ignorer
                        </Button>
                        <Button
                          size="sm"
                          className={`bg-${severityConfig.color}-600 hover:bg-${severityConfig.color}-700`}
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Résoudre
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-gray-500">Aucune alerte dans cette catégorie</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

