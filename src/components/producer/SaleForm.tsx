import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProducerSale, ProducerOffer } from '@/types';
import { producerSaleService } from '@/services/producer/producerSaleService';
import { producerOfferService } from '@/services/producer/producerOfferService';
import { useToast } from '@/hooks/use-toast';

const saleSchema = z.object({
  product: z.string().min(1, 'Le produit est requis'),
  quantity: z.number().min(0.1, 'La quantité doit être supérieure à 0'),
  unit: z.enum(['kg', 'piece', 'tonne']),
  price: z.number().min(1, 'Le prix unitaire doit être supérieur à 0'),
  total_price: z.number().min(1, 'Le prix total doit être supérieur à 0'),
  currency: z.literal('FCFA'),
  buyer: z.string().min(1, 'L\'acheteur est requis'),
  buyer_type: z.enum(['cooperative', 'merchant', 'individual']),
  buyer_contact: z.string().optional(),
  date: z.date({
    required_error: 'La date de vente est requise',
    invalid_type_error: 'Date invalide',
  }),
  status: z.enum(['completed', 'pending', 'cancelled', 'failed']),
  payment_method: z.enum(['mobile_money', 'bank_transfer', 'cash']).optional(),
  payment_status: z.enum(['paid', 'pending', 'failed']).optional(),
  offer_id: z.string().optional(),
  delivery_method: z.enum(['pickup', 'delivery']).optional(),
  delivery_address: z.string().optional(),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  sale?: ProducerSale;
  producerId: string;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function SaleForm({
  sale,
  producerId,
  onSuccess,
  isOpen = false,
  onOpenChange,
  showTrigger = true
}: SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<ProducerOffer[]>([]);
  const { toast } = useToast();

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      product: sale?.product || '',
      quantity: sale?.quantity || 0,
      unit: sale?.unit || 'kg',
      price: sale?.price || 0,
      total_price: sale?.total_price || 0,
      currency: 'FCFA',
      buyer: sale?.buyer || '',
      buyer_type: sale?.buyer_type || 'individual',
      buyer_contact: sale?.buyer_contact || '',
      date: sale?.date ? new Date(sale.date) : new Date(),
      status: sale?.status || 'pending',
      payment_method: sale?.payment_method,
      payment_status: sale?.payment_status,
      offer_id: sale?.offer_id,
      delivery_method: sale?.delivery_method,
      delivery_address: sale?.delivery_address || '',
      notes: sale?.notes || '',
    },
  });

  useEffect(() => {
    // Charger les offres disponibles pour ce producteur
    const loadOffers = async () => {
      const response = await producerOfferService.getOffersByProducer(producerId);
      if (response.success && response.data) {
        setAvailableOffers(response.data.filter(offer =>
          offer.status === 'en_cours' || offer.status === 'en_attente'
        ));
      }
    };
    loadOffers();
  }, [producerId]);

  // Calculer le prix total quand le prix unitaire ou la quantité change
  useEffect(() => {
    const price = form.watch('price');
    const quantity = form.watch('quantity');
    if (price && quantity) {
      form.setValue('total_price', price * quantity);
    }
  }, [form.watch('price'), form.watch('quantity'), form]);

  // Mettre à jour le produit et le prix quand une offre est sélectionnée
  const handleOfferChange = (offerId: string) => {
    const offer = availableOffers.find(o => o.id === offerId);
    if (offer) {
      form.setValue('product', offer.product);
      form.setValue('price', offer.price);
      form.setValue('unit', offer.unit);
      form.setValue('offer_id', offerId);
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);
    try {
      const saleData = {
        producer_id: producerId,
        product: data.product,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        total_price: data.total_price,
        currency: data.currency,
        buyer: data.buyer,
        buyer_type: data.buyer_type,
        buyer_contact: data.buyer_contact,
        date: data.date.toISOString().split('T')[0],
        status: data.status,
        payment_method: data.payment_method,
        payment_status: data.payment_status,
        offer_id: data.offer_id,
        delivery_method: data.delivery_method,
        delivery_address: data.delivery_address,
        notes: data.notes,
      };

      let response;
      if (sale?.id) {
        response = await producerSaleService.updateSale(sale.id, saleData);
      } else {
        response = await producerSaleService.createSale(saleData);
      }

      if (response.success) {
        form.reset();
        onSuccess?.();
        onOpenChange?.(false);
        toast({ title: sale?.id ? 'Vente mise à jour' : 'Vente enregistrée', description: `${saleData.product} • ${saleData.quantity} ${saleData.unit}` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Une erreur est survenue', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la vente:', error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="ivoire" className="gap-2">
            {sale ? 'Modifier' : 'Nouvelle Vente'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {sale ? 'Modifier la vente' : 'Enregistrer une nouvelle vente'}
          </DialogTitle>
          <DialogDescription>
            {sale 
              ? 'Modifiez les informations de votre vente existante.' 
              : 'Enregistrez les détails de votre vente pour suivre vos transactions et votre chiffre d\'affaires.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {availableOffers.length > 0 && (
                <div className="md:col-span-2">
                  <Label>Associer à une offre (optionnel)</Label>
                  <Select onValueChange={handleOfferChange} defaultValue={form.watch('offer_id')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner une offre" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOffers.map((offer) => (
                        <SelectItem key={offer.id} value={offer.id}>
                          {offer.product} - {offer.quantity} {offer.unit} à {offer.price} {offer.price_unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produit *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Cacao, Café, Anacarde" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acheteur *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Coopérative Abidjan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'acheteur *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cooperative">Coopérative</SelectItem>
                        <SelectItem value="merchant">Marchand</SelectItem>
                        <SelectItem value="individual">Particulier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyer_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact acheteur</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: +225 01 23 45 67 89" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="ex: 400"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="piece">pièce</SelectItem>
                        <SelectItem value="tonne">tonne</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="ex: 2000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix total *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="ex: 800000"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">Terminée</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                        <SelectItem value="failed">Échouée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Méthode de paiement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la méthode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                        <SelectItem value="cash">Espèces</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut paiement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="failed">Échoué</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Date de vente *</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('date') ? (
                    format(form.watch('date'), 'PPP', { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
                {showCalendar && (
                  <div className="absolute z-10 bg-white border rounded-md shadow-lg">
                    <Calendar
                      mode="single"
                      selected={form.watch('date')}
                      onSelect={(date) => {
                        form.setValue('date', date);
                        setShowCalendar(false);
                      }}
                      locale={fr}
                      disabled={(date) => date > new Date()}
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="delivery_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mode de livraison</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pickup">Retrait</SelectItem>
                        <SelectItem value="delivery">Livraison</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="delivery_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse de livraison</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Abidjan, Plateau" {...field} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conditions de vente, délais, observations, etc."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1 w-full sm:w-auto">
                {isSubmitting ? 'Enregistrement...' : sale ? 'Modifier' : 'Enregistrer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)} className="flex-1 w-full sm:w-auto">
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
