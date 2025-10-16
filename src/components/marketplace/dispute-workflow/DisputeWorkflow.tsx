import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  FileText,
  Bot,
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Scale
} from 'lucide-react';
import DisputeReporting from './DisputeReporting';
import AIMediation from './AIMediation';
import DisputeResolution from './DisputeResolution';

type DisputeStep = 'reporting' | 'mediation' | 'resolution' | 'completed';

interface DisputeData {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  urgency: string;
  resolutionRequested: string;
  orderId: string;
  productName: string;
  sellerName: string;
  buyerName: string;
  amount: number;
}

const DisputeWorkflow = ({ initialOrderId }: { initialOrderId?: string }) => {
  const [currentStep, setCurrentStep] = useState<DisputeStep>('reporting');
  const [disputeData, setDisputeData] = useState<DisputeData | null>(null);
  const [mediationResult, setMediationResult] = useState<Record<string, unknown> | null>(null);
  const [resolutionResult, setResolutionResult] = useState<Record<string, unknown> | null>(null);

  const steps = [
    { id: 'reporting', name: 'Signalement', icon: FileText, description: 'Déclarer le litige' },
    { id: 'mediation', name: 'Médiation', icon: Bot, description: 'Résolution assistée par IA' },
    { id: 'resolution', name: 'Résolution', icon: Scale, description: 'Accord final' },
    { id: 'completed', name: 'Terminé', icon: CheckCircle, description: 'Litige résolu' }
  ];

  const getStepIndex = (step: DisputeStep) => {
    return steps.findIndex(s => s.id === step);
  };

  const currentStepIndex = getStepIndex(currentStep);
  const progress = (currentStepIndex / (steps.length - 1)) * 100;

  const handleDisputeSubmitted = (dispute: DisputeData) => {
    setDisputeData(dispute);
    setCurrentStep('mediation');
  };

  const handleMediationComplete = (resolution: Record<string, unknown>) => {
    setMediationResult(resolution);
    setCurrentStep('resolution');
  };

  const handleEscalateToHuman = () => {
    // Handle escalation to human mediator
    console.log('Escalating to human mediator...');
  };

  const handleResolutionComplete = (feedback: Record<string, unknown>) => {
    setResolutionResult(feedback);
    setCurrentStep('completed');
  };

  const handleDownloadReceipt = () => {
    // Generate and download receipt
    console.log('Downloading receipt...');
  };

  const resetWorkflow = () => {
    setCurrentStep('reporting');
    setDisputeData(null);
    setMediationResult(null);
    setResolutionResult(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'reporting':
        return (
          <DisputeReporting
            disputeData={{
              orderId: initialOrderId || `ORD${Date.now()}`,
              productName: 'Produit exemple',
              sellerName: 'Vendeur exemple',
              buyerName: 'Acheteur exemple',
              amount: 15000
            }}
            onDisputeSubmitted={handleDisputeSubmitted}
            onCancel={resetWorkflow}
          />
        );

      case 'mediation':
        if (!disputeData) return null;
        return (
          <AIMediation
            disputeData={disputeData}
            onMediationComplete={handleMediationComplete}
            onEscalateToHuman={handleEscalateToHuman}
            onCancel={() => setCurrentStep('reporting')}
          />
        );

      case 'resolution':
        if (!disputeData || !mediationResult) return null;
        return (
          <DisputeResolution
            resolutionData={{
              disputeId: disputeData.id,
              resolution: mediationResult.resolution,
              satisfaction: mediationResult.satisfaction,
              timestamp: mediationResult.timestamp,
              messages: mediationResult.messages,
              amount: disputeData.amount,
              productName: disputeData.productName,
              sellerName: disputeData.sellerName,
              buyerName: disputeData.buyerName
            }}
            onResolutionComplete={handleResolutionComplete}
            onDownloadReceipt={handleDownloadReceipt}
          />
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
                <h2 className="text-2xl font-bold text-green-900 mb-2">Litige résolu avec succès !</h2>
                <p className="text-gray-600 mb-6">
                  Merci d'avoir utilisé notre service de médiation. Votre feedback nous aide à nous améliorer.
                </p>

                {disputeData && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold mb-2">Résumé du dossier</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Numéro de dossier:</span>
                        <span>{disputeData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Catégorie:</span>
                        <span>{disputeData.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Produit:</span>
                        <span>{disputeData.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant concerné:</span>
                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(disputeData.amount)}</span>
                      </div>
                      {resolutionResult && (
                        <div className="flex justify-between">
                          <span>Satisfaction:</span>
                          <span>{resolutionResult.overallRating}/5 étoiles</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Nouveau signalement
                  </Button>
                  <Button onClick={handleDownloadReceipt}>
                    Télécharger le certificat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Don't show step navigation for reporting, mediation, and resolution steps
  if (['reporting', 'mediation', 'resolution', 'completed'].includes(currentStep)) {
    return renderStepContent();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with Progress */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des litiges</h1>
              <p className="text-gray-600">Résolution rapide et équitable des différends</p>
            </div>
            <Badge className="bg-orange-100 text-orange-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Service activé
            </Badge>
          </div>

          {/* Step Navigation */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progression du traitement</span>
                <span>{Math.round(progress)}% complété</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      // Allow navigation to completed steps
                      if (stepStatus === 'completed') {
                        setCurrentStep(step.id as DisputeStep);
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

export default DisputeWorkflow;
