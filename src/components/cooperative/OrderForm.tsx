import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Plus, Trash2, Calculator, Package, Users, Calendar } from 'lucide-react';

const orderSchema = z.object({
  name: z.string().min(2, 'Le nom de la commande est requis'),
  description: z.string().optional(),
  type: z.enum(['purchase', 'collecte', 'service']),
  status: z.enum(['draft', 'active', 'completed', 'cancelled', 'pending']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  organizer: z.string().min(2, 'L\'organisateur est requis'),
  organizerContact: z.string().min(10, 'Le contact de l\'organisateur est requis'),
  targetParticipants: z.number().min(1, 'Le nombre cible de participants doit être positif'),
  currentParticipants: z.number().min(0, 'Le nombre actuel de participants doit être positif'),
  minimumParticipants: z.number().optional(),
  deadline: z.string().min(1, 'La date limite est requise'),
  estimatedDelivery: z.string().optional(),
  currency: z.string().min(3, 'La devise est requise'),
  paymentTerms: z.string().min(2, 'Les conditions de paiement sont requises'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    product: z.string().min(2, 'Le nom du produit est requis'),
    description: z.string().optional(),
    quantity: z.number().min(1, 'La quantité doit être positive'),
    unit: z.string().min(1, 'L\'unité est requise'),
    unitPrice: z.number().min(0, 'Le prix unitaire doit être positif'),
    totalPrice: z.number().min(0, 'Le prix total doit être positif'),
    category: z.string().min(2, 'La catégorie est requise'),
    supplier: z.string().optional(),
    deliveryDate: z.string().optional(),
    deliveryLocation: z.string().optional(),
    specifications: z.array(z.string()).optional().default([]),
  })).min(1, 'Au moins un article est requis'),
  participants: z.array(z.object({
    name: z.string().min(2, 'Le nom du participant est requis'),
    contact: z.string().min(10, 'Le contact du participant est requis'),
    joinDate: z.string().min(1, 'La date d\'adhésion est requise'),
    status: z.enum(['confirmed', 'pending', 'cancelled']),
    quantity: z.number().optional(),
    amount: z.number().optional(),
  })).optional().default([]),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  item?: OrderFormData & { id?: string };
  onSubmit: (data: OrderFormData & { id: string }) => void;
  onCancel: () => void;
  trigger?: React.ReactNode;
}

const orderTypes = [
  { value: 'purchase', label: 'Achat' },
  { value: 'collecte', label: 'Collecte' },
  { value: 'service', label: 'Service' },
];

const orderStatuses = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'pending', label: 'En attente' },
];

const priorities = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Élevée' },
  { value: 'urgent', label: 'Urgente' },
];

const currencies = [
  'FCFA', 'EUR', 'USD', 'XOF'
];

const categories = [
  'Engrais', 'Semences', 'Outils', 'Équipements', 'Produits phytosanitaires', 'Emballages', 'Autres'
];

const units = [
  'kg', 'g', 'L', 'mL', 'unités', 'sacs', 'bidons', 'boîtes', 'tonnes'
];

const participantStatuses = [
  { value: 'confirmed', label: 'Confirmé' },
  { value: 'pending', label: 'En attente' },
  { value: 'cancelled', label: 'Annulé' },
];

export const OrderForm: React.FC<OrderFormProps> = ({ item, onSubmit, onCancel, trigger }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      type: item?.type || 'purchase',
      status: item?.status || 'draft',
      priority: item?.priority || 'medium',
      organizer: item?.organizer || '',
      organizerContact: item?.organizerContact || '',
      targetParticipants: item?.targetParticipants || 10,
      currentParticipants: item?.currentParticipants || 0,
      minimumParticipants: item?.minimumParticipants,
      deadline: item?.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedDelivery: item?.estimatedDelivery || '',
      currency: item?.currency || 'FCFA',
      paymentTerms: item?.paymentTerms || 'Paiement à la livraison',
      notes: item?.notes || '',
      terms: item?.terms || '',
      items: item?.items || [{
        product: '',
        description: '',
        quantity: 1,
        unit: 'kg',
        unitPrice: 0,
        totalPrice: 0,
        category: 'Engrais',
        supplier: '',
        deliveryDate: '',
        deliveryLocation: '',
        specifications: [],
      }],
      participants: item?.participants || [],
    },
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const {
    fields: participantFields,
    append: appendParticipant,
    remove: removeParticipant,
  } = useFieldArray({
    control: form.control,
    name: 'participants',
  });

  const calculateTotal = () => {
    const items = form.watch('items');
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotalAmount(total);
  };

  const calculateItemTotal = (index: number) => {
    const quantity = form.watch(`items.${index}.quantity`);
    const unitPrice = form.watch(`items.${index}.unitPrice`);
    const total = quantity * unitPrice;
    form.setValue(`items.${index}.totalPrice`, total);
    calculateTotal();
  };

  const onSubmitForm = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      // Calculate totals before submission
      const updatedItems = data.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const finalData = {
        ...data,
        items: updatedItems,
        totalAmount: updatedItems.reduce((sum, item) => sum + item.totalPrice, 0),
      };

      await onSubmit({
        ...finalData,
        id: item?.id || `GRP-${Date.now()}`,
      });
    } catch (error) {
      console.error('Error submitting order form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {item ? 'Modifier la commande groupée' : 'Nouvelle commande groupée'}
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={calculateTotal}
          className="gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculer le total
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="items">Articles et prix</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="conditions">Conditions et termes</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la commande</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Commande groupée d'engrais bio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de commande</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organisateur</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'organisateur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizerContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact de l'organisateur</FormLabel>
                      <FormControl>
                        <Input placeholder="+225 XX XX XX XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="targetParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants cibles</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants actuels</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimumParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participants minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date limite</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de livraison estimée</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description détaillée de la commande..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Articles de la commande</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendItem({
                      product: '',
                      description: '',
                      quantity: 1,
                      unit: 'kg',
                      unitPrice: 0,
                      totalPrice: 0,
                      category: 'Engrais',
                      supplier: '',
                      deliveryDate: '',
                      deliveryLocation: '',
                      specifications: [],
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un article
                  </Button>
                </div>
                {itemFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.product`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Produit</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du produit" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Catégorie</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.supplier`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fournisseur</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du fournisseur" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Unité" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {units.map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantité</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    calculateItemTotal(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix unitaire</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(Number(e.target.value));
                                    calculateItemTotal(index);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`items.${index}.totalPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prix total</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  readOnly
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Description du produit..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {itemFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="mt-4 text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer l'article
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Total de la commande</h4>
                      <p className="text-2xl font-bold text-primary">
                        {totalAmount.toLocaleString()} {form.watch('currency')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Participants</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendParticipant({
                      name: '',
                      contact: '',
                      joinDate: new Date().toISOString().split('T')[0],
                      status: 'pending',
                      quantity: undefined,
                      amount: undefined,
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un participant
                  </Button>
                </div>
                {participantFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`participants.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du participant" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`participants.${index}.contact`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact</FormLabel>
                              <FormControl>
                                <Input placeholder="+225 XX XX XX XX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`participants.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statut</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Statut" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {participantStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name={`participants.${index}.joinDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date d'adhésion</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`participants.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantité (optionnel)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`participants.${index}.amount`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant (optionnel)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {participantFields.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(index)}
                          className="mt-4 text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer le participant
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions de paiement</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 50% à la commande, 50% à la livraison" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termes et conditions</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Termes et conditions de la commande..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes supplémentaires</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes supplémentaires sur la commande..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la commande'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  if (trigger) {
    return (
      <div>
        {trigger}
        <FormContent />
      </div>
    );
  }

  return <FormContent />;
};
