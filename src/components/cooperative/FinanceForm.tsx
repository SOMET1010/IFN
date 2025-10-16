import React, { useState, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schémas de validation
const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(2, 'La catégorie est requise'),
  description: z.string().min(3, 'La description doit contenir au moins 3 caractères'),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  date: z.string().min(1, 'La date est requise'),
  reference: z.string().optional(),
  memberId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']),
  paymentMethod: z.enum(['cash', 'mobile_money', 'bank_transfer', 'check']),
  notes: z.string().optional(),
});

const budgetSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  totalAmount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  category: z.string().min(2, 'La catégorie est requise'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

const subsidySchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  requestedAmount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  provider: z.string().min(2, 'L\'organisme est requis'),
  category: z.string().min(2, 'La catégorie est requise'),
  purpose: z.string().min(5, 'L\'objectif est requis'),
  applicationDate: z.string().min(1, 'La date de demande est requise'),
  expectedDecisionDate: z.string().optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const creditSchema = z.object({
  lender: z.string().min(2, 'Le prêteur est requis'),
  type: z.string().min(2, 'Le type de crédit est requis'),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  interestRate: z.number().min(0, 'Le taux d\'intérêt doit être positif'),
  duration: z.number().min(1, 'La durée doit être supérieure à 0'),
  purpose: z.string().min(5, 'L\'objectif est requis'),
  collateral: z.array(z.string()).optional(),
  guarantee: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  applicationDate: z.string().min(1, 'La date de demande est requise'),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
type BudgetFormData = z.infer<typeof budgetSchema>;
type SubsidyFormData = z.infer<typeof subsidySchema>;
type CreditFormData = z.infer<typeof creditSchema>;

interface FinanceFormProps {
  item?: TransactionFormData | BudgetFormData | SubsidyFormData | CreditFormData | null;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
}

const transactionCategories = [
  'salaire', 'transport', 'stockage', 'vente', 'achat',
  'maintenance', 'formation', 'administration', 'marketing', 'autre'
];

const budgetCategories = [
  'Opérations', 'Personnel', 'Équipement', 'Marketing',
  'Formation', 'Transport', 'Stockage', 'Administration'
];

const subsidyCategories = [
  'Agriculture', 'Équipement', 'Formation', 'Infrastructure',
  'Environnement', 'Innovation', 'Développement rural'
];

const subsidyProviders = [
  'Ministère de l\'Agriculture', 'Banque Mondiale', 'UE', 'FAO',
  'ONG Agricole', 'Fonds de Développement', 'Banque Africaine de Développement'
];

const creditLenders = [
  'Banque Agricole du CI', 'Société Générale CI', 'Ecobank CI',
  'NSIA Banque', 'Atlas Mara', 'Banque Mondiale', 'BOAD'
];

const creditTypes = [
  'Crédit d\'investissement', 'Crédit de campagne', 'Ligne de crédit renouvelable',
  'Crédit bail', 'Prêt à taux préférentiel', 'Microcrédit'
];

export const FinanceForm: React.FC<FinanceFormProps> = ({ item, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState('transaction');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      reference: '',
      status: 'completed',
      paymentMethod: 'cash',
      notes: '',
    },
  });

  const budgetForm = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      name: '',
      description: '',
      totalAmount: 0,
      category: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
    },
  });

  const subsidyForm = useForm<SubsidyFormData>({
    resolver: zodResolver(subsidySchema),
    defaultValues: {
      title: '',
      description: '',
      requestedAmount: 0,
      provider: '',
      category: '',
      purpose: '',
      applicationDate: new Date().toISOString().split('T')[0],
      documents: [],
      notes: '',
    },
  });

  const creditForm = useForm<CreditFormData>({
    resolver: zodResolver(creditSchema),
    defaultValues: {
      lender: '',
      type: '',
      amount: 0,
      interestRate: 0,
      duration: 12,
      purpose: '',
      collateral: [],
      guarantee: '',
      conditions: [],
      applicationDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  useEffect(() => {
    if (item) {
      if (item.type === 'budget') {
        setActiveTab('budget');
        budgetForm.reset(item);
      } else if (item.type === 'subsidy') {
        setActiveTab('subsidy');
        subsidyForm.reset(item);
      } else if (item.type === 'credit') {
        setActiveTab('credit');
        creditForm.reset(item);
      } else {
        setActiveTab('transaction');
        transactionForm.reset(item);
      }
    }
  }, [item, transactionForm, budgetForm, subsidyForm, creditForm]);

  const onTransactionSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id,
        createdBy: 'current_user',
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onBudgetSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id,
        spentAmount: 0,
        status: 'active',
        createdBy: 'current_user',
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error submitting budget:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubsidySubmit = async (data: SubsidyFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id,
        status: 'pending',
        approvedAmount: 0,
        decisionDate: '',
        decisionBy: '',
        rejectionReason: '',
        createdBy: 'current_user',
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error submitting subsidy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCreditSubmit = async (data: CreditFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id,
        status: 'pending',
        approvalDate: '',
        disbursementDate: '',
        repaymentSchedule: [],
        createdBy: 'current_user',
        createdAt: item?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error submitting credit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transaction">Transaction</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="subsidy">Subvention</TabsTrigger>
          <TabsTrigger value="credit">Crédit</TabsTrigger>
        </TabsList>

        <TabsContent value="transaction">
          <Card>
            <CardHeader>
              <CardTitle>
                {item ? 'Modifier la transaction' : 'Nouvelle transaction'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...transactionForm}>
                <form onSubmit={transactionForm.handleSubmit(onTransactionSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={transactionForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="income">Revenu</SelectItem>
                              <SelectItem value="expense">Dépense</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transactionForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant (FCFA)</FormLabel>
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

                  <FormField
                    control={transactionForm.control}
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
                            {transactionCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description de la transaction..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={transactionForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={transactionForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode de paiement</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Espèces</SelectItem>
                              <SelectItem value="mobile_money">Mobile Money</SelectItem>
                              <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                              <SelectItem value="check">Chèque</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={transactionForm.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Référence</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro de référence..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
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
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="completed">Complété</SelectItem>
                            <SelectItem value="cancelled">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={transactionForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes supplémentaires..." {...field} />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle>
                {item ? 'Modifier le budget' : 'Créer un budget'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...budgetForm}>
                <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={budgetForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du budget</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du budget..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={budgetForm.control}
                      name="totalAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant total (FCFA)</FormLabel>
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

                  <FormField
                    control={budgetForm.control}
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
                            {budgetCategories.map((category) => (
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
                    control={budgetForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description du budget..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={budgetForm.control}
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
                      control={budgetForm.control}
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
                    control={budgetForm.control}
                    name="assignedTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigné à</FormLabel>
                        <FormControl>
                          <Input placeholder="Responsable du budget..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={budgetForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes supplémentaires..." {...field} />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subsidy">
          <Card>
            <CardHeader>
              <CardTitle>
                {item ? 'Modifier la demande' : 'Demander une subvention'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...subsidyForm}>
                <form onSubmit={subsidyForm.handleSubmit(onSubsidySubmit)} className="space-y-4">
                  <FormField
                    control={subsidyForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre de la demande..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={subsidyForm.control}
                      name="requestedAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant demandé (FCFA)</FormLabel>
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
                      control={subsidyForm.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisme</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'organisme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subsidyProviders.map((provider) => (
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={subsidyForm.control}
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
                              {subsidyCategories.map((category) => (
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
                      control={subsidyForm.control}
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
                  </div>

                  <FormField
                    control={subsidyForm.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectif</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Objectif de la subvention..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsidyForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description détaillée</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description détaillée du projet..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsidyForm.control}
                    name="expectedDecisionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de décision attendue</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsidyForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes supplémentaires..." {...field} />
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
                      {isSubmitting ? 'Enregistrement...' : 'Soumettre la demande'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit">
          <Card>
            <CardHeader>
              <CardTitle>
                {item ? 'Modifier la demande' : 'Demander un crédit'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...creditForm}>
                <form onSubmit={creditForm.handleSubmit(onCreditSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={creditForm.control}
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
                              {creditLenders.map((lender) => (
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
                      control={creditForm.control}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={creditForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant (FCFA)</FormLabel>
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
                      control={creditForm.control}
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
                      control={creditForm.control}
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

                  <FormField
                    control={creditForm.control}
                    name="purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objectif</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Objectif du crédit..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creditForm.control}
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
                    control={creditForm.control}
                    name="guarantee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de garantie</FormLabel>
                        <FormControl>
                          <Input placeholder="Type de garantie..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={creditForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes supplémentaires..." {...field} />
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
                      {isSubmitting ? 'Enregistrement...' : 'Soumettre la demande'}
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