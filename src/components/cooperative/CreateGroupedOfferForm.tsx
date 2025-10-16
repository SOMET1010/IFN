import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  DollarSign,
  Package,
  FileText,
  Truck,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GroupedOfferData, OfferQuality, PaymentTerms, DeliveryTerms } from "@/types/groupedOffers";
import type { ProductStock } from "@/types/stock";

// Données mockées de stocks disponibles
const mockAvailableStocks: ProductStock[] = [
  { productId: "1", productName: "Cacao", totalQuantity: 8500, qualityA: 5000, qualityB: 2500, qualityC: 1000 },
  { productId: "2", productName: "Café", totalQuantity: 6200, qualityA: 3000, qualityB: 2200, qualityC: 1000 },
  { productId: "3", productName: "Anacarde", totalQuantity: 4800, qualityA: 3000, qualityB: 1500, qualityC: 300 },
  { productId: "4", productName: "Karité", totalQuantity: 3200, qualityA: 2000, qualityB: 1000, qualityC: 200 },
];

interface CreateGroupedOfferFormProps {
  onClose: () => void;
  onSubmit: (offerData: GroupedOfferData) => void;
}

export const CreateGroupedOfferForm = ({
  onClose,
  onSubmit,
}: CreateGroupedOfferFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quality, setQuality] = useState<OfferQuality>("A");
  const [unitPrice, setUnitPrice] = useState(2000);
  const [negotiationMargin, setNegotiationMargin] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState<PaymentTerms["method"]>("cash");
  const [deliveryType, setDeliveryType] = useState<DeliveryTerms["type"]>("franco");
  const [deliveryLocation, setDeliveryLocation] = useState("Yamoussoukro");
  const [minimumOrder, setMinimumOrder] = useState(1000);

  const totalSteps = 5;
  const totalQuantity = selectedProducts.reduce((sum, pid) => {
    const stock = mockAvailableStocks.find((s) => s.productId === pid);
    return sum + (stock?.totalQuantity || 0);
  }, 0);
  const totalPrice = totalQuantity * unitPrice;

  const steps = [
    { id: 1, title: "Produits", icon: Package },
    { id: 2, title: "Configuration", icon: FileText },
    { id: 3, title: "Tarification", icon: DollarSign },
    { id: 4, title: "Conditions", icon: Truck },
    { id: 5, title: "Prévisualisation", icon: Eye },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (isDraft: boolean) => {
    const offerData: GroupedOfferData = {
      title,
      description,
      selectedProducts,
      quality,
      unitPrice,
      negotiationMargin,
      photos: [],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentTerms: { method: paymentMethod },
      deliveryTerms: {
        type: deliveryType,
        location: deliveryLocation,
        estimatedDays: deliveryType === "franco" ? 7 : 3,
      },
      minimumOrder,
    };
    onSubmit(offerData);
    onClose();
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Créer une Offre Groupée</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? "bg-white text-orange-600"
                          : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-white/30 text-white"
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <p className="text-xs mt-1 text-white/80">{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-white/30"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <AnimatePresence mode="wait">
            {/* Étape 1: Sélection des produits */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-lg font-semibold mb-4">Sélectionnez les produits disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAvailableStocks.map((stock) => (
                    <Card
                      key={stock.productId}
                      className={`cursor-pointer transition-all ${
                        selectedProducts.includes(stock.productId) ? "ring-2 ring-orange-500" : ""
                      }`}
                      onClick={() => toggleProduct(stock.productId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox checked={selectedProducts.includes(stock.productId)} />
                              <h4 className="font-semibold">{stock.productName}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Stock total: {stock.totalQuantity.toLocaleString("fr-FR")} kg
                            </p>
                            <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-700">A: {stock.qualityA} kg</Badge>
                              <Badge className="bg-blue-100 text-blue-700">B: {stock.qualityB} kg</Badge>
                              <Badge className="bg-orange-100 text-orange-700">C: {stock.qualityC} kg</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {selectedProducts.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      {selectedProducts.length} produit(s) sélectionné(s) - Quantité totale:{" "}
                      <span className="font-bold">{totalQuantity.toLocaleString("fr-FR")} kg</span>
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Étape 2: Configuration */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <Label htmlFor="title">Nom de l'offre *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Lot Cacao Premium 5 Tonnes"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description détaillée *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez votre offre en détail..."
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="quality">Qualité globale</Label>
                  <Select value={quality} onValueChange={(value: any) => setQuality(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Qualité A (Premium)</SelectItem>
                      <SelectItem value="B">Qualité B (Standard)</SelectItem>
                      <SelectItem value="C">Qualité C (Économique)</SelectItem>
                      <SelectItem value="mixed">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Upload de photos (optionnel)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Cliquez pour ajouter des photos</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Étape 3: Tarification */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <Label>Prix unitaire (FCFA/kg): {unitPrice.toLocaleString("fr-FR")}</Label>
                  <Slider
                    value={[unitPrice]}
                    onValueChange={(value) => setUnitPrice(value[0])}
                    min={1000}
                    max={5000}
                    step={100}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1,000 FCFA</span>
                    <span>5,000 FCFA</span>
                  </div>
                </div>

                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quantité totale</span>
                        <span className="font-semibold">{totalQuantity.toLocaleString("fr-FR")} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Prix unitaire</span>
                        <span className="font-semibold">{unitPrice.toLocaleString("fr-FR")} FCFA/kg</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-bold">Prix total</span>
                        <span className="text-xl font-bold text-green-600">
                          {(totalPrice / 1000000).toFixed(1)}M FCFA
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label>Marge de négociation autorisée: {negotiationMargin}%</Label>
                  <Slider
                    value={[negotiationMargin]}
                    onValueChange={(value) => setNegotiationMargin(value[0])}
                    min={0}
                    max={15}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Prix minimum accepté: {((unitPrice * (100 - negotiationMargin)) / 100).toLocaleString("fr-FR")} FCFA/kg
                  </p>
                </div>
              </motion.div>
            )}

            {/* Étape 4: Conditions */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div>
                  <Label>Modalités de paiement</Label>
                  <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Paiement comptant</SelectItem>
                      <SelectItem value="30-days">Paiement à 30 jours</SelectItem>
                      <SelectItem value="60-days">Paiement à 60 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Conditions de livraison</Label>
                  <Select value={deliveryType} onValueChange={(value: any) => setDeliveryType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="franco">Franco (Livraison incluse)</SelectItem>
                      <SelectItem value="ex-works">Ex-Works (Départ coopérative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deliveryLocation">Lieu de livraison</Label>
                  <Input
                    id="deliveryLocation"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="Yamoussoukro"
                  />
                </div>

                <div>
                  <Label htmlFor="minimumOrder">Quantité minimale de commande (kg)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(Number(e.target.value))}
                  />
                </div>
              </motion.div>
            )}

            {/* Étape 5: Prévisualisation */}
            {currentStep === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>{title || "Titre de l'offre"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{description || "Description de l'offre"}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Produits</p>
                        <p className="font-semibold">
                          {selectedProducts
                            .map((id) => mockAvailableStocks.find((s) => s.productId === id)?.productName)
                            .join(", ")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quantité totale</p>
                        <p className="font-semibold">{totalQuantity.toLocaleString("fr-FR")} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Prix total</p>
                        <p className="text-xl font-bold text-green-600">
                          {(totalPrice / 1000000).toFixed(1)}M FCFA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Qualité</p>
                        <Badge>{quality}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-2">
            {currentStep === totalSteps ? (
              <>
                <Button variant="outline" onClick={() => handleSubmit(true)}>
                  Enregistrer comme Brouillon
                </Button>
                <Button
                  onClick={() => handleSubmit(false)}
                  className="bg-gradient-to-r from-orange-500 to-green-600"
                  disabled={!title || !description || selectedProducts.length === 0}
                >
                  Publier l'Offre
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-orange-500 to-green-600"
                disabled={currentStep === 1 && selectedProducts.length === 0}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

