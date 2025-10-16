import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Phone,
  QrCode,
  Landmark,
  Lock
} from 'lucide-react';

interface PaymentData {
  amount: number;
  productName: string;
  sellerName: string;
  orderId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  type: 'mobile_money' | 'bank_transfer' | 'wallet';
  provider: string;
  processingTime: string;
  fees: number;
}

interface SecurePaymentProps {
  paymentData: PaymentData;
  onPaymentComplete: (paymentResult: Record<string, unknown>) => void;
  onCancel: () => void;
}

const SecurePayment = ({ paymentData, onPaymentComplete, onCancel }: SecurePaymentProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'method' | 'details' | 'confirmation' | 'processing' | 'completed'>('method');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: <Phone className="h-5 w-5 text-orange-500" />,
      type: 'mobile_money',
      provider: 'Orange CI',
      processingTime: 'Immédiat',
      fees: 0.01
    },
    {
      id: 'mtn_money',
      name: 'MTN Money',
      icon: <Phone className="h-5 w-5 text-yellow-500" />,
      type: 'mobile_money',
      provider: 'MTN CI',
      processingTime: 'Immédiat',
      fees: 0.01
    },
    {
      id: 'wave',
      name: 'Wave',
      icon: <Smartphone className="h-5 w-5 text-blue-500" />,
      type: 'mobile_money',
      provider: 'Wave Senegal',
      processingTime: 'Immédiat',
      fees: 0.005
    },
    {
      id: 'moov_money',
      name: 'Moov Money',
      icon: <Phone className="h-5 w-5 text-green-500" />,
      type: 'mobile_money',
      provider: 'Moov CI',
      processingTime: 'Immédiat',
      fees: 0.01
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: <Building2 className="h-5 w-5 text-gray-600" />,
      type: 'bank_transfer',
      provider: 'Banques partenaires',
      processingTime: '24-48h',
      fees: 0.02
    },
    {
      id: 'ecobank',
      name: 'Ecobank',
      icon: <Landmark className="h-5 w-5 text-blue-600" />,
      type: 'bank_transfer',
      provider: 'Ecobank CI',
      processingTime: '24h',
      fees: 0.015
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setPaymentStep('details');
  };

  const initiatePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate payment processing
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setPaymentProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        // Simulate payment completion
        setTimeout(() => {
          setPaymentStep('completed');
          setIsProcessing(false);

          const paymentResult = {
            transactionId: `TXN${Date.now()}`,
            amount: paymentData.amount,
            method: selectedMethod,
            timestamp: new Date(),
            status: 'completed',
            fees: paymentMethods.find(m => m.id === selectedMethod)?.fees || 0
          };

          onPaymentComplete(paymentResult);
        }, 1000);
      }
    }, 200);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-CI', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const getMethodById = (id: string) => {
    return paymentMethods.find(method => method.id === id);
  };

  const selectedPaymentMethod = getMethodById(selectedMethod);
  const fees = selectedPaymentMethod ? paymentData.amount * selectedPaymentMethod.fees : 0;
  const totalAmount = paymentData.amount + fees;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h1>
              <p className="text-gray-600">Commande #{paymentData.orderId}</p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold text-gray-900">{formatAmount(paymentData.amount)}</div>
                <div className="text-sm text-gray-600">Montant produit</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold text-orange-600">{formatAmount(fees)}</div>
                <div className="text-sm text-gray-600">Frais de service</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold text-green-600">{formatAmount(totalAmount)}</div>
                <div className="text-sm text-gray-600">Total à payer</div>
              </CardContent>
            </Card>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Paiement sécurisé PCI-DSS
            </Badge>
          </div>
        </div>

        {/* Payment Progress */}
        {paymentStep === 'processing' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Lock className="h-12 w-12 text-blue-600" />
                </motion.div>
                <h3 className="text-lg font-semibold">Traitement du paiement...</h3>
                <Progress value={paymentProgress} className="max-w-md mx-auto" />
                <p className="text-sm text-gray-600">
                  {selectedPaymentMethod?.processingTime === 'Immédiat'
                    ? 'Veuillez patienter pendant que nous traitons votre paiement'
                    : 'Le traitement peut prendre jusqu\'à 24h'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {paymentStep === 'completed' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-xl font-semibold text-green-900">Paiement réussi !</h3>
                <p className="text-gray-600">
                  Votre paiement a été traité avec succès. Un reçu a été généré.
                </p>
                <Button onClick={() => onPaymentComplete({})}>
                  Voir le reçu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods */}
        {paymentStep === 'method' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMethodSelect(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {method.icon}
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{method.processingTime}</div>
                      <div className="text-xs text-orange-600">
                        Frais: {(method.fees * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Details */}
        {paymentStep === 'details' && selectedPaymentMethod && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedPaymentMethod.icon}
                <span className="ml-2">Payer avec {selectedPaymentMethod.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mobile Money Payment */}
              {selectedPaymentMethod.type === 'mobile_money' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Vous allez recevoir une notification sur votre téléphone pour confirmer le paiement.
                    </AlertDescription>
                  </Alert>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de téléphone
                    </label>
                    <Input
                      type="tel"
                      placeholder="Ex: 07XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Résumé du paiement</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Produit:</span>
                        <span>{paymentData.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vendeur:</span>
                        <span>{paymentData.sellerName}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatAmount(totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Escrow Info */}
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">Paiement sécurisé</h4>
                      <Dialog open={showEscrowInfo} onOpenChange={setShowEscrowInfo}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            En savoir plus
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Comment ça marche ?</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 text-sm">
                            <p><strong>1. Votre argent est sécurisé</strong></p>
                            <p>Votre paiement est conservé en sécurité jusqu'à ce que vous confirmiez la réception du produit.</p>
                            <p><strong>2. Le vendeur est notifié</strong></p>
                            <p>Le vendeur est informé que le paiement est en attente de confirmation.</p>
                            <p><strong>3. Libération du paiement</strong></p>
                            <p>Une fois que vous avez reçu et vérifié le produit, le paiement est libéré au vendeur.</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-blue-700">
                      Votre argent est conservé en sécurité jusqu'à la confirmation de réception.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Transfer */}
              {selectedPaymentMethod.type === 'bank_transfer' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Les virements bancaires prennent 24-48h pour être traités.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Coordonnées bancaires</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div><strong>Banque:</strong> Ecobank Côte d'Ivoire</div>
                      <div><strong>Titulaire:</strong> AgriMarket CI</div>
                      <div><strong>IBAN:</strong> CI042 01010 0001234567890123</div>
                      <div><strong>SWIFT:</strong> EBOCCICI</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Important</h4>
                    <p className="text-sm text-yellow-700">
                      Utilisez le numéro de commande <strong>#{paymentData.orderId}</strong> comme référence de virement.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setPaymentStep('method')}>
                  Retour
                </Button>
                <Button
                  onClick={initiatePayment}
                  disabled={selectedPaymentMethod.type === 'mobile_money' && !phoneNumber}
                  className="flex-1"
                >
                  Confirmer le paiement
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Chiffrement SSL
            </div>
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              Norme PCI-DSS
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Garantie de remboursement
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurePayment;