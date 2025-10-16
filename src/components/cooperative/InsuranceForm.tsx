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
import { Plus, Trash2, Calculator, Shield } from 'lucide-react';

const insuranceSchema = z.object({
  provider: z.string().min(2, 'L\'assureur est requis'),
  type: z.string().min(2, 'Le type d\'assurance est requis'),
  coverage: z.array(z.string()).min(1, 'Au moins un risque couvert est requis'),
  totalValue: z.number().min(1, 'La valeur assurée doit être supérieure à 0'),
  currency: z.string().min(3, 'La devise est requise'),
  premium: z.number().min(0, 'La prime doit être positive'),
  premiumFrequency: z.enum(['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel']),
  status: z.enum(['active', 'pending', 'expired', 'cancelled', 'suspended']),
  policyStart: z.string().min(1, 'La date de début est requise'),
  policyEnd: z.string().min(1, 'La date de fin est requise'),
  nextPayment: z.string().optional(),
  deductible: z.string().min(1, 'La franchise est requise'),
  coverageLimit: z.string().min(1, 'La limite de couverture est requise'),
  insuredArea: z.string().optional(),
  crops: z.array(z.string()).optional().default([]),
  equipment: z.array(z.string()).optional().default([]),
  scope: z.string().optional(),
  requirements: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  conditions: z.string().optional(),
});

type InsuranceFormData = z.infer<typeof insuranceSchema>;

interface InsuranceFormProps {
  item?: InsuranceFormData & { id?: string };
  onSubmit: (data: InsuranceFormData & { id: string }) => void;
  onCancel: () => void;
}

const providers = [
  'Compagnie Ivoirienne d\'Assurance Agricole (CIAA)',
  'NSIA Assurances',
  'SUNU Assurances',
  'AXA Côte d\'Ivoire',
  'Saham Assurance',
  'Allianz CI',
  'Assurance Vie Ivoirienne (AVI)',
  'CICA Assurances'
];

const insuranceTypes = [
  'Assurance Récolte Multirisque',
  'Assurance Équipement Agricole',
  'Assurance Responsabilité Civile',
  'Assurance Bétail',
  'Assurance Serre',
  'Assurance Climatique',
  'Assurance Individuelle Agricole'
];

const currencies = [
  'FCFA', 'EUR', 'USD', 'XOF'
];

const premiumFrequencies = [
  'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'
];

const coverageOptions = {
  'Assurance Récolte Multirisque': ['Grêle', 'Sécheresse', 'Inondation', 'Maladies', 'Ravageurs'],
  'Assurance Équipement Agricole': ['Vol', 'Incendie', 'Dégâts des eaux', 'Accident', 'Panne mécanique'],
  'Assurance Responsabilité Civile': ['Dommages aux tiers', 'Pollution', 'Accidents de travail'],
  'Assurance Bétail': ['Mortalité', 'Maladie', 'Vol', 'Accident'],
  'Assurance Serre': ['Dégâts climatiques', 'Vandalisme', 'Incendie'],
  'Assurance Climatique': ['Sécheresse', 'Inondation', 'Tempête', 'Grêle'],
  'Assurance Individuelle Agricole': ['Invalidité', 'Décès', 'Maladie']
};

const cropOptions = [
  'Cacao', 'Café', 'Anacarde', 'Coton', 'Hévéa', 'Banane', 'Mangue', 'Ananas', 'Maïs', 'Manioc', 'Igname'
];

const equipmentOptions = [
  'Tracteur', 'Moissonneuse-batteuse', 'Pompe d\'irrigation', 'Herbicide', 'Matériel de plantation',
  'Système d\'irrigation goutte à goutte', 'Silo de stockage', 'Véhicule utilitaire'
];

const statusOptions = [
  { value: 'active', label: 'Active', color: 'default' },
  { value: 'pending', label: 'En attente', color: 'outline' },
  { value: 'expired', label: 'Expirée', color: 'destructive' },
  { value: 'cancelled', label: 'Annulée', color: 'secondary' },
  { value: 'suspended', label: 'Suspendue', color: 'outline' }
];

export const InsuranceForm: React.FC<InsuranceFormProps> = ({ item, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(item?.type || '');

  const form = useForm<InsuranceFormData>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      provider: item?.provider || '',
      type: item?.type || '',
      coverage: item?.coverage || [],
      totalValue: item?.totalValue || 0,
      currency: item?.currency || 'FCFA',
      premium: item?.premium || 0,
      premiumFrequency: item?.premiumFrequency || 'Annuel',
      status: item?.status || 'pending',
      policyStart: item?.policyStart || new Date().toISOString().split('T')[0],
      policyEnd: item?.policyEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextPayment: item?.nextPayment || '',
      deductible: item?.deductible || '10%',
      coverageLimit: item?.coverageLimit || '',
      insuredArea: item?.insuredArea || '',
      crops: item?.crops || [],
      equipment: item?.equipment || [],
      scope: item?.scope || '',
      requirements: item?.requirements || [],
      notes: item?.notes || '',
      conditions: item?.conditions || '',
    },
  });

  const {
    fields: coverageFields,
    append: appendCoverage,
    remove: removeCoverage,
  } = useFieldArray({
    control: form.control,
    name: 'coverage',
  });

  const {
    fields: cropFields,
    append: appendCrop,
    remove: removeCrop,
  } = useFieldArray({
    control: form.control,
    name: 'crops',
  });

  const {
    fields: equipmentFields,
    append: appendEquipment,
    remove: removeEquipment,
  } = useFieldArray({
    control: form.control,
    name: 'equipment',
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: form.control,
    name: 'requirements',
  });

  const calculatePremium = () => {
    const totalValue = form.watch('totalValue');
    const baseRate = 0.015; // 1.5% taux de base
    const premium = totalValue * baseRate;
    form.setValue('premium', Math.round(premium));
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    // Reset coverage when type changes
    form.setValue('coverage', []);
    // Set default coverage for the selected type
    if (coverageOptions[type as keyof typeof coverageOptions]) {
      form.setValue('coverage', coverageOptions[type as keyof typeof coverageOptions]);
    }
  };

  const onSubmitForm = async (data: InsuranceFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        coverage: data.coverage.filter(item => item.trim() !== ''),
        crops: data.crops.filter(item => item.trim() !== ''),
        equipment: data.equipment.filter(item => item.trim() !== ''),
        requirements: data.requirements.filter(item => item.trim() !== ''),
        id: item?.id || `INS-${Date.now()}`,
      });
    } catch (error) {
      console.error('Error submitting insurance form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCropsOrEquipment = () => {
    if (selectedType === 'Assurance Récolte Multirisque' || selectedType === 'Assurance Bétail') {
      return 'crops';
    } else if (selectedType === 'Assurance Équipement Agricole') {
      return 'equipment';
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {item ? 'Modifier la police d\'assurance' : 'Nouvelle police d\'assurance'}
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={calculatePremium}
          className="gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculer la prime
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Informations Générales</TabsTrigger>
              <TabsTrigger value="coverage">Couverture et Risques</TabsTrigger>
              <TabsTrigger value="financial">Détails Financiers</TabsTrigger>
              <TabsTrigger value="conditions">Conditions et Obligations</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assureur</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner l'assureur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {providers.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'assurance</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleTypeChange(value);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {insuranceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="policyStart"
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
                  name="policyEnd"
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

                <FormField
                  control={form.control}
                  name="nextPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prochaine prime</FormLabel>
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
                name="insuredArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surface assurée (ha)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 45" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Périmètre d'assurance</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description du périmètre couvert..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="coverage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur assurée</FormLabel>
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
                  name="coverageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de couverture</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 80% de la valeur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deductible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Franchise</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 10%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="premiumFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fréquence de la prime</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la fréquence" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {premiumFrequencies.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Risques couverts</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCoverage('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                {coverageFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`coverage.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Risque couvert..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {coverageFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCoverage(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {getCropsOrEquipment() === 'crops' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Cultures assurées</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCrop('')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                  {cropFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`crops.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la culture" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cropOptions.map((crop) => (
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
                      {cropFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCrop(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {getCropsOrEquipment() === 'equipment' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Équipements assurés</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendEquipment('')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                  {equipmentFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`equipment.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner l'équipement" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipmentOptions.map((equipment) => (
                                  <SelectItem key={equipment} value={equipment}>
                                    {equipment}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {equipmentFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEquipment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="premium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prime d'assurance</FormLabel>
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
                  name="premiumFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fréquence de paiement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la fréquence" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {premiumFrequencies.map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nextPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date du prochain paiement</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Notes financières</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes supplémentaires sur les aspects financiers..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Conditions et obligations</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRequirement('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                {requirementFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`requirements.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Condition ou obligation..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {requirementFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions générales</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Conditions générales du contrat d'assurance..." {...field} />
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
                      <Textarea placeholder="Notes supplémentaires sur la police d'assurance..." {...field} />
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
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la police'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
