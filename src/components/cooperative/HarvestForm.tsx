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
import { Wheat, Calendar, MapPin, TrendingUp, Users, Package } from 'lucide-react';

// Schémas de validation
const harvestRecordSchema = z.object({
  crop: z.string().min(2, 'La culture est requise'),
  variety: z.string().min(2, 'La variété est requise'),
  plantedArea: z.number().min(0.1, 'La surface doit être supérieure à 0'),
  yieldPerHectare: z.number().min(0.1, 'Le rendement doit être supérieur à 0'),
  harvestDate: z.string().min(1, 'La date de récolte est requise'),
  location: z.string().min(2, 'La localisation est requise'),
  qualityScore: z.number().min(0).max(10, 'Le score doit être entre 0 et 10'),
  notes: z.string().optional(),
  membersInvolved: z.array(z.string()).optional(),
});

const forecastSchema = z.object({
  crop: z.string().min(2, 'La culture est requise'),
  variety: z.string().min(2, 'La variété est requise'),
  plantedArea: z.number().min(0.1, 'La surface doit être supérieure à 0'),
  expectedYield: z.number().min(0.1, 'Le rendement attendu doit être supérieur à 0'),
  plantingDate: z.string().min(1, 'La date de plantation est requise'),
  expectedHarvestDate: z.string().min(1, 'La date de récolte attendue est requise'),
  location: z.string().min(2, 'La localisation est requise'),
  estimatedValue: z.number().min(0, 'La valeur estimée doit être positive'),
  membersInvolved: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const qualityControlSchema = z.object({
  harvestId: z.string().min(1, 'La récolte est requise'),
  qualityScore: z.number().min(0).max(10, 'Le score doit être entre 0 et 10'),
  inspectionDate: z.string().min(1, 'La date d\'inspection est requise'),
  inspector: z.string().min(2, 'L\'inspecteur est requis'),
  criteria: z.object({
    appearance: z.number().min(0).max(10),
    size: z.number().min(0).max(10),
    color: z.number().min(0).max(10),
    freshness: z.number().min(0).max(10),
    defects: z.number().min(0).max(10),
  }),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

type HarvestRecordFormData = z.infer<typeof harvestRecordSchema>;
type ForecastFormData = z.infer<typeof forecastSchema>;
type QualityControlFormData = z.infer<typeof qualityControlSchema>;

interface HarvestFormProps {
  item?: HarvestRecordFormData | ForecastFormData | QualityControlFormData | null;
  members?: { id: string; name: string }[];
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
}

const cropTypes = [
  { value: 'cacao', label: 'Cacao' },
  { value: 'cafe', label: 'Café' },
  { value: 'anacarde', label: 'Anacarde' },
  { value: 'coton', label: 'Coton' },
  { value: 'hevea', label: 'Hévéa' },
  { value: 'palmier', label: 'Palmier à huile' },
  { value: 'banane', label: 'Banane' },
  { value: 'mangue', label: 'Mangue' },
];

const cropVarieties = {
  cacao: ['Forastero', 'Criollo', 'Trinitario', 'CCN51'],
  cafe: ['Arabica', 'Robusta', 'Liberica', 'Excelsa'],
  anacarde: ['Locale', 'Améliorée', 'Précoce', 'Tardive'],
  coton: ['Acala', 'Pima', 'Upland', 'Egyptian'],
  hevea: ['GT1', 'PB260', 'RRIM600', 'PR107'],
  palmier: ['Tenera', 'Dura', 'Pisifera', 'Hybride'],
  banane: ['Cavendish', 'Plantain', 'Gros Michel', 'Lady Finger'],
  mangue: ['Amélie', 'Kent', 'Keitt', 'Tommy Atkins'],
};

const harvestStatuses = [
  { value: 'planting', label: 'Plantation' },
  { value: 'growing', label: 'Croissance' },
  { value: 'flowering', label: 'Floraison' },
  { value: 'harvesting', label: 'Récolte' },
  { value: 'completed', label: 'Terminée' },
];

export const HarvestForm: React.FC<HarvestFormProps> = ({ item, members, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState(item?.type === 'forecast' ? 'forecast' : 'record');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(item?.crop || '');

  const harvestRecordForm = useForm<HarvestRecordFormData>({
    resolver: zodResolver(harvestRecordSchema),
    defaultValues: {
      crop: '',
      variety: '',
      plantedArea: 0,
      yieldPerHectare: 0,
      harvestDate: '',
      location: '',
      qualityScore: 0,
      notes: '',
      membersInvolved: [],
    },
  });

  const forecastForm = useForm<ForecastFormData>({
    resolver: zodResolver(forecastSchema),
    defaultValues: {
      crop: '',
      variety: '',
      plantedArea: 0,
      expectedYield: 0,
      plantingDate: '',
      expectedHarvestDate: '',
      location: '',
      estimatedValue: 0,
      notes: '',
      membersInvolved: [],
    },
  });

  const qualityControlForm = useForm<QualityControlFormData>({
    resolver: zodResolver(qualityControlSchema),
    defaultValues: {
      harvestId: '',
      qualityScore: 0,
      inspectionDate: '',
      inspector: '',
      criteria: {
        appearance: 0,
        size: 0,
        color: 0,
        freshness: 0,
        defects: 0,
      },
      notes: '',
      recommendations: '',
    },
  });

  const onHarvestRecordSubmit = async (data: HarvestRecordFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        type: 'record',
        status: 'completed',
        harvestDate: new Date(data.harvestDate).toISOString(),
        totalYield: data.plantedArea * data.yieldPerHectare,
        estimatedValue: calculateEstimatedValue(data.crop, data.totalYield),
      });
    } catch (error) {
      console.error('Error submitting harvest record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForecastSubmit = async (data: ForecastFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        type: 'forecast',
        status: 'growing',
        plantingDate: new Date(data.plantingDate).toISOString(),
        expectedHarvestDate: new Date(data.expectedHarvestDate).toISOString(),
        currentProgress: 0,
      });
    } catch (error) {
      console.error('Error submitting forecast:', error);
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
        status: 'inspected',
        inspectionDate: new Date(data.inspectionDate).toISOString(),
        overallScore: calculateOverallScore(data.criteria),
      });
    } catch (error) {
      console.error('Error submitting quality control:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEstimatedValue = (crop: string, yieldAmount: number): number => {
    const prices: Record<string, number> = {
      cacao: 250000,
      cafe: 300000,
      anacarde: 200000,
      coton: 150000,
      hevea: 180000,
      palmier: 120000,
      banane: 100000,
      mangue: 160000,
    };
    return yieldAmount * (prices[crop] || 150000);
  };

  const calculateOverallScore = (criteria: Record<string, number>): number => {
    const weights = { appearance: 0.3, size: 0.2, color: 0.2, freshness: 0.2, defects: 0.1 };
    return Object.entries(criteria).reduce((sum, [key, value]) => {
      return sum + (value as number) * (weights[key as keyof typeof weights] || 0.2);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Wheat className="h-4 w-4" />
            Enregistrement Récolte
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Prévision
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Contrôle Qualité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wheat className="h-5 w-5" />
                Enregistrer une Récolte
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enregistrez les détails d'une récolte terminée
              </p>
            </CardHeader>
            <CardContent>
              <Form {...harvestRecordForm}>
                <form onSubmit={harvestRecordForm.handleSubmit(onHarvestRecordSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={harvestRecordForm.control}
                      name="crop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Culture</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCrop(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la culture" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cropTypes.map((crop) => (
                                <SelectItem key={crop.value} value={crop.value}>
                                  {crop.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={harvestRecordForm.control}
                      name="variety"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variété</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la variété" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCrop && cropVarieties[selectedCrop as keyof typeof cropVarieties]?.map((variety) => (
                                <SelectItem key={variety} value={variety}>
                                  {variety}
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
                      control={harvestRecordForm.control}
                      name="plantedArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface plantée (ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 5.5"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={harvestRecordForm.control}
                      name="yieldPerHectare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rendement (t/ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 1.2"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={harvestRecordForm.control}
                      name="harvestDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de récolte</FormLabel>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={harvestRecordForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localisation</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Zone Est, Parcelle 15"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={harvestRecordForm.control}
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

                  <FormField
                    control={harvestRecordForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conditions de récolte, observations particulières..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Informations</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Le rendement total sera calculé automatiquement</li>
                      <li>• La valeur estimée sera basée sur les prix du marché</li>
                      <li>• Un certificat de qualité sera généré</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Récolte'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Créer une Prévision de Récolte
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Planifiez et prévoyez une future récolte
              </p>
            </CardHeader>
            <CardContent>
              <Form {...forecastForm}>
                <form onSubmit={forecastForm.handleSubmit(onForecastSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={forecastForm.control}
                      name="crop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Culture</FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCrop(value);
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la culture" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cropTypes.map((crop) => (
                                <SelectItem key={crop.value} value={crop.value}>
                                  {crop.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={forecastForm.control}
                      name="variety"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variété</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la variété" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {selectedCrop && cropVarieties[selectedCrop as keyof typeof cropVarieties]?.map((variety) => (
                                <SelectItem key={variety} value={variety}>
                                  {variety}
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
                      control={forecastForm.control}
                      name="plantedArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Surface à planter (ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 5.5"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={forecastForm.control}
                      name="expectedYield"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rendement attendu (t/ha)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="Ex: 1.2"
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
                      control={forecastForm.control}
                      name="plantingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de plantation</FormLabel>
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
                      control={forecastForm.control}
                      name="expectedHarvestDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de récolte prévue</FormLabel>
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
                      control={forecastForm.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valeur estimée (FCFA)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 1500000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={forecastForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Zone Est, Parcelle 15"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={forecastForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conditions prévues, risques potentiels..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Planification</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• La prévision sera suivie automatiquement</li>
                      <li>• Des alertes seront envoyées aux dates clés</li>
                      <li>• Le suivi de progression sera mis à jour</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Création...' : 'Créer la Prévision'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Contrôle Qualité
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Évaluez la qualité d'une récolte
              </p>
            </CardHeader>
            <CardContent>
              <Form {...qualityControlForm}>
                <form onSubmit={qualityControlForm.handleSubmit(onQualityControlSubmit)} className="space-y-4">
                  <FormField
                    control={qualityControlForm.control}
                    name="harvestId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Récolte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la récolte" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="harvest-001">Cacao - Forastero (Zone Est)</SelectItem>
                            <SelectItem value="harvest-002">Café - Arabica (Zone Ouest)</SelectItem>
                            <SelectItem value="harvest-003">Anacarde - Locale (Zone Nord)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={qualityControlForm.control}
                      name="qualityScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score global (0-10)</FormLabel>
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
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Critères de qualité (0-10)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(qualityControlForm.getValues('criteria')).map(([key, value]) => (
                        <FormField
                          key={key}
                          control={qualityControlForm.control}
                          name={`criteria.${key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize">
                                {key === 'appearance' ? 'Apparence' :
                                 key === 'size' ? 'Taille' :
                                 key === 'color' ? 'Couleur' :
                                 key === 'freshness' ? 'Fraîcheur' :
                                 key === 'defects' ? 'Défauts' : key}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  placeholder="0-10"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
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
                              placeholder="Observations détaillées..."
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

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Évaluation</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Le score global sera calculé automatiquement</li>
                      <li>• Un certificat de qualité sera généré</li>
                      <li>• Les résultats affecteront la valorisation</li>
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