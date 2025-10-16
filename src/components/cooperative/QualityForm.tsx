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

const qualityControlSchema = z.object({
  product: z.string().min(2, 'Le produit est requis'),
  batchNumber: z.string().min(1, 'Le numéro de lot est requis'),
  inspectionDate: z.string().min(1, 'La date d\'inspection est requise'),
  inspector: z.string().min(2, 'L\'inspecteur est requis'),
  sampleSize: z.string().min(1, 'La taille de l\'échantillon est requise'),
  location: z.string().min(2, 'L\'emplacement est requis'),
  criteria: z.array(z.object({
    name: z.string().min(1, 'Le nom du critère est requis'),
    standard: z.string().min(1, 'La standard est requise'),
    measured: z.string().min(1, 'La mesure est requise'),
    result: z.enum(['passed', 'failed', 'warning']),
    score: z.number().min(0).max(10),
  })).min(1, 'Au moins un critère est requis'),
  overallScore: z.number().min(0).max(10),
  status: z.enum(['passed', 'failed', 'warning']),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

type QualityControlFormData = z.infer<typeof qualityControlSchema>;

interface QualityFormProps {
  item?: QualityControlFormData & { id?: string };
  onSubmit: (data: QualityControlFormData & { id: string }) => void;
  onCancel: () => void;
}

const products = [
  'Cacao Fèves', 'Café Vert', 'Noix de Cajou', 'Coton',
  'Hévéa Latex', 'Banane', 'Mangue', 'Ananas', 'Maïs', 'Manioc'
];

const resultOptions = [
  { value: 'passed', label: 'Conforme', color: 'default' },
  { value: 'failed', label: 'Non conforme', color: 'destructive' },
  { value: 'warning', label: 'Attention', color: 'secondary' }
];

const statusOptions = [
  { value: 'passed', label: 'Approuvé', color: 'default' },
  { value: 'failed', label: 'Rejeté', color: 'destructive' },
  { value: 'warning', label: 'Attention', color: 'secondary' }
];

export const QualityForm: React.FC<QualityFormProps> = ({ item, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QualityControlFormData>({
    resolver: zodResolver(qualityControlSchema),
    defaultValues: {
      product: item?.product || '',
      batchNumber: item?.batchNumber || '',
      inspectionDate: item?.inspectionDate || '',
      inspector: item?.inspector || '',
      sampleSize: item?.sampleSize || '',
      location: item?.location || '',
      criteria: item?.criteria || [{
        name: '',
        standard: '',
        measured: '',
        result: 'passed',
        score: 0,
      }],
      overallScore: item?.overallScore || 0,
      status: item?.status || 'passed',
      notes: item?.notes || '',
      recommendations: item?.recommendations || '',
    },
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control: form.control,
    name: 'criteria',
  });

  const onSubmitForm = async (data: QualityControlFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id || `QC-${Date.now()}`,
      });
    } catch (error) {
      console.error('Error submitting quality form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateOverallScore = (criteria: QualityControlFormData['criteria']) => {
    if (criteria.length === 0) return 0;
    const total = criteria.reduce((sum, criterion) => sum + criterion.score, 0);
    return Math.round(total / criteria.length * 10) / 10;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Informations Générales</TabsTrigger>
          <TabsTrigger value="criteria">Critères d'Inspection</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produit</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le produit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
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
                    <Input placeholder="Ex: CACAO-2024-003" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspectionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'inspection</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inspector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspecteur</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Kouadio Amani" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sampleSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taille de l'échantillon</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 5 kg" {...field} />
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
          </div>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Critères d'Inspection</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendCriteria({
                name: '',
                standard: '',
                measured: '',
                result: 'passed',
                score: 0,
              })}
            >
              Ajouter un critère
            </Button>
          </div>

          <div className="space-y-4">
            {criteriaFields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Critère {index + 1}</CardTitle>
                    {criteriaFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriteria(index)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`criteria.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du critère</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Humidité" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`criteria.${index}.standard`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 7-8%" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`criteria.${index}.measured`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mesurée</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 7.5%" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`criteria.${index}.result`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Résultat</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le résultat" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {resultOptions.map((result) => (
                                <SelectItem key={result.value} value={result.value}>
                                  {result.label}
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
                      name={`criteria.${index}.score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score (0-10)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              placeholder="8.5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
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

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="overallScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score global (0-10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="8.2"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut final</FormLabel>
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
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes d'inspection</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observations détaillées sur l'inspection..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommendations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommandations</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Recommandations pour l'amélioration..."
                    className="resize-none"
                    {...field}
                  />
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
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer le contrôle'}
        </Button>
      </div>
      </form>
    </Form>
  );
};
