import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MerchantInventory } from '@/services/merchant/merchantService';

const inventorySchema = z.object({
  product: z.string().min(1, 'Le nom du produit est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  currentStock: z.number().min(0, 'Le stock doit être positif'),
  maxStock: z.number().min(1, 'Le stock maximum doit être supérieur à 0'),
  unit: z.string().min(1, 'L\'unité est requise'),
  location: z.string().min(1, 'L\'emplacement est requis'),
  expiryDate: z.string().min(1, 'La date d\'expiration est requise'),
  price: z.number().min(0, 'Le prix doit être positif'),
  lowThresholdPercent: z.number().min(1).max(100).optional(),
  criticalThresholdPercent: z.number().min(1).max(100).optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  item?: MerchantInventory;
  onSubmit: (data: InventoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InventoryForm = ({ item, onSubmit, onCancel, isLoading = false }: InventoryFormProps) => {
  const [expiryDate, setExpiryDate] = useState(item?.expiryDate || '');

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      product: item?.product || '',
      category: item?.category || '',
      currentStock: item?.currentStock || 0,
      maxStock: item?.maxStock || 100,
      unit: item?.unit || '',
      location: item?.location || '',
      expiryDate: item?.expiryDate || '',
      price: item?.price || 0,
      lowThresholdPercent: item?.lowThresholdPercent ?? 50,
      criticalThresholdPercent: item?.criticalThresholdPercent ?? 20,
    },
  });

  const handleSubmit = (data: InventoryFormData) => {
    onSubmit({ ...data, expiryDate });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? 'Modifier le produit' : 'Ajouter un produit'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bananes" {...field} />
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
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fruits">Fruits</SelectItem>
                        <SelectItem value="legumes">Légumes</SelectItem>
                        <SelectItem value="volaille">Volaille</SelectItem>
                        <SelectItem value="poissons">Poissons</SelectItem>
                        <SelectItem value="cereales">Céréales</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock actuel</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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
                name="maxStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock maximum</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                        <SelectItem value="pièces">Pièces</SelectItem>
                        <SelectItem value="tonne">Tonnes</SelectItem>
                        <SelectItem value="litre">Litres</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="Ex: Entrepôt A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
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
                name="lowThresholdPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil stock faible (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={100} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="criticalThresholdPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil stock critique (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={100} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : item ? 'Modifier' : 'Ajouter'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
