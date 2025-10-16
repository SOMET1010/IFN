import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  X,
  CheckCircle,
  Loader2,
  Download,
  DollarSign,
  Users,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CollectivePayment, MemberDistribution, DistributionData, PaymentMethod } from "@/types/payments";

// Données mockées de distribution
const mockDistributions: MemberDistribution[] = [
  {
    memberId: "1",
    memberName: "Kouadio Yao",
    memberPhone: "+225 07 12 34 56 78",
    contribution: { productId: "1", quantity: 2500, percentage: 50 },
    amount: 6250000,
    fees: 93750,
    netAmount: 6156250,
    status: "pending",
  },
  {
    memberId: "2",
    memberName: "Aminata Traoré",
    memberPhone: "+225 07 23 45 67 89",
    contribution: { productId: "1", quantity: 1500, percentage: 30 },
    amount: 3750000,
    fees: 56250,
    netAmount: 3693750,
    status: "pending",
  },
  {
    memberId: "4",
    memberName: "Bamba Fatou",
    memberPhone: "+225 07 34 56 78 90",
    contribution: { productId: "1", quantity: 1000, percentage: 20 },
    amount: 2500000,
    fees: 37500,
    netAmount: 2462500,
    status: "pending",
  },
];

const COLORS = ["#f97316", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

type RedistributionStep = "review" | "confirm" | "processing" | "success";

interface PaymentRedistributionModalProps {
  payment: CollectivePayment;
  onClose: () => void;
  onConfirm: (distributionData: DistributionData) => void;
}

export const PaymentRedistributionModal = ({
  payment,
  onClose,
  onConfirm,
}: PaymentRedistributionModalProps) => {
  const [step, setStep] = useState<RedistributionStep>("review");
  const [distributions] = useState<MemberDistribution[]>(mockDistributions);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile-money");
  const [transactionIds, setTransactionIds] = useState<string[]>([]);

  const totalFees = distributions.reduce((sum, d) => sum + d.fees, 0);
  const netTotal = distributions.reduce((sum, d) => sum + d.netAmount, 0);
  const feeRate = 1.5; // 1.5% pour mobile money

  const pieData = distributions.map((d) => ({
    name: d.memberName,
    value: d.amount,
  }));

  const handleConfirm = () => {
    setStep("confirm");
  };

  const handleProceed = async () => {
    setStep("processing");

    // Simuler le traitement
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Générer des IDs de transaction
    const txIds = distributions.map((_, idx) => `TXN${Date.now()}-${idx + 1}`);
    setTransactionIds(txIds);

    const distributionData: DistributionData = {
      paymentId: payment.id,
      totalAmount: payment.amount,
      distributions: distributions.map((d, idx) => ({
        ...d,
        status: "completed" as const,
        paidAt: new Date().toISOString(),
        receiptUrl: `/receipts/${txIds[idx]}.pdf`,
      })),
      paymentMethod,
      totalFees,
      netTotal,
    };

    onConfirm(distributionData);
    setStep("success");
  };

  const handleDownloadReceipts = () => {
    console.log("Téléchargement des reçus:", transactionIds);
  };

  const handleComplete = () => {
    onClose();
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
            <div>
              <h2 className="text-2xl font-bold">Redistribution du Paiement</h2>
              <p className="text-white/80 mt-1">Paiement {payment.id}</p>
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

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Montant Total</span>
              </div>
              <p className="text-2xl font-bold">{payment.amount.toLocaleString("fr-FR")} FCFA</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm">Bénéficiaires</span>
              </div>
              <p className="text-2xl font-bold">{distributions.length} membres</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Frais Totaux</span>
              </div>
              <p className="text-2xl font-bold">{totalFees.toLocaleString("fr-FR")} FCFA</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          <AnimatePresence mode="wait">
            {/* Étape 1: Révision */}
            {step === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tableau de distribution */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Détail de la Redistribution</h3>
                    <div className="space-y-3">
                      {distributions.map((dist) => (
                        <Card key={dist.memberId}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">{dist.memberName}</p>
                                <p className="text-sm text-gray-500">{dist.memberPhone}</p>
                              </div>
                              <Badge className="bg-blue-100 text-blue-700">
                                {dist.contribution.percentage}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-gray-600">Contribution</p>
                                <p className="font-semibold">
                                  {dist.contribution.quantity.toLocaleString("fr-FR")} kg
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Montant brut</p>
                                <p className="font-semibold">
                                  {dist.amount.toLocaleString("fr-FR")} FCFA
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Frais ({feeRate}%)</p>
                                <p className="font-semibold text-orange-600">
                                  -{dist.fees.toLocaleString("fr-FR")} FCFA
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Montant net</p>
                                <p className="font-bold text-green-600">
                                  {dist.netAmount.toLocaleString("fr-FR")} FCFA
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Graphique circulaire */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Répartition Visuelle</h3>
                    <Card>
                      <CardContent className="p-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-6 space-y-2 border-t pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total brut</span>
                            <span className="font-semibold">
                              {payment.amount.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Frais totaux ({feeRate}%)</span>
                            <span className="font-semibold text-orange-600">
                              -{totalFees.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold">Total net à distribuer</span>
                            <span className="text-xl font-bold text-green-600">
                              {netTotal.toLocaleString("fr-FR")} FCFA
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Méthode de paiement</label>
                      <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile-money">
                            Mobile Money (Frais: {feeRate}%)
                          </SelectItem>
                          <SelectItem value="bank-transfer">
                            Virement bancaire (Frais: 0.5%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                  >
                    Confirmer la Redistribution
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Étape 2: Confirmation */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="py-8 text-center"
              >
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                <h3 className="text-2xl font-bold mb-2">Confirmer la Redistribution</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Vous êtes sur le point de redistribuer{" "}
                  <span className="font-bold text-green-600">
                    {netTotal.toLocaleString("fr-FR")} FCFA
                  </span>{" "}
                  à {distributions.length} membres. Cette action est irréversible.
                </p>

                <Card className="max-w-md mx-auto mb-6">
                  <CardContent className="p-6 space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant total</span>
                      <span className="font-semibold">{payment.amount.toLocaleString("fr-FR")} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frais de transaction</span>
                      <span className="font-semibold text-orange-600">
                        -{totalFees.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode</span>
                      <span className="font-semibold">
                        {paymentMethod === "mobile-money" ? "Mobile Money" : "Virement bancaire"}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="font-semibold">Total à distribuer</span>
                      <span className="text-xl font-bold text-green-600">
                        {netTotal.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep("review")}>
                    Retour
                  </Button>
                  <Button
                    onClick={handleProceed}
                    className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                  >
                    Procéder au Paiement
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Traitement */}
            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center"
              >
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-orange-600 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">Redistribution en cours...</h3>
                <p className="text-gray-500">
                  Nous traitons les paiements vers les {distributions.length} membres
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  Cela peut prendre quelques instants
                </p>
              </motion.div>
            )}

            {/* Étape 4: Succès */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Redistribution Réussie !
                </h3>
                <p className="text-gray-600 mb-6">
                  {distributions.length} membres ont été payés avec succès
                </p>

                <Card className="max-w-2xl mx-auto mb-6">
                  <CardHeader>
                    <CardTitle>Récapitulatif des Paiements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {distributions.map((dist, idx) => (
                        <div key={dist.memberId} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="text-left">
                            <p className="font-semibold">{dist.memberName}</p>
                            <p className="text-xs text-gray-500 font-mono">TXN: {transactionIds[idx]}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">
                              {dist.netAmount.toLocaleString("fr-FR")} FCFA
                            </p>
                            <Badge className="bg-green-100 text-green-700">Payé</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={handleDownloadReceipts}>
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger les Reçus
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                  >
                    Terminer
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

