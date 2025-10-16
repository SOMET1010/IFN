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
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const inventorySchema = z.object({
  product: z.string().min(2, 'Le nom du produit est requis'),
  category: z.string().min(2, 'La catégorie est requise'),
  quantity: z.number().min(0.1, 'La quantité doit être supérieure à 0'),
  unit: z.string().min(1, "L'unité est requise"),
  minStock: z.number().min(0, 'Le stock minimum doit être positif'),
  maxStock: z.number().min(0.1, 'Le stock maximum doit être supérieur au minimum'),
  valuePerUnit: z.number().min(0, 'La valeur unitaire doit être positive'),
  location: z.string().min(2, 'L\'emplacement est requis'),
  supplier: z.string().min(2, 'Le fournisseur est requis'),
  lastRestock: z.string().min(1, 'La date de dernier réapprovisionnement est requise'),
  expiryDate: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'poor']),
  batchNumber: z.string().min(1, 'Le numéro de lot est requis'),
  notes: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  item?: InventoryFormData | null;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
}

const categories = [
  'Intrants',
  'Semences',
  'Phytosanitaires',
  'Équipements',
  'Emballages',
  'Produits finis',
  'Autres'
];

const conditions = [
  { value: 'excellent', label: 'Excellent', color: 'default' },
  { value: 'good', label: 'Bon', color: 'secondary' },
  { value: 'poor', label: 'Mauvais', color: 'destructive' }
];

const units = [
  'kg', 'tonnes', 'litres', 'sacs de 50kg', 'bidons de 20L',
  'unités', 'cartons', 'palettes', 'bouteilles', 'autres'
];

export const InventoryForm: React.FC<InventoryFormProps> = ({ item, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      product: item?.product || '',
      category: item?.category || '',
      quantity: item?.quantity || 0,
      unit: item?.unit || '',
      minStock: item?.minStock || 0,
      maxStock: item?.maxStock || 100,
      valuePerUnit: item?.valuePerUnit || 0,
      location: item?.location || '',
      supplier: item?.supplier || '',
      lastRestock: item?.lastRestock || '',
      expiryDate: item?.expiryDate || '',
      condition: item?.condition || 'good',
      batchNumber: item?.batchNumber || '',
      notes: item?.notes || '',
    },
  });

  const onSubmitForm = async (data: InventoryFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id || `INV-${Date.now()}`,
        status: 'active',
      });
    } catch (error) {
      console.error('Error submitting inventory form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du produit</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Engrais NPK 15-15-15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la catégorie" />
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
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité actuelle</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="250"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unité</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'unité" />
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

        <FormField
          control={form.control}
          name="minStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock minimum</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="50"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock maximum</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="500"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valuePerUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valeur unitaire (FCFA)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="25000"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emplacement</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Entrepôt Principal" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fournisseur</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Agri-Chem CI" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastRestock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date dernier réapprovisionnement</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'expiration (optionnel)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>État</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'état" />
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
          control={form.control}
          name="batchNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de lot</FormLabel>
              <FormControl>
                <Input placeholder="Ex: NPK2024-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (optionnel)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Informations supplémentaires sur le produit..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
      </form>
    </Form>
  );
};
