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

const subsidySchema = z.object({
  name: z.string().min(5, 'Le nom du programme est requis'),
  organization: z.string().min(2, 'L\'organisation est requise'),
  type: z.enum(['Subvention', 'Prêt à taux préférentiel', 'Aide financière', 'Soutien technique']),
  amount: z.number().min(10000, 'Le montant doit être supérieur à 10,000 FCFA'),
  currency: z.string().default('FCFA'),
  purpose: z.string().min(10, 'L\'objectif doit contenir au moins 10 caractères'),
  requirements: z.array(z.string()).min(1, 'Au moins un document requis'),
  applicationDate: z.string().min(1, 'La date de demande est requise'),
  nextDeadline: z.string().min(1, 'La date limite est requise'),
  reportingFrequency: z.enum(['Mensuel', 'Trimestriel', 'Semestriel', 'Annuel']),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  contactPerson: z.string().min(2, 'Le contact est requis'),
  contactEmail: z.string().email('L\'email doit être valide'),
  contactPhone: z.string().min(10, 'Le numéro de téléphone est requis'),
  additionalNotes: z.string().optional(),
});

type SubsidyFormData = z.infer<typeof subsidySchema>;

interface SubsidyFormProps {
  item?: SubsidyFormData | null;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
}

const organizationTypes = [
  'Ministère de l\'Agriculture',
  'Banque Mondiale',
  'ANADER',
  'FIDA',
  'UEMOA',
  'CEDEAO',
  'ONG locale',
  'Organisation internationale',
  'Institution financière',
  'Autre'
];

const subsidyTypes = [
  { value: 'Subvention', label: 'Subvention' },
  { value: 'Prêt à taux préférentiel', label: 'Prêt à taux préférentiel' },
  { value: 'Aide financière', label: 'Aide financière' },
  { value: 'Soutien technique', label: 'Soutien technique' }
];

const reportingFrequencies = [
  { value: 'Mensuel', label: 'Mensuel' },
  { value: 'Trimestriel', label: 'Trimestriel' },
  { value: 'Semestriel', label: 'Semestriel' },
  { value: 'Annuel', label: 'Annuel' }
];

const commonRequirements = [
  'Certificat de producteur',
  'Plan de culture',
  'Justificatifs d\'achat',
  'Étude de faisabilité',
  'Garanties bancaires',
  'Plan d\'affaires',
  'Registre de coopérative',
  'Statuts juridiques',
  'Bilans financiers',
  'Attestation de propriété',
  'Autorisation environnementale',
  'Certificat de conformité'
];

export const SubsidyForm: React.FC<SubsidyFormProps> = ({ item, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubsidyFormData>({
    resolver: zodResolver(subsidySchema),
    defaultValues: {
      name: item?.name || '',
      organization: item?.organization || '',
      type: item?.type || 'Subvention',
      amount: item?.amount || 0,
      currency: item?.currency || 'FCFA',
      purpose: item?.purpose || '',
      requirements: item?.requirements || [],
      applicationDate: item?.applicationDate || '',
      nextDeadline: item?.nextDeadline || '',
      reportingFrequency: item?.reportingFrequency || 'Trimestriel',
      description: item?.description || '',
      contactPerson: item?.contactPerson || '',
      contactEmail: item?.contactEmail || '',
      contactPhone: item?.contactPhone || '',
      additionalNotes: item?.additionalNotes || '',
    },
  });

  const onSubmitForm = async (data: SubsidyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id || `SUB-${Date.now()}`,
        status: 'pending',
        approvalDate: null,
        disbursementDate: null,
        disbursementAmount: 0,
        remainingAmount: data.amount,
      });
    } catch (error) {
      console.error('Error submitting subsidy form:', error);
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
          <TabsTrigger value="requirements">Documents Requis</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du programme</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Programme d'Appui aux Petits Producteurs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'organisation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizationTypes.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
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
                  <FormLabel>Type de soutien</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subsidyTypes.map((type) => (
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant demandé (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="10000"
                      placeholder="5000000"
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
              name="applicationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de demande</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prochaine date limite</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence de reporting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la fréquence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reportingFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
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
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objectif de la demande</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez l'objectif de votre demande de subvention..."
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description détaillée</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description complète du programme, contexte, et bénéfices attendus..."
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <div>
            <FormLabel>Documents requis</FormLabel>
            <p className="text-sm text-muted-foreground mb-4">
              Sélectionnez les documents nécessaires pour cette demande
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonRequirements.map((requirement) => (
                <label key={requirement} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={requirement}
                    checked={form.watch('requirements').includes(requirement)}
                    onChange={(e) => {
                      const currentRequirements = form.getValues('requirements');
                      if (e.target.checked) {
                        form.setValue('requirements', [...currentRequirements, requirement]);
                      } else {
                        form.setValue('requirements', currentRequirements.filter(r => r !== requirement));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{requirement}</span>
                </label>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="additionalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes supplémentaires</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informations complémentaires sur les documents ou exigences spécifiques..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personne à contacter</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@organisation.org" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+225 01 23 45 67 89" {...field} />
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
          {isSubmitting ? 'Soumission...' : 'Soumettre la demande'}
        </Button>
      </div>
      </form>
    </Form>
  );
};