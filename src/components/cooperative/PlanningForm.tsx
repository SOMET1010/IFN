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
import { Calendar, MapPin, Users, TrendingUp, Plus, Minus } from 'lucide-react';

const cropPlanSchema = z.object({
  season: z.string().min(2, 'Le nom de la saison est requis'),
  totalArea: z.string().min(1, 'La surface totale est requise'),
  totalInvestment: z.string().min(1, "L'investissement total est requis"),
  expectedRevenue: z.string().min(1, 'Le revenu estimé est requis'),
  riskLevel: z.enum(['low', 'medium', 'high']),
  status: z.enum(['planned', 'active', 'completed', 'cancelled']),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  notes: z.string().optional(),
  crops: z.array(z.object({
    name: z.string().min(2, 'Le nom de la culture est requis'),
    variety: z.string().min(2, 'La variété est requise'),
    area: z.string().min(1, 'La surface est requise'),
    expectedYield: z.string().min(1, 'Le rendement attendu est requis'),
    plantingDate: z.string().min(1, 'La date de plantation est requise'),
    harvestDate: z.string().min(1, 'La date de récolte est requise'),
    members: z.array(z.string()),
    status: z.enum(['planned', 'active', 'completed', 'cancelled']),
    requirements: z.object({
      seeds: z.string(),
      fertilizer: z.string(),
      pesticides: z.string(),
      water: z.string(),
    }),
    estimatedRevenue: z.string(),
    estimatedCosts: z.string(),
  })).min(1, 'Au moins une culture est requise'),
});

type CropPlanFormData = z.infer<typeof cropPlanSchema>;

interface PlanningFormProps {
  item?: CropPlanFormData & { id?: string };
  onSubmit: (data: CropPlanFormData & { id: string; totalArea: string; totalInvestment: string; expectedRevenue: string }) => void;
  onCancel: () => void;
}

const cropTypes = [
  'Maïs', 'Manioc', 'Igname', 'Riz', 'Cacao', 'Café', 'Anacarde',
  'Coton', 'Hévéa', 'Banane', 'Mangue', 'Ananas', 'Tomate', 'Oignon'
];

const riskLevels = [
  { value: 'low', label: 'Faible', color: 'default' },
  { value: 'medium', label: 'Moyen', color: 'secondary' },
  { value: 'high', label: 'Élevé', color: 'destructive' }
];

const statusOptions = [
  { value: 'planned', label: 'Planifié', color: 'default' },
  { value: 'active', label: 'Actif', color: 'default' },
  { value: 'completed', label: 'Terminé', color: 'default' },
  { value: 'cancelled', label: 'Annulé', color: 'destructive' }
];

export const PlanningForm: React.FC<PlanningFormProps> = ({ item, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CropPlanFormData>({
    resolver: zodResolver(cropPlanSchema),
    defaultValues: {
      season: item?.season || '',
      totalArea: item?.totalArea || '',
      totalInvestment: item?.totalInvestment || '',
      expectedRevenue: item?.expectedRevenue || '',
      riskLevel: item?.riskLevel || 'medium',
      status: item?.status || 'planned',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      notes: item?.notes || '',
      crops: item?.crops || [{
        name: '',
        variety: '',
        area: '',
        expectedYield: '',
        plantingDate: '',
        harvestDate: '',
        members: [],
        status: 'planned',
        requirements: {
          seeds: '',
          fertilizer: '',
          pesticides: '',
          water: '',
        },
        estimatedRevenue: '',
        estimatedCosts: '',
      }],
    },
  });

  const { fields: cropFields, append: appendCrop, remove: removeCrop } = useFieldArray({
    control: form.control,
    name: 'crops',
  });

  const onSubmitForm = async (data: CropPlanFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id || `PLAN-${Date.now()}`,
        totalArea: `${data.totalArea} ha`,
        totalInvestment: `${data.totalInvestment} FCFA`,
        expectedRevenue: `${data.expectedRevenue} FCFA`,
      });
    } catch (error) {
      console.error('Error submitting planning form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Informations Générales</TabsTrigger>
          <TabsTrigger value="crops">Cultures</TabsTrigger>
          <TabsTrigger value="financial">Finances</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="season"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la saison</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Grande Saison 2024" {...field} />
                  </FormControl>
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
                      {statusOptions.map((status) => (
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
              name="riskLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau de risque</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le niveau de risque" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {riskLevels.map((risk) => (
                        <SelectItem key={risk.value} value={risk.value}>
                          {risk.label}
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
              name="totalArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surface totale (ha)</FormLabel>
                  <FormControl>
                    <Input placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin</FormLabel>
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informations supplémentaires sur le plan..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="crops" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Cultures planifiées</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCrop({
                name: '',
                variety: '',
                area: '',
                expectedYield: '',
                plantingDate: '',
                harvestDate: '',
                members: [],
                status: 'planned',
                requirements: {
                  seeds: '',
                  fertilizer: '',
                  pesticides: '',
                  water: '',
                },
                estimatedRevenue: '',
                estimatedCosts: '',
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une culture
            </Button>
          </div>

          <div className="space-y-4">
            {cropFields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Culture {index + 1}</CardTitle>
                    {cropFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCrop(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`crops.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la culture</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la culture" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cropTypes.map((crop) => (
                                <SelectItem key={crop} value={crop}>
                                  {crop}
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
                      name={`crops.${index}.variety`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variété</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: TZB" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.area`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface (ha)</FormLabel>
                          <FormControl>
                            <Input placeholder="15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.expectedYield`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rendement attendu</FormLabel>
                          <FormControl>
                            <Input placeholder="3.5 t/ha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.plantingDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de plantation</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.harvestDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de récolte</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.estimatedRevenue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revenu estimé (FCFA)</FormLabel>
                          <FormControl>
                            <Input placeholder="1,575,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.estimatedCosts`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coûts estimés (FCFA)</FormLabel>
                          <FormControl>
                            <Input placeholder="525,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`crops.${index}.requirements.seeds`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Besoins en semences</FormLabel>
                          <FormControl>
                            <Input placeholder="150 kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.requirements.fertilizer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Besoins en engrais</FormLabel>
                          <FormControl>
                            <Input placeholder="30 sacs" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.requirements.pesticides`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Besoins en pesticides</FormLabel>
                          <FormControl>
                            <Input placeholder="5 L" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`crops.${index}.requirements.water`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Besoins en eau</FormLabel>
                          <FormControl>
                            <Input placeholder="Irrigation goutte à goutte" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="totalInvestment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investissement total (FCFA)</FormLabel>
                  <FormControl>
                    <Input placeholder="2,500,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Revenu attendu (FCFA)</FormLabel>
                  <FormControl>
                    <Input placeholder="4,000,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le plan'}
        </Button>
      </div>
      </form>
    </Form>
  );
};
