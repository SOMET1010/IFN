import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ShoppingCart,
  Package,
  Handshake,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Product } from '@/types';
import ProductPublication from './ProductPublication';
import PriceNegotiation from './PriceNegotiation';
import SecurePayment from './SecurePayment';

type TransactionStep = 'browse' | 'publish' | 'negotiate' | 'payment' | 'delivery' | 'completed';

interface TransactionWorkflowProps {
  initialStep?: TransactionStep;
  product?: Product;
}

const TransactionWorkflow = ({ initialStep = 'browse', product }: TransactionWorkflowProps) => {
  const [currentStep, setCurrentStep] = useState<TransactionStep>(initialStep);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product || null);
  const [negotiationResult, setNegotiationResult] = useState<Record<string, unknown> | null>(null);
  const [paymentResult, setPaymentResult] = useState<Record<string, unknown> | null>(null);

  const steps = [
    { id: 'browse', name: 'Parcourir', icon: ShoppingCart, description: 'Découvrir les produits' },
    { id: 'publish', name: 'Publier', icon: Package, description: 'Créer une offre' },
    { id: 'negotiate', name: 'Négocier', icon: Handshake, description: 'Discuter du prix' },
    { id: 'payment', name: 'Payer', icon: CreditCard, description: 'Paiement sécurisé' },
    { id: 'delivery', name: 'Livrer', icon: Truck, description: 'Suivi de livraison' },
    { id: 'completed', name: 'Terminé', icon: CheckCircle, description: 'Transaction réussie' }
  ];

  const getStepIndex = (step: TransactionStep) => {
    return steps.findIndex(s => s.id === step);
  };

  const currentStepIndex = getStepIndex(currentStep);
  const progress = (currentStepIndex / (steps.length - 1)) * 100;

  const handleProductPublished = (productData: Omit<Product, 'id'>) => {
    const newProduct = {
      ...productData,
      id: `PROD${Date.now()}`
    };
    setSelectedProduct(newProduct as Product);
    setCurrentStep('browse');
  };

  const handleNegotiationComplete = (finalPrice: number, agreement: Record<string, unknown>) => {
    setNegotiationResult({ finalPrice, agreement });
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (paymentResult: Record<string, unknown>) => {
    setPaymentResult(paymentResult);
    setCurrentStep('delivery');
  };

  const startPublishing = () => {
    setCurrentStep('publish');
  };

  const startNegotiation = (product: Product) => {
    setSelectedProduct(product);
    setCurrentStep('negotiate');
  };

  const completeTransaction = () => {
    setCurrentStep('completed');
  };

  const resetWorkflow = () => {
    setCurrentStep('browse');
    setSelectedProduct(null);
    setNegotiationResult(null);
    setPaymentResult(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'publish':
        return (
          <ProductPublication
            onProductPublished={handleProductPublished}
            onCancel={() => setCurrentStep('browse')}
          />
        );

      case 'negotiate':
        if (!selectedProduct) return null;
        return (
          <PriceNegotiation
            product={selectedProduct}
            onNegotiationComplete={handleNegotiationComplete}
            onCancel={() => setCurrentStep('browse')}
          />
        );

      case 'payment':
        if (!selectedProduct || !negotiationResult) return null;
        return (
          <SecurePayment
            paymentData={{
              amount: negotiationResult.finalPrice,
              productName: selectedProduct.name,
              sellerName: selectedProduct.producer,
              orderId: `ORD${Date.now()}`
            }}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => setCurrentStep('negotiate')}
          />
        );

      case 'delivery':
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Suivi de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium">Commande préparée</h4>
                      <Badge variant="secondary" className="mt-2">Complété</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Truck className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <h4 className="font-medium">En livraison</h4>
                      <Badge variant="outline" className="mt-2">En cours</Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h4 className="font-medium">Livré</h4>
                      <Badge variant="outline" className="mt-2">En attente</Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Informations de livraison</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Transporteur:</strong> Express Delivery CI</p>
                    <p><strong>Estimation:</strong> 2-3 jours ouvrés</p>
                    <p><strong>Numéro de suivi:</strong> TRK{Date.now()}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline">Contacter le transporteur</Button>
                  <Button onClick={completeTransaction}>Confirmer la réception</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'completed':
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">Transaction réussie !</h2>
                <p className="text-gray-600 mb-6">
                  Votre transaction a été complétée avec succès.
                </p>

                {paymentResult && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold mb-2">Résumé de la transaction</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>ID Transaction:</span>
                        <span>{paymentResult.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant payé:</span>
                        <span>{paymentResult.amount} FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Méthode:</span>
                        <span>{paymentResult.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(paymentResult.timestamp).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 justify-center">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Nouvelle transaction
                  </Button>
                  <Button>Télécharger le reçu</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Marché virtuel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  Bienvenue sur le marché virtuel. Vous pouvez parcourir les produits disponibles ou publier vos propres offres.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={startPublishing}>
                    <CardContent className="p-6 text-center">
                      <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Publier une offre</h3>
                      <p className="text-sm text-gray-600">
                        Mettez en vente vos produits agricoles
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <ShoppingCart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Acheter des produits</h3>
                      <p className="text-sm text-gray-600">
                        Découvrez les offres disponibles
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sample products for demonstration */}
                <div>
                  <h3 className="font-semibold mb-3">Offres disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Tomates fraîches</h4>
                          <Badge variant="secondary">Fruits</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Producteur: Kouadio Amani</p>
                        <p className="text-sm text-gray-600 mb-3">Prix: 800 FCFA/kg</p>
                        <Button
                          size="sm"
                          onClick={() => startNegotiation({
                            id: '1',
                            name: 'Tomates fraîches',
                            price: 800,
                            quantity: 50,
                            unit: 'kg',
                            producer: 'Kouadio Amani',
                            category: 'fruits',
                            description: 'Tomates fraîches de qualité',
                            location: 'Yamoussoukro',
                            status: 'available',
                            quality: 'standard',
                            origin: 'Côte d\'Ivoire',
                            harvest_date: new Date().toISOString()
                          })}
                        >
                          Négocier
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Igname bio</h4>
                          <Badge variant="secondary">Céréales</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Producteur: Fatou Traoré</p>
                        <p className="text-sm text-gray-600 mb-3">Prix: 600 FCFA/kg</p>
                        <Button
                          size="sm"
                          onClick={() => startNegotiation({
                            id: '2',
                            name: 'Igname bio',
                            price: 600,
                            quantity: 100,
                            unit: 'kg',
                            producer: 'Fatou Traoré',
                            category: 'cereales',
                            description: 'Igname biologique certifiée',
                            location: 'Bouaké',
                            status: 'available',
                            quality: 'premium',
                            origin: 'Côte d\'Ivoire',
                            harvest_date: new Date().toISOString()
                          })}
                        >
                          Négocier
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Don't show step navigation for publish, negotiate, payment, and delivery steps
  if (['publish', 'negotiate', 'payment', 'delivery', 'completed'].includes(currentStep)) {
    return renderStepContent();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with Progress */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Workflow de transaction</h1>

          {/* Step Navigation */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progression du workflow</span>
                <span>{Math.round(progress)}% complété</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {steps.map((step, index) => {
                const stepStatus = index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'pending';
                const Icon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer p-4 rounded-lg border-2 text-center transition-all ${
                      stepStatus === 'completed'
                        ? 'border-green-500 bg-green-50'
                        : stepStatus === 'current'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    onClick={() => {
                      // Allow navigation to completed steps and next step
                      if (stepStatus === 'completed' || (stepStatus === 'current' && index > 0)) {
                        setCurrentStep(step.id as TransactionStep);
                      }
                    }}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${
                      stepStatus === 'completed'
                        ? 'text-green-600'
                        : stepStatus === 'current'
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`} />
                    <h3 className="font-medium text-sm">{step.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    {stepStatus === 'completed' && (
                      <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-2" />
                    )}
                    {stepStatus === 'current' && (
                      <Clock className="h-4 w-4 text-blue-600 mx-auto mt-2" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TransactionWorkflow;