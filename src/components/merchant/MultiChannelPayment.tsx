import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentMethod, PaymentTransaction } from '@/types/merchant';
import { MerchantAdvancedPaymentService } from '@/services/merchant/merchantAdvancedPaymentService';
import {
  Smartphone,
  CreditCard,
  Building,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Receipt,
  Mail,
  MessageSquare,
  Phone,
  AlertCircle
} from 'lucide-react';

interface MultiChannelPaymentProps {
  amount: number;
  customerInfo: { name: string; phone: string; email?: string };
  onPaymentComplete?: (transaction: PaymentTransaction) => void;
}

export default function MultiChannelPayment({ amount, customerInfo, onPaymentComplete }: MultiChannelPaymentProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState(customerInfo.phone);
  const [receiptSent, setReceiptSent] = useState({ email: false, sms: false });
  const [error, setError] = useState<string | null>(null);
  const [installments, setInstallments] = useState(3);
  const [firstDue, setFirstDue] = useState<string>(new Date(Date.now() + 7*86400000).toISOString().slice(0,10));

  const paymentService = MerchantAdvancedPaymentService.getInstance();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getAvailablePaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      setError('Erreur lors du chargement des méthodes de paiement');
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      let transactionData;

      if (selectedMethod.type === 'mobile_money') {
        const result = await paymentService.requestMobileMoneyPayment(
          mobileMoneyPhone,
          amount,
          selectedMethod.provider || ''
        );

        if (!result.success) {
          throw new Error(result.message);
        }
      }

      transactionData = await paymentService.processPayment(
        selectedMethod.id,
        amount,
        customerInfo,
        selectedMethod.type === 'credit' ? { installments, firstDue } : undefined,
      );

      setTransaction(transactionData);
      onPaymentComplete?.(transactionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendReceipt = async (type: 'email' | 'sms') => {
    if (!transaction) return;

    try {
      let success = false;
      if (type === 'email' && customerInfo.email) {
        const receipt = await paymentService.generateDigitalReceipt(transaction);
        success = await paymentService.sendReceiptByEmail(receipt, customerInfo.email);
      } else if (type === 'sms') {
        const receipt = await paymentService.generateDigitalReceipt(transaction);
        success = await paymentService.sendReceiptBySMS(receipt, customerInfo.phone);
      }

      if (success) {
        setReceiptSent(prev => ({ ...prev, [type]: true }));
      }
    } catch (err) {
      console.error(`Error sending ${type} receipt:`, err);
    }
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'mobile_money': return <Smartphone className="h-5 w-5" />;
      case 'bank_transfer': return <Building className="h-5 w-5" />;
      case 'cash': return <DollarSign className="h-5 w-5" />;
      case 'credit': return <CreditCard className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'processing': return 'En cours';
      case 'failed': return 'Échoué';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paiement Multicanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Montant à payer:</span>
            <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
          </div>
        </div>

        {!transaction ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Sélectionnez une méthode de paiement:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedMethod?.id === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{method.icon}</div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-500">{method.provider}</div>
                        </div>
                      </div>
                      {getMethodIcon(method.type)}
                    </div>
                    {method.fees > 0 && (
                      <div className="text-xs text-gray-500 mt-2">
                        Frais: {method.fees}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedMethod?.type === 'mobile_money' && (
              <div className="space-y-2">
                <Label htmlFor="mobile-phone">Numéro de téléphone Mobile Money:</Label>
                <Input
                  id="mobile-phone"
                  type="tel"
                  value={mobileMoneyPhone}
                  onChange={(e) => setMobileMoneyPhone(e.target.value)}
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
            )}

            {selectedMethod && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Récapitulatif:</span>
                </div>
                <div className="text-sm text-blue-800">
                  <div>Méthode: {selectedMethod.name}</div>
                  {selectedMethod.fees > 0 && (
                    <div>
                      Frais: {formatCurrency((amount * selectedMethod.fees) / 100)}
                    </div>
                  )}
                  <div className="font-medium mt-1">
                    Total: {formatCurrency(amount + (amount * selectedMethod.fees) / 100)}
                  </div>
                  {selectedMethod.type === 'credit' && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium">Échéancier</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Nombre d'échéances</label>
                          <Input type="number" min={1} value={installments} onChange={e => setInstallments(Math.max(1, Number(e.target.value||1)))} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">1ère échéance</label>
                          <Input type="date" value={firstDue} onChange={e => setFirstDue(e.target.value)} />
                        </div>
                      </div>
                      <div className="text-xs text-gray-700">
                        {Array.from({ length: Math.min(installments, 6) }).map((_, i) => {
                          const due = new Date(firstDue || new Date());
                          due.setMonth(due.getMonth() + i);
                          const part = Math.round((amount + (amount * selectedMethod.fees)/100) / installments);
                          return <div key={i}>Échéance {i+1}: {due.toISOString().slice(0,10)} — {formatCurrency(part)}</div>
                        })}
                        {installments > 6 && <div>…</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePayment}
              disabled={!selectedMethod || processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>Payer {formatCurrency(amount)}</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Paiement réussi!</span>
                </div>
                <div className="text-sm text-green-800">
                  Référence: {transaction.reference}
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Statut:</span>
                <Badge className={getStatusColor(transaction.status)}>
                  {getStatusText(transaction.status)}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Montant:</span>
                <span className="font-medium ml-2">{formatCurrency(transaction.amount)}</span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="font-medium ml-2">
                  {new Date(transaction.timestamp).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Référence:</span>
                <span className="font-medium ml-2">{transaction.reference}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">Envoyer le reçu:</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSendReceipt('email')}
                  disabled={!customerInfo.email || receiptSent.email}
                  variant="outline"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {receiptSent.email ? 'Envoyé' : 'Par email'}
                </Button>
                <Button
                  onClick={() => handleSendReceipt('sms')}
                  disabled={receiptSent.sms}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {receiptSent.sms ? 'Envoyé' : 'Par SMS'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setTransaction(null)} variant="outline">
                Nouveau paiement
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
