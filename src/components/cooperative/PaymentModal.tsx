import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle,
  Loader2,
  Download,
  Phone,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { OrganismType, PaymentMethod } from "@/types/socialContributions";

interface PaymentModalProps {
  organism: OrganismType | "all";
  amount: number;
  memberName: string;
  onClose: () => void;
  onSuccess: (transactionId: string) => void;
}

type PaymentStep = "select-method" | "enter-details" | "processing" | "success";

const mobileMoneyProviders = [
  {
    id: "orange" as const,
    name: "Orange Money",
    logo: "/pictogrammes/orange-money.png",
    color: "orange",
  },
  {
    id: "mtn" as const,
    name: "MTN Mobile Money",
    logo: "/pictogrammes/mtn-money.png",
    color: "yellow",
  },
  {
    id: "moov" as const,
    name: "Moov Money",
    logo: "/pictogrammes/moov-money.png",
    color: "blue",
  },
  {
    id: "wave" as const,
    name: "Wave",
    logo: "/pictogrammes/wave.png",
    color: "pink",
  },
];

const organismNames = {
  cnps: "CNPS",
  cmu: "CMU",
  cnam: "CNAM",
  all: "Toutes les cotisations",
};

export const PaymentModal = ({
  organism,
  amount,
  memberName,
  onClose,
  onSuccess,
}: PaymentModalProps) => {
  const [step, setStep] = useState<PaymentStep>("select-method");
  const [selectedProvider, setSelectedProvider] = useState<PaymentMethod["provider"] | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const handleProviderSelect = (provider: PaymentMethod["provider"]) => {
    setSelectedProvider(provider);
    setStep("enter-details");
  };

  const handlePayment = async () => {
    setStep("processing");

    // Simuler le traitement du paiement
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const txId = `TXN${Date.now()}`;
    setTransactionId(txId);
    setStep("success");
  };

  const handleDownloadReceipt = () => {
    // Simuler le téléchargement du reçu
    console.log("Téléchargement du reçu:", transactionId);
  };

  const handleComplete = () => {
    onSuccess(transactionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Paiement de Cotisation</h2>
              <p className="text-white/80 mt-1">{memberName}</p>
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

          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-white/90">{organismNames[organism]}</span>
              <span className="text-2xl font-bold">{amount.toLocaleString("fr-FR")} FCFA</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Étape 1: Sélection du fournisseur */}
            {step === "select-method" && (
              <motion.div
                key="select-method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold mb-4">Choisissez votre méthode de paiement</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mobileMoneyProviders.map((provider) => (
                    <Card
                      key={provider.id}
                      className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-orange-500"
                      onClick={() => handleProviderSelect(provider.id)}
                    >
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                          <DollarSign className={`w-8 h-8 text-${provider.color}-600`} />
                        </div>
                        <p className="font-semibold">{provider.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Étape 2: Saisie des détails */}
            {step === "enter-details" && selectedProvider && (
              <motion.div
                key="enter-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {mobileMoneyProviders.find((p) => p.id === selectedProvider)?.name}
                  </h3>
                  <p className="text-gray-500 mt-1">Entrez votre numéro de téléphone</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+225 07 12 34 56 78"
                        className="pl-12 text-lg"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Organisme</span>
                      <span className="font-semibold">{organismNames[organism]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Méthode</span>
                      <span className="font-semibold">
                        {mobileMoneyProviders.find((p) => p.id === selectedProvider)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frais de transaction</span>
                      <span className="font-semibold">0 FCFA</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        {amount.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("select-method")}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={!phoneNumber || phoneNumber.length < 10}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
                  >
                    Confirmer le Paiement
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
                <h3 className="text-xl font-semibold mb-2">Traitement en cours...</h3>
                <p className="text-gray-500">Veuillez patienter pendant que nous traitons votre paiement</p>
                <p className="text-sm text-gray-400 mt-4">
                  Vous allez recevoir une notification sur votre téléphone
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
                <h3 className="text-2xl font-bold text-green-600 mb-2">Paiement Réussi !</h3>
                <p className="text-gray-600 mb-6">Votre cotisation a été payée avec succès</p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numéro de transaction</span>
                      <span className="font-mono font-semibold">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant</span>
                      <span className="font-semibold text-green-600">
                        {amount.toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-semibold">
                        {new Date().toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bénéficiaire</span>
                      <span className="font-semibold">{memberName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDownloadReceipt}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le Reçu
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
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

