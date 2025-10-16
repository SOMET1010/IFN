import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Package, Truck, Scale, Calendar, User, CheckCircle, AlertTriangle } from 'lucide-react';

// Schémas de validation
const receivingSchema = z.object({
  supplierName: z.string().min(2, 'Le fournisseur est requis'),
  deliveryDate: z.string().min(1, 'La date de livraison est requise'),
  deliveryTime: z.string().min(1, 'L\'heure de livraison est requise'),
  driverName: z.string().min(2, 'Le nom du chauffeur est requis'),
  driverPhone: z.string().min(8, 'Le numéro de téléphone est invalide'),
  vehicleNumber: z.string().min(3, 'Le numéro du véhicule est requis'),
  deliveryNote: z.string().optional(),
  specialInstructions: z.string().optional(),
});

const qualityControlSchema = z.object({
  receivingId: z.string().min(1, 'La réception est requise'),
  inspectionDate: z.string().min(1, 'La date d\'inspection est requise'),
  inspector: z.string().min(2, 'L\'inspecteur est requis'),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  packagingCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  productCondition: z.enum(['excellent', 'good', 'fair', 'poor']),
  quantityReceived: z.number().min(0, 'La quantité doit être positive'),
  quantityExpected: z.number().min(0, 'La quantité attendue doit être positive'),
  weightActual: z.number().optional(),
  weightExpected: z.number().optional(),
  qualityScore: z.number().min(0).max(10, 'Le score doit être entre 0 et 10'),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
  accepted: z.boolean(),
  rejectionReason: z.string().optional(),
});

const itemReceivingSchema = z.object({
  productId: z.string().min(1, 'Le produit est requis'),
  quantityExpected: z.number().min(0.1, 'La quantité attendue doit être positive'),
  quantityReceived: z.number().min(0, 'La quantité reçue doit être positive'),
  unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  manufacturingDate: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
  storageLocation: z.string().min(2, 'L\'emplacement de stockage est requis'),
  notes: z.string().optional(),
});

type ReceivingFormData = z.infer<typeof receivingSchema>;
type QualityControlFormData = z.infer<typeof qualityControlSchema>;
type ItemReceivingFormData = z.infer<typeof itemReceivingSchema>;

interface ReceivingFormProps {
  item?: ReceivingFormData | QualityControlFormData | ItemReceivingFormData | null;
  products?: { id: string; name: string; category: string }[];
  warehouses?: { id: string; name: string; location: string }[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

const productCategories = [
  { value: 'intrants', label: 'Intrants' },
  { value: 'semences', label: 'Semences' },
  { value: 'phytosanitaires', label: 'Phytosanitaires' },
  { value: 'equipements', label: 'Équipements' },
  { value: 'recoltes', label: 'Récoltes' },
  { value: 'autres', label: 'Autres' },
];

const conditions = [
  { value: 'excellent', label: 'Excellent', color: 'bg-green-100 text-green-800' },
  { value: 'good', label: 'Bon', color: 'bg-blue-100 text-blue-800' },
  { value: 'fair', label: 'Acceptable', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'poor', label: 'Mauvais', color: 'bg-red-100 text-red-800' },
];

export const ReceivingForm: React.FC<ReceivingFormProps> = ({ item, products, warehouses, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState(item?.type === 'quality' ? 'quality' : 'receiving');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const receivingForm = useForm<ReceivingFormData>({
    resolver: zodResolver(receivingSchema),
    defaultValues: {
      supplierName: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTime: new Date().toTimeString().slice(0, 5),
      driverName: '',
      driverPhone: '',
      vehicleNumber: '',
      deliveryNote: '',
      specialInstructions: '',
    },
  });

  const qualityControlForm = useForm<QualityControlFormData>({
    resolver: zodResolver(qualityControlSchema),
    defaultValues: {
      receivingId: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector: '',
      temperature: undefined,
      humidity: undefined,
      packagingCondition: 'good',
      productCondition: 'good',
      quantityReceived: 0,
      quantityExpected: 0,
      weightActual: undefined,
      weightExpected: undefined,
      qualityScore: 0,
      notes: '',
      recommendations: '',
      accepted: true,
      rejectionReason: '',
    },
  });

  const itemForm = useForm<ItemReceivingFormData>({
    resolver: zodResolver(itemReceivingSchema),
    defaultValues: {
      productId: '',
      quantityExpected: 0,
      quantityReceived: 0,
      unitPrice: 0,
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
      condition: 'good',
      storageLocation: '',
      notes: '',
    },
  });

  const onReceivingSubmit = async (data: ReceivingFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        type: 'receiving',
        status: 'pending',
        items: items,
        deliveryDateTime: new Date(`${data.deliveryDate}T${data.deliveryTime}`).toISOString(),
      });
    } catch (error) {
      console.error('Error submitting receiving:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onQualityControlSubmit = async (data: QualityControlFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        type: 'quality',
        status: data.accepted ? 'accepted' : 'rejected',
        inspectionDate: new Date(data.inspectionDate).toISOString(),
        discrepancy: {
          quantity: data.quantityExpected - data.quantityReceived,
          weight: data.weightExpected && data.weightActual ? data.weightExpected - data.weightActual : undefined,
        },
      });
    } catch (error) {
      console.error('Error submitting quality control:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = (itemData: ItemReceivingFormData) => {
    const newItem = {
      id: `item-${Date.now()}`,
      ...itemData,
      totalPrice: itemData.quantityReceived * itemData.unitPrice,
    };
    setItems(prev => [...prev, newItem]);
    itemForm.reset();
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receiving" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Réception Marchandise
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Contrôle Qualité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receiving">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informations Livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...receivingForm}>
                  <form onSubmit={receivingForm.handleSubmit(onReceivingSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={receivingForm.control}
                        name="supplierName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fournisseur</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Agri-Chem CI"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={receivingForm.control}
                        name="vehicleNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro véhicule</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: CI-1234-AB"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={receivingForm.control}
                        name="deliveryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de livraison</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={receivingForm.control}
                        name="deliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heure de livraison</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={receivingForm.control}
                        name="driverPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone chauffeur</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: +225 01 23 45 67 89"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={receivingForm.control}
                      name="driverName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du chauffeur</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom complet du chauffeur"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={receivingForm.control}
                        name="deliveryNote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note de livraison (Optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Numéro de bon de livraison"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={receivingForm.control}
                        name="specialInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions spéciales</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Instructions de déchargement..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Procédure de réception</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Vérifier l'identité du chauffeur et le véhicule</li>
                        <li>• Contrôler la documentation (bon de livraison, facture)</li>
                        <li>• Préparer la zone de déchargement</li>
                        <li>• Effectuer le contrôle qualité avant acceptation</li>
                      </ul>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Articles à Réceptionner
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ajoutez les produits reçus dans cette livraison
                </p>
              </CardHeader>
              <CardContent>
                <Form {...itemForm}>
                  <form onSubmit={itemForm.handleSubmit(addItem)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un produit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products?.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.category})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="quantityExpected"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantité attendue</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Quantité commandée"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="quantityReceived"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantité reçue</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Quantité réelle"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix unitaire (FCFA)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Prix par unité"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="État du produit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {conditions.map((condition) => (
                                  <SelectItem key={condition.value} value={condition.value}>
                                    {condition.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="storageLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emplacement stockage</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Entrepôt / Zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {warehouses?.map((warehouse) => (
                                  <SelectItem key={warehouse.id} value={warehouse.id}>
                                    {warehouse.name} - {warehouse.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="batchNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de lot (Optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Numéro de lot/batch"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="manufacturingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date fabrication (Optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date expiration (Optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={itemForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optionnel)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observations sur le produit..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Ajouter l'article
                    </Button>
                  </form>
                </Form>

                {items.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">Articles ajoutés</h4>
                    <div className="border rounded-lg divide-y">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.productId}</span>
                              <Badge className={conditions.find(c => c.value === item.condition)?.color}>
                                {conditions.find(c => c.value === item.condition)?.label}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {item.quantityReceived} unités × {item.unitPrice.toLocaleString()} FCFA = {item.totalPrice.toLocaleString()} FCFA
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Lot: {item.batchNumber || 'N/A'} • Stockage: {item.storageLocation}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t">
                      <div>
                        <span className="text-lg font-semibold">Total: {calculateTotal().toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
                          Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting} onClick={receivingForm.handleSubmit(onReceivingSubmit)}>
                          {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Réception'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Contrôle Qualité de Réception
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Évaluez la qualité des produits reçus avant acceptation
              </p>
            </CardHeader>
            <CardContent>
              <Form {...qualityControlForm}>
                <form onSubmit={qualityControlForm.handleSubmit(onQualityControlSubmit)} className="space-y-4">
                  <FormField
                    control={qualityControlForm.control}
                    name="receivingId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Réception</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la réception" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="recv-001">Réception #001 - Agri-Chem CI</SelectItem>
                            <SelectItem value="recv-002">Réception #002 - Semences CI</SelectItem>
                            <SelectItem value="recv-003">Réception #003 - BioProtect CI</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={qualityControlForm.control}
                      name="inspectionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date d'inspection</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="inspector"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inspecteur</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nom de l'inspecteur"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="qualityScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score qualité (0-10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="Ex: 8.5"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={qualityControlForm.control}
                      name="quantityExpected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité attendue</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Quantité attendue"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="quantityReceived"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantité reçue</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Quantité réelle"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="weightExpected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poids attendu (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Poids attendu"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="weightActual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poids réel (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Poids mesuré"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={qualityControlForm.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Température (°C)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Température"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="humidity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Humidité (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder="Humidité"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="packagingCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition emballage</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="État emballage" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="productCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition produit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="État produit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {conditions.map((condition) => (
                                <SelectItem key={condition.value} value={condition.value}>
                                  {condition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={qualityControlForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes d'inspection</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observations détaillées sur le contrôle..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={qualityControlForm.control}
                      name="recommendations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recommandations</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Recommandations pour l'amélioration..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={qualityControlForm.control}
                      name="accepted"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormLabel>Produit accepté</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!qualityControlForm.watch('accepted') && (
                    <FormField
                      control={qualityControlForm.control}
                      name="rejectionReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motif de rejet</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Expliquez les raisons du rejet..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Points de contrôle
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Vérifier la conformité avec la commande</li>
                      <li>• Contrôler l'intégrité des emballages</li>
                      <li>• Vérifier les dates de péremption</li>
                      <li>• Contrôler la température pour les produits sensibles</li>
                      <li>• Peser et compter les produits</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Contrôle'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};