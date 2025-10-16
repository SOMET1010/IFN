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
import { CreditCard, Users, ReceiptText } from 'lucide-react';

// Schémas de validation
const contributionSchema = z.object({
  memberId: z.string().min(1, 'Le membre est requis'),
  amount: z.number().min(100, 'Le montant minimum est de 100 FCFA'),
  method: z.enum(['mobile_money', 'transfer', 'cash', 'check']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const supplierPaymentSchema = z.object({
  supplierName: z.string().min(2, 'Le nom du fournisseur est requis'),
  amount: z.number().min(100, 'Le montant minimum est de 100 FCFA'),
  method: z.enum(['mobile_money', 'transfer', 'cash', 'check']),
  reference: z.string().optional(),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;
type SupplierPaymentFormData = z.infer<typeof supplierPaymentSchema>;

interface PaymentFormProps {
  item?: ContributionFormData | SupplierPaymentFormData | null;
  members?: { id: string; name: string }[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

const paymentMethods = [
  { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
  { value: 'transfer', label: 'Virement Bancaire', icon: '🏦' },
  { value: 'cash', label: 'Espèces', icon: '💵' },
  { value: 'check', label: 'Chèque', icon: '📋' },
];

export const PaymentForm: React.FC<PaymentFormProps> = ({ item, members, onSubmit, onCancel }) => {
  const [activeTab, setActiveTab] = useState(item?.type === 'supplier' ? 'supplier' : 'contribution');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contributionForm = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      memberId: '',
      amount: 0,
      method: 'mobile_money',
      reference: '',
      notes: '',
    },
  });

  const supplierPaymentForm = useForm<SupplierPaymentFormData>({
    resolver: zodResolver(supplierPaymentSchema),
    defaultValues: {
      supplierName: '',
      amount: 0,
      method: 'transfer',
      reference: '',
      invoiceNumber: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (item) {
      if (item.type === 'supplier') {
        setActiveTab('supplier');
        supplierPaymentForm.reset(item);
      } else {
        setActiveTab('contribution');
        contributionForm.reset(item);
      }
    }
  }, [item, contributionForm, supplierPaymentForm]);

  const onContributionSubmit = async (data: ContributionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        date: new Date().toISOString(),
        status: 'pending',
      });
    } catch (error) {
      console.error('Error submitting contribution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSupplierPaymentSubmit = async (data: SupplierPaymentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        date: new Date().toISOString(),
        status: 'completed',
      });
    } catch (error) {
      console.error('Error submitting supplier payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contribution" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contribution Membre
          </TabsTrigger>
          <TabsTrigger value="supplier" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paiement Fournisseur
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contribution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                Enregistrer une Contribution
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enregistrez la contribution d'un membre à la coopérative
              </p>
            </CardHeader>
            <CardContent>
              <Form {...contributionForm}>
                <form onSubmit={contributionForm.handleSubmit(onContributionSubmit)} className="space-y-4">
                  <FormField
                    control={contributionForm.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membre</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un membre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members?.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contributionForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 10000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Montant minimum: 100 FCFA
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contributionForm.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Méthode de Paiement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la méthode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  <span>{method.icon}</span>
                                  {method.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contributionForm.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Référence (Optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Numéro de transaction ou référence"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Pour Mobile Money: numéro de transaction
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contributionForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes supplémentaires sur la contribution..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Informations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Un reçu sera généré automatiquement</li>
                      <li>• La contribution sera marquée comme 'En attente' de rapprochement</li>
                      <li>• Le membre recevra une confirmation par email</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Contribution'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplier">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Enregistrer un Paiement Fournisseur
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enregistrez un paiement effectué à un fournisseur de la coopérative
              </p>
            </CardHeader>
            <CardContent>
              <Form {...supplierPaymentForm}>
                <form onSubmit={supplierPaymentForm.handleSubmit(onSupplierPaymentSubmit)} className="space-y-4">
                  <FormField
                    control={supplierPaymentForm.control}
                    name="supplierName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du Fournisseur</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: AgriSupply CI, SEMAN CI, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={supplierPaymentForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 50000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          Montant minimum: 100 FCFA
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={supplierPaymentForm.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Méthode de Paiement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner la méthode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                <div className="flex items-center gap-2">
                                  <span>{method.icon}</span>
                                  {method.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={supplierPaymentForm.control}
                      name="reference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Référence (Optionnel)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Numéro de référence"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierPaymentForm.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de Facture (Optionnel)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Numéro de facture"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={supplierPaymentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Description des biens/services payés..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">Informations</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Un reçu sera généré automatiquement</li>
                      <li>• Le paiement sera immédiatement marqué comme 'Complété'</li>
                      <li>• Gardez une copie du reçu pour vos archives</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Paiement'}
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