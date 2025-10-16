import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  DollarSign,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MemberSocialContributions, OrganismType } from "@/types/socialContributions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface MemberContributionDetailProps {
  member: MemberSocialContributions;
  onClose: () => void;
  onPay: (organism: OrganismType | "all") => void;
}

interface PaymentHistory {
  date: string;
  amount: number;
  status: "paid" | "late" | "pending";
}

const mockHistory: Record<OrganismType, PaymentHistory[]> = {
  cnps: [
    { date: "2025-10-01", amount: 15000, status: "paid" },
    { date: "2025-09-01", amount: 15000, status: "paid" },
    { date: "2025-08-01", amount: 15000, status: "paid" },
    { date: "2025-07-01", amount: 15000, status: "paid" },
  ],
  cmu: [
    { date: "2025-10-01", amount: 1000, status: "paid" },
    { date: "2025-09-01", amount: 1000, status: "paid" },
    { date: "2025-08-01", amount: 1000, status: "late" },
    { date: "2025-07-01", amount: 1000, status: "paid" },
  ],
  cnam: [
    { date: "2025-10-01", amount: 2000, status: "pending" },
    { date: "2025-09-01", amount: 2000, status: "late" },
    { date: "2025-08-01", amount: 2000, status: "late" },
    { date: "2025-07-01", amount: 2000, status: "paid" },
  ],
};

export const MemberContributionDetail = ({
  member,
  onClose,
  onPay,
}: MemberContributionDetailProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<OrganismType, boolean>>({
    cnps: true,
    cmu: false,
    cnam: false,
  });

  const toggleSection = (organism: OrganismType) => {
    setExpandedSections((prev) => ({
      ...prev,
      [organism]: !prev[organism],
    }));
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "up-to-date": {
        label: "À jour",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
      },
      late: {
        label: "En retard",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: Clock,
      },
      "not-enrolled": {
        label: "Non inscrit",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: XCircle,
      },
    };
    return configs[status as keyof typeof configs];
  };

  const getOrganismConfig = (organism: OrganismType) => {
    const configs = {
      cnps: {
        name: "CNPS",
        fullName: "Caisse Nationale de Prévoyance Sociale",
        color: "blue",
        description: "Retraite et prestations familiales",
      },
      cmu: {
        name: "CMU",
        fullName: "Couverture Maladie Universelle",
        color: "green",
        description: "Couverture santé universelle",
      },
      cnam: {
        name: "CNAM",
        fullName: "Caisse Nationale d'Assurance Maladie",
        color: "purple",
        description: "Assurance maladie et accidents",
      },
    };
    return configs[organism];
  };

  const renderOrganismSection = (organism: OrganismType) => {
    const contribution = member[organism];
    const config = getOrganismConfig(organism);
    const statusConfig = getStatusConfig(contribution.status);
    const isExpanded = expandedSections[organism];
    const history = mockHistory[organism];

    return (
      <Card key={organism} className="overflow-hidden">
        <CardHeader
          className={`cursor-pointer bg-${config.color}-50 hover:bg-${config.color}-100 transition-colors`}
          onClick={() => toggleSection(organism)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className={`text-${config.color}-700 flex items-center gap-2`}>
                {config.name}
                <Badge className={`${statusConfig.color} border`}>
                  <statusConfig.icon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{config.fullName}</p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-6 space-y-4">
                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Dernier paiement</p>
                    <p className="font-semibold">
                      {contribution.lastPayment
                        ? format(new Date(contribution.lastPayment), "dd MMMM yyyy", { locale: fr })
                        : "Aucun"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant mensuel</p>
                    <p className="font-semibold text-green-600">
                      {contribution.monthlyRate.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>

                {contribution.daysLate && contribution.daysLate > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-900">Retard de {contribution.daysLate} jours</p>
                        <p className="text-sm text-orange-700 mt-1">
                          Montant dû : {contribution.amount.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Historique des 12 derniers mois */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Historique des paiements
                  </h4>
                  <div className="space-y-2">
                    {history.map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {payment.status === "paid" && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {payment.status === "late" && (
                            <Clock className="w-4 h-4 text-orange-600" />
                          )}
                          {payment.status === "pending" && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="text-sm">
                            {format(new Date(payment.date), "MMMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            {payment.amount.toLocaleString("fr-FR")} FCFA
                          </span>
                          {payment.status === "paid" && (
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton de paiement */}
                {contribution.status !== "up-to-date" && (
                  <Button
                    onClick={() => onPay(organism)}
                    className={`w-full bg-${config.color}-600 hover:bg-${config.color}-700`}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Payer {config.name} ({contribution.amount.toLocaleString("fr-FR")} FCFA)
                  </Button>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  const totalDue =
    (member.cnps.status === "late" ? member.cnps.amount : 0) +
    (member.cmu.status === "late" ? member.cmu.amount : 0) +
    (member.cnam.status === "late" ? member.cnam.amount : 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                {member.memberName.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{member.memberName}</h2>
                <p className="text-white/80">Cotisations Sociales</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {totalDue > 0 && (
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/90">Total dû</span>
                <span className="text-2xl font-bold">{totalDue.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {renderOrganismSection("cnps")}
          {renderOrganismSection("cmu")}
          {renderOrganismSection("cnam")}
        </div>

        {/* Footer */}
        {totalDue > 0 && (
          <div className="border-t p-6 bg-gray-50">
            <Button
              onClick={() => onPay("all")}
              className="w-full bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-lg py-6"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Payer Tout ({totalDue.toLocaleString("fr-FR")} FCFA)
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

