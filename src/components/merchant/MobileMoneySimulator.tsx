import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { transactionsService, MobileMoneyOperator } from '@/services/supabase/transactionsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
  Info,
  AlertCircle
} from 'lucide-react';

interface MobileMoneySimulatorProps {
  amount: number;
  referenceId?: string;
  referenceType?: 'sale' | 'order' | 'contribution' | 'other';
  onSuccess?: (transactionCode: string) => void;
  onCancel?: () => void;
}

export default function MobileMoneySimulator({
  amount,
  referenceId,
  referenceType = 'sale',
  onSuccess,
  onCancel
}: MobileMoneySimulatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [operators, setOperators] = useState<MobileMoneyOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationStep, setSimulationStep] = useState<'select' | 'input' | 'processing' | 'confirm' | 'success' | 'failed'>('select');
  const [transactionCode, setTransactionCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getOperators();
      setOperators(data);
    } catch (error) {
      console.error('Error loading operators:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les opérateurs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectOperator = (operatorCode: string) => {
    setSelectedOperator(operatorCode);
    setSimulationStep('input');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\s/g, '');
    const ivoirianPattern = /^(\+225|225|0)?[0-9]{10}$/;
    return ivoirianPattern.test(cleaned);
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\s/g, '').replace(/\+225/g, '').replace(/^225/, '').replace(/^0/, '');

    if (cleaned.length === 10) {
      return `+225${cleaned}`;
    }
    return phone;
  };

  const startPayment = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: 'Numéro invalide',
        description: 'Veuillez entrer un numéro de téléphone ivoirien valide',
        variant: 'destructive',
      });
      return;
    }

    const operator = operators.find(op => op.code === selectedOperator);
    if (!operator) return;

    if (amount < operator.min_amount || amount > operator.max_amount) {
      toast({
        title: 'Montant invalide',
        description: `Le montant doit être entre ${operator.min_amount} et ${operator.max_amount} FCFA`,
        variant: 'destructive',
      });
      return;
    }

    setSimulationStep('confirm');
  };

  const confirmPayment = async () => {
    if (!user) return;

    setSimulationStep('processing');
    setIsProcessing(true);

    const formattedPhone = formatPhoneNumber(phoneNumber);
    const genTransactionCode = transactionsService.generateTransactionCode();
    setTransactionCode(genTransactionCode);

    setTimeout(async () => {
      const randomSuccess = Math.random() > 0.1;

      try {
        const transaction = await transactionsService.createTransaction({
          user_id: user.id,
          transaction_code: genTransactionCode,
          operator: selectedOperator as 'orange' | 'mtn' | 'wave' | 'moov',
          phone_number: formattedPhone,
          amount,
          transaction_type: 'payment',
          reference_id: referenceId,
          reference_type: referenceType,
          status: randomSuccess ? 'success' : 'failed',
          failure_reason: randomSuccess ? undefined : 'Solde insuffisant (simulation)',
        });

        if (randomSuccess) {
          setSimulationStep('success');
          toast({
            title: 'Paiement réussi',
            description: `Transaction ${genTransactionCode} effectuée avec succès`,
          });
          if (onSuccess) {
            onSuccess(genTransactionCode);
          }
        } else {
          setSimulationStep('failed');
          toast({
            title: 'Paiement échoué',
            description: 'La transaction a échoué (simulation)',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
        setSimulationStep('failed');
        toast({
          title: 'Erreur',
          description: 'Impossible de créer la transaction',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
      }
    }, 3000);
  };

  const reset = () => {
    setSimulationStep('select');
    setSelectedOperator('');
    setPhoneNumber('');
    setTransactionCode('');
  };

  const getOperatorLogo = (code: string) => {
    const logos: Record<string, string> = {
      orange: '🟠',
      mtn: '🟡',
      wave: '🔵',
      moov: '🔴'
    };
    return logos[code] || '💳';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Simulation Mobile Money
        </CardTitle>
        <CardDescription>
          Mode simulation - Aucun paiement réel
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Mode Simulation</p>
            <p className="text-xs mt-1">
              Les paiements sont simulés. 90% de taux de réussite aléatoire.
            </p>
          </div>
        </div>

        {simulationStep === 'select' && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <p className="text-2xl font-bold text-gray-900">{amount.toLocaleString()} FCFA</p>
              <p className="text-sm text-muted-foreground mt-1">Montant à payer</p>
            </div>

            <Separator />

            <div>
              <Label className="text-base mb-3 block">Choisissez votre opérateur</Label>
              <div className="grid grid-cols-2 gap-3">
                {operators.map((operator) => (
                  <button
                    key={operator.code}
                    onClick={() => selectOperator(operator.code)}
                    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <span className="text-4xl">{getOperatorLogo(operator.code)}</span>
                    <span className="font-medium text-sm text-center">{operator.name}</span>
                    <span className="text-xs text-muted-foreground">{operator.ussd_code}</span>
                  </button>
                ))}
              </div>
            </div>

            {onCancel && (
              <Button variant="outline" onClick={onCancel} className="w-full">
                Annuler
              </Button>
            )}
          </div>
        )}

        {simulationStep === 'input' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getOperatorLogo(selectedOperator)}</span>
                <span className="font-medium">
                  {operators.find(op => op.code === selectedOperator)?.name}
                </span>
              </div>
              <Badge variant="secondary">{amount.toLocaleString()} FCFA</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+225 07 XX XX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Format: +225 XXXXXXXXXX ou 07 XX XX XX XX
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">
                Retour
              </Button>
              <Button onClick={startPayment} className="flex-1">
                Continuer
              </Button>
            </div>
          </div>
        )}

        {simulationStep === 'confirm' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Récapitulatif</p>
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Opérateur</span>
                  <span className="font-medium">
                    {operators.find(op => op.code === selectedOperator)?.name}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Numéro</span>
                  <span className="font-medium">{formatPhoneNumber(phoneNumber)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-sm text-muted-foreground">Montant</span>
                  <span className="text-xl font-bold text-primary">{amount.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">
                Annuler
              </Button>
              <Button onClick={confirmPayment} className="flex-1">
                Confirmer le paiement
              </Button>
            </div>
          </div>
        )}

        {simulationStep === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center">
              <span className="font-medium block">Traitement en cours...</span>
              <span className="text-sm text-muted-foreground">Veuillez patienter</span>
            </p>
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>1. Connexion à {operators.find(op => op.code === selectedOperator)?.name}</p>
              <p>2. Vérification du solde</p>
              <p>3. Traitement du paiement</p>
            </div>
          </div>
        )}

        {simulationStep === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-green-600">Paiement réussi!</h3>
              <p className="text-sm text-muted-foreground">Votre transaction a été effectuée</p>
            </div>

            <div className="w-full bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Code transaction</span>
                <span className="font-mono font-medium">{transactionCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-bold">{amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Opérateur</span>
                <span className="font-medium">
                  {operators.find(op => op.code === selectedOperator)?.name}
                </span>
              </div>
            </div>

            <Button onClick={reset} className="w-full">
              Nouveau paiement
            </Button>
          </div>
        )}

        {simulationStep === 'failed' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-red-600">Paiement échoué</h3>
              <p className="text-sm text-muted-foreground">La transaction n'a pas pu être effectuée</p>
            </div>

            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900">Raison de l'échec</p>
                  <p className="text-red-700 mt-1">Solde insuffisant (simulation)</p>
                </div>
              </div>
              {transactionCode && (
                <div className="flex justify-between text-sm pt-2 border-t border-red-200">
                  <span className="text-red-700">Code transaction</span>
                  <span className="font-mono font-medium text-red-900">{transactionCode}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={reset} className="flex-1">
                Réessayer
              </Button>
              {onCancel && (
                <Button variant="ghost" onClick={onCancel} className="flex-1">
                  Fermer
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
