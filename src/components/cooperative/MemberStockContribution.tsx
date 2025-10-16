import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Upload,
  MapPin,
  Package,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ProductQuality } from "@/types/stock";

interface MemberStockContributionProps {
  memberName: string;
  onClose: () => void;
  onSubmit: (data: StockDeclaration) => void;
}

interface StockDeclaration {
  productId: string;
  productName: string;
  quantity: number;
  quality: ProductQuality;
  location: string;
  notes?: string;
  photos?: File[];
}

const products = [
  { id: "1", name: "Cacao", image: "🍫", currentStock: 2500 },
  { id: "2", name: "Café", image: "☕", currentStock: 0 },
  { id: "3", name: "Anacarde", image: "🥜", currentStock: 0 },
  { id: "4", name: "Karité", image: "🌰", currentStock: 0 },
  { id: "5", name: "Mangues", image: "🥭", currentStock: 0 },
  { id: "6", name: "Bananes", image: "🍌", currentStock: 0 },
];

const qualityOptions: { value: ProductQuality; label: string; description: string; color: string }[] = [
  {
    value: "A",
    label: "Qualité A - Premium",
    description: "Produit de première qualité, sans défaut",
    color: "green",
  },
  {
    value: "B",
    label: "Qualité B - Standard",
    description: "Produit de bonne qualité, défauts mineurs",
    color: "blue",
  },
  {
    value: "C",
    label: "Qualité C - Économique",
    description: "Produit acceptable, défauts visibles",
    color: "gray",
  },
];

export const MemberStockContribution = ({
  memberName,
  onClose,
  onSubmit,
}: MemberStockContributionProps) => {
  const [formData, setFormData] = useState<Partial<StockDeclaration>>({
    quantity: 0,
    quality: "A",
    location: "",
    notes: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);

  const selectedProduct = products.find((p) => p.id === formData.productId);
  const newTotalStock = (selectedProduct?.currentStock || 0) + (formData.quantity || 0);

  const handleSubmit = () => {
    if (!formData.productId || !formData.quantity || !formData.location) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const declaration: StockDeclaration = {
      productId: formData.productId,
      productName: selectedProduct?.name || "",
      quantity: formData.quantity,
      quality: formData.quality || "A",
      location: formData.location,
      notes: formData.notes,
      photos,
    };

    onSubmit(declaration);
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Déclarer du Stock</h2>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="product">Produit *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, productId: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{product.image}</span>
                          <span>{product.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantité (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                  }
                  placeholder="1000"
                  className="mt-1"
                  min="0"
                />
              </div>

              <div>
                <Label>Qualité *</Label>
                <div className="mt-2 space-y-2">
                  {qualityOptions.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        formData.quality === option.value
                          ? `ring-2 ring-${option.color}-500 bg-${option.color}-50`
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setFormData((prev) => ({ ...prev, quality: option.value }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{option.label}</p>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          </div>
                          {formData.quality === option.value && (
                            <CheckCircle className={`w-5 h-5 text-${option.color}-600`} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Localisation du Stock *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Ex: Entrepôt A, Zone 3"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Informations complémentaires..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="photos">Photos (optionnel)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <Label htmlFor="photos" className="cursor-pointer">
                    <span className="text-sm font-medium">Cliquez pour télécharger</span>
                    <p className="text-xs text-gray-500 mt-1">
                      Photos du stock (max 5 fichiers)
                    </p>
                  </Label>
                  <Input
                    id="photos"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                  {photos.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {photos.length} photo(s) sélectionnée(s)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Stock Actuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProduct ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-6xl mb-2">{selectedProduct.image}</div>
                        <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-600">Votre stock actuel</span>
                          <span className="text-2xl font-bold">
                            {selectedProduct.currentStock.toLocaleString("fr-FR")} kg
                          </span>
                        </div>
                        {selectedProduct.currentStock === 0 && (
                          <Badge className="bg-orange-100 text-orange-700">
                            Première déclaration
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Sélectionnez un produit pour voir votre stock
                    </p>
                  )}
                </CardContent>
              </Card>

              {selectedProduct && formData.quantity && formData.quantity > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-green-500 border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-5 h-5" />
                        Après Déclaration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600">Nouveau stock total</span>
                            <span className="text-3xl font-bold text-green-600">
                              {newTotalStock.toLocaleString("fr-FR")} kg
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-700">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              +{formData.quantity.toLocaleString("fr-FR")} kg (
                              {selectedProduct.currentStock > 0
                                ? `+${Math.round(
                                    (formData.quantity / selectedProduct.currentStock) * 100
                                  )}%`
                                : "Nouveau"}
                              )
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Qualité</span>
                            <Badge
                              className={
                                formData.quality === "A"
                                  ? "bg-green-100 text-green-700"
                                  : formData.quality === "B"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {formData.quality} -{" "}
                              {qualityOptions.find((q) => q.value === formData.quality)?.label.split(" - ")[1]}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Localisation</span>
                            <span className="font-semibold">
                              {formData.location || "Non définie"}
                            </span>
                          </div>
                          {photos.length > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Photos</span>
                              <span className="font-semibold">{photos.length} fichier(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.productId || !formData.quantity || !formData.location}
            className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Valider la Déclaration
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

