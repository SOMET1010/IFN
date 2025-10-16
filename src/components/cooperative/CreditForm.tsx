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
import { Plus, Trash2, Calculator } from 'lucide-react';

const creditSchema = z.object({
  lender: z.string().min(2, 'Le prêteur est requis'),
  type: z.string().min(2, 'Le type de crédit est requis'),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  currency: z.string().min(3, 'La devise est requise'),
  interestRate: z.number().min(0, 'Le taux d\'intérêt doit être positif'),
  duration: z.number().min(1, 'La durée doit être supérieure à 0'),
  purpose: z.string().min(5, 'L\'objectif est requis'),
  status: z.enum(['draft', 'pending', 'approved', 'active', 'completed', 'defaulted']),
  applicationDate: z.string().min(1, 'La date de demande est requise'),
  approvalDate: z.string().optional(),
  disbursementDate: z.string().optional(),
  firstPaymentDate: z.string().optional(),
  nextPaymentDate: z.string().optional(),
  totalPayments: z.number().min(1, 'Le nombre total de paiements est requis'),
  paymentsMade: z.number().min(0, 'Le nombre de paiements effectués est requis'),
  remainingBalance: z.number().min(0, 'Le solde restant doit être positif'),
  monthlyPayment: z.number().min(0, 'Le paiement mensuel est requis'),
  collateral: z.array(z.string()).optional().default([]),
  guarantee: z.string().optional(),
  conditions: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

type CreditFormData = z.infer<typeof creditSchema>;

interface CreditFormProps {
  item?: CreditFormData & { id?: string };
  onSubmit: (data: CreditFormData & { id: string }) => void;
  onCancel: () => void;
}

const lenders = [
  'Banque Agricole du CI', 'Fonds de Garantie Agricole', 'Société Générale CI',
  'Ecobank CI', 'NSIA Banque', 'Atlas Mara', 'Banque Mondiale', 'BOAD',
  'Banque Nationale d\'Investissement', 'Microfinance Agricole'
];

const creditTypes = [
  'Crédit d\'investissement', 'Crédit de campagne', 'Ligne de crédit renouvelable',
  'Crédit bail', 'Prêt à taux préférentiel', 'Microcrédit', 'Crédit de trésorerie'
];

const currencies = [
  'FCFA', 'EUR', 'USD', 'XOF'
];

const guaranteeTypes = [
  'Garantie coopérative', 'Garantie gouvernementale', 'Nantissement',
  'Hypothèque', 'Caution personnelle', 'Garantie bancaire'
];

const statusOptions = [
  { value: 'draft', label: 'Brouillon', color: 'outline' },
  { value: 'pending', label: 'En attente', color: 'default' },
  { value: 'approved', label: 'Approuvé', color: 'secondary' },
  { value: 'active', label: 'Actif', color: 'default' },
  { value: 'completed', label: 'Terminé', color: 'secondary' },
  { value: 'defaulted', label: 'Défaillant', color: 'destructive' }
];

export const CreditForm: React.FC<CreditFormProps> = ({ item, onSubmit, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const form = useForm<CreditFormData>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      lender: item?.lender || '',
      type: item?.type || '',
      amount: item?.amount || 0,
      currency: item?.currency || 'FCFA',
      interestRate: item?.interestRate || 0,
      duration: item?.duration || 12,
      purpose: item?.purpose || '',
      status: item?.status || 'draft',
      applicationDate: item?.applicationDate || new Date().toISOString().split('T')[0],
      approvalDate: item?.approvalDate || '',
      disbursementDate: item?.disbursementDate || '',
      firstPaymentDate: item?.firstPaymentDate || '',
      nextPaymentDate: item?.nextPaymentDate || '',
      totalPayments: item?.totalPayments || 12,
      paymentsMade: item?.paymentsMade || 0,
      remainingBalance: item?.remainingBalance || 0,
      monthlyPayment: item?.monthlyPayment || 0,
      collateral: item?.collateral || [],
      guarantee: item?.guarantee || '',
      conditions: item?.conditions || [],
      notes: item?.notes || '',
      recommendations: item?.recommendations || '',
    },
  });

  const {
    fields: collateralFields,
    append: appendCollateral,
    remove: removeCollateral,
  } = useFieldArray({
    control: form.control,
    name: 'collateral',
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control: form.control,
    name: 'conditions',
  });

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  const calculateCreditDetails = () => {
    const amount = form.watch('amount');
    const interestRate = form.watch('interestRate');
    const duration = form.watch('duration');
    
    if (amount && interestRate && duration) {
      const monthlyPayment = calculateMonthlyPayment(amount, interestRate, duration);
      const totalPayments = duration;
      const remainingBalance = amount;
      
      form.setValue('monthlyPayment', Math.round(monthlyPayment));
      form.setValue('totalPayments', totalPayments);
      form.setValue('remainingBalance', remainingBalance);
      form.setValue('paymentsMade', 0);
      
      setShowCalculator(false);
    }
  };

  const onSubmitForm = async (data: CreditFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        collateral: data.collateral.filter(item => item.trim() !== ''),
        conditions: data.conditions.filter(item => item.trim() !== ''),
        id: item?.id || `CRED-${Date.now()}`,
      });
    } catch (error) {
      console.error('Error submitting credit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {item ? 'Modifier le crédit' : 'Nouvelle demande de crédit'}
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={calculateCreditDetails}
          className="gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculer les mensualités
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Informations Générales</TabsTrigger>
              <TabsTrigger value="financial">Détails Financiers</TabsTrigger>
              <TabsTrigger value="guarantees">Garanties et Conditions</TabsTrigger>
              <TabsTrigger value="schedule">Échéancier</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prêteur</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le prêteur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {lenders.map((lender) => (
                            <SelectItem key={lender} value={lender}>
                              {lender}
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
                      <FormLabel>Type de crédit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {creditTypes.map((type) => (
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

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectif du crédit</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Décrivez l'utilisation prévue du crédit..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  name="approvalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'approbation</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disbursementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de déblocage</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant</FormLabel>
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
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux d'intérêt (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
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
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée (mois)</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="monthlyPayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paiement mensuel</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          readOnly
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
                  name="totalPayments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre total de paiements</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          readOnly
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
                  name="remainingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solde restant</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          readOnly
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
                  name="paymentsMade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paiements effectués</FormLabel>
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
                  name="nextPaymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prochain paiement</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>

            <TabsContent value="guarantees" className="space-y-4">
              <FormField
                control={form.control}
                name="guarantee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de garantie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type de garantie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {guaranteeTypes.map((type) => (
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

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Garanties collatérales</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCollateral('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                {collateralFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`collateral.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Description du collatéral..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {collateralFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollateral(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Conditions spéciales</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCondition('')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                {conditionFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`conditions.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Condition spéciale..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {conditionFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstPaymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date du premier paiement</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextPaymentDate"
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
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes supplémentaires sur le crédit..." {...field} />
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
                      <Textarea placeholder="Recommandations pour la gestion du crédit..." {...field} />
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
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le crédit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
