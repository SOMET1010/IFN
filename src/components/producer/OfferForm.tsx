import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, TrendingUp, Info, Target, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProducerOffer } from '@/types';
import { producerOfferService } from '@/services/producer/producerOfferService';
import { PriceSuggestion } from '@/components/producer/PriceSuggestion';
import { useToast } from '@/hooks/use-toast';

const offerSchema = z.object({
  product: z.string().min(1, 'Le produit est requis'),
  quantity: z.number().min(0.1, 'La quantité doit être supérieure à 0'),
  unit: z.enum(['kg', 'piece', 'tonne']),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  price_unit: z.enum(['FCFA/kg', 'FCFA/piece', 'FCFA/tonne']),
  description: z.string().optional(),
  status: z.enum(['en_cours', 'terminee', 'en_attente', 'annulee']),
  harvest_date: z.date().optional(),
  expiry_date: z.date().optional(),
  location: z.string().optional(),
  quality: z.enum(['Standard', 'Premium', 'Bio']).optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormProps {
  offer?: ProducerOffer;
  producerId: string;
  producerName: string;
  onSuccess?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function OfferForm({
  offer,
  producerId,
  producerName,
  onSuccess,
  isOpen = false,
  onOpenChange,
  showTrigger = true
}: OfferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHarvestCalendar, setShowHarvestCalendar] = useState(false);
  const [showExpiryCalendar, setShowExpiryCalendar] = useState(false);
  const { toast } = useToast();

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      product: offer?.product || '',
      quantity: offer?.quantity || 0,
      unit: offer?.unit || 'kg',
      price: offer?.price || 0,
      price_unit: offer?.price_unit || 'FCFA/kg',
      description: offer?.description || '',
      status: offer?.status || 'en_cours',
      harvest_date: offer?.harvest_date ? new Date(offer.harvest_date) : undefined,
      expiry_date: offer?.expiry_date ? new Date(offer.expiry_date) : undefined,
      location: offer?.location || '',
      quality: offer?.quality || 'Standard',
    },
  });

  const onSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true);
    try {
      const offerData = {
        producer_id: producerId,
        producer_name: producerName,
        product: data.product,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        price_unit: data.price_unit,
        description: data.description,
        status: data.status,
        harvest_date: data.harvest_date?.toISOString().split('T')[0],
        expiry_date: data.expiry_date?.toISOString().split('T')[0],
        location: data.location,
        quality: data.quality,
      };

      let response;
      if (offer?.id) {
        response = await producerOfferService.updateOffer(offer.id, offerData);
      } else {
        response = await producerOfferService.createOffer(offerData);
      }

      if (response.success) {
        form.reset();
        onSuccess?.();
        onOpenChange?.(false);
        toast({ title: offer?.id ? "Offre mise à jour" : "Offre créée", description: `${offerData.product} • ${offerData.quantity} ${offerData.unit}` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Une erreur est survenue', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'offre:', error);
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
            {offer ? 'Modifier' : 'Nouvelle Offre'}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {offer ? 'Modifier l\'offre' : 'Créer une nouvelle offre'}
          </DialogTitle>
          <DialogDescription>
            {offer 
              ? 'Modifiez les informations de votre offre existante.' 
              : 'Remplissez ce formulaire pour créer une nouvelle offre et la rendre visible aux acheteurs.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="product"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produit *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ex: Cacao, Café, Anacarde"
                        {...field}
                        className="transition-all duration-200 focus:scale-105 focus:shadow-md focus:border-primary/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la qualité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Premium">Premium</SelectItem>
                        <SelectItem value="Bio">Bio</SelectItem>
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
                    <FormLabel>Quantité *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="ex: 500"
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
                name="price_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité de prix</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'unité de prix" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FCFA/kg">FCFA/kg</SelectItem>
                        <SelectItem value="FCFA/piece">FCFA/pièce</SelectItem>
                        <SelectItem value="FCFA/tonne">FCFA/tonne</SelectItem>
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
                        <SelectItem value="en_cours">En cours</SelectItem>
                        <SelectItem value="terminee">Terminée</SelectItem>
                        <SelectItem value="en_attente">En attente</SelectItem>
                        <SelectItem value="annulee">Annulée</SelectItem>
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
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Abidjan, Cocody" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Price Suggestion Integration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Suggestions de prix intelligentes</h3>
                <Badge variant="secondary" className="ml-auto">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  IA
                </Badge>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Notre système analyse les tendances du marché pour vous suggérer le prix optimal pour votre produit.
                </AlertDescription>
              </Alert>

              <PriceSuggestion
                product={form.watch('product')}
                quantity={form.watch('quantity')}
                unit={form.watch('unit')}
                location={form.watch('location')}
                quality={form.watch('quality')}
                onPriceSelect={(price, confidence) => {
                  form.setValue('price', price);
                  // Update price unit based on selected unit
                  if (form.watch('unit') === 'kg') {
                    form.setValue('price_unit', 'FCFA/kg');
                  } else if (form.watch('unit') === 'piece') {
                    form.setValue('price_unit', 'FCFA/piece');
                  } else if (form.watch('unit') === 'tonne') {
                    form.setValue('price_unit', 'FCFA/tonne');
                  }
                  toast({
                    title: "Prix suggéré appliqué",
                    description: `Prix de ${price.toLocaleString()} FCFA/${form.watch('unit')} appliqué avec ${Math.round(confidence * 100)}% de confiance`,
                  });
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Date de récolte</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowHarvestCalendar(!showHarvestCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('harvest_date') ? (
                    format(form.watch('harvest_date'), 'PPP', { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
                {showHarvestCalendar && (
                  <div className="absolute z-10 bg-white border rounded-md shadow-lg">
                    <Calendar
                      mode="single"
                      selected={form.watch('harvest_date')}
                      onSelect={(date) => {
                        form.setValue('harvest_date', date);
                        setShowHarvestCalendar(false);
                      }}
                      locale={fr}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date d'expiration</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowExpiryCalendar(!showExpiryCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('expiry_date') ? (
                    format(form.watch('expiry_date'), 'PPP', { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
                {showExpiryCalendar && (
                  <div className="absolute z-10 bg-white border rounded-md shadow-lg">
                    <Calendar
                      mode="single"
                      selected={form.watch('expiry_date')}
                      onSelect={(date) => {
                        form.setValue('expiry_date', date);
                        setShowExpiryCalendar(false);
                      }}
                      locale={fr}
                    />
                  </div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description du produit, conditions, etc."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 w-full sm:w-auto transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Enregistrement...
                  </div>
                ) : offer ? (
                  'Modifier'
                ) : (
                  'Créer'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                className="flex-1 w-full sm:w-auto transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Annuler
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
