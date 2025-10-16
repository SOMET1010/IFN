import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { Upload, X, AlertTriangle, FileText, Image, MessageSquare, CheckCircle } from 'lucide-react';

interface DisputeData {
  orderId: string;
  productName: string;
  sellerName: string;
  buyerName: string;
  amount: number;
}

interface DisputeReportingProps {
  disputeData: DisputeData;
  onDisputeSubmitted: (dispute: Record<string, unknown>) => void;
  onCancel: () => void;
}

const DisputeReporting = ({ disputeData, onDisputeSubmitted, onCancel }: DisputeReportingProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [disputeInfo, setDisputeInfo] = useState({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    resolutionRequested: '',
    urgency: 'medium',
    orderNumber: disputeData.orderId
  });

  const totalSteps = 4;

  const disputeCategories = [
    {
      id: 'product_quality',
      name: 'Qualité du produit',
      subcategories: ['Produit abîmé', 'Produit périmé', 'Ne correspond pas à la description', 'Contamination']
    },
    {
      id: 'delivery',
      name: 'Livraison',
      subcategories: ['Retard de livraison', 'Colis perdu', 'Livraison incomplète', 'Produit cassé pendant transport']
    },
    {
      id: 'payment',
      name: 'Paiement',
      subcategories: ['Double paiement', 'Remboursement non reçu', 'Frais supplémentaires', 'Problème de paiement']
    },
    {
      id: 'service',
      name: 'Service',
      subcategories: ['Mauvaise communication', 'Service client non disponible', 'Problème technique', 'Autre']
    }
  ];

  const urgencyLevels = [
    { id: 'low', name: 'Basse', color: 'bg-green-100 text-green-800', time: '72h' },
    { id: 'medium', name: 'Moyenne', color: 'bg-yellow-100 text-yellow-800', time: '48h' },
    { id: 'high', name: 'Haute', color: 'bg-orange-100 text-orange-800', time: '24h' },
    { id: 'critical', name: 'Critique', color: 'bg-red-100 text-red-800', time: '4h' }
  ];

  const resolutionOptions = [
    'Remboursement complet',
    'Remboursement partiel',
    'Échange du produit',
    'Bon d\'achat',
    'Réduction sur prochaine commande',
    'Autre'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files].slice(0, 10));
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const generateDisputeId = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `DSP-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const dispute = {
      id: generateDisputeId(),
      ...disputeInfo,
      files: uploadedFiles,
      status: 'submitted',
      submittedAt: new Date(),
      estimatedResolution: calculateEstimatedResolution(),
      ...disputeData
    };

    onDisputeSubmitted(dispute);
    setIsSubmitting(false);
  };

  const calculateEstimatedResolution = () => {
    const urgency = urgencyLevels.find(u => u.id === disputeInfo.urgency);
    return urgency ? urgency.time : '48h';
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepComplete = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return disputeInfo.category && disputeInfo.subcategory && disputeInfo.title;
      case 2:
        return disputeInfo.description && disputeInfo.urgency;
      case 3:
        return uploadedFiles.length > 0;
      case 4:
        return disputeInfo.resolutionRequested;
      default:
        return false;
    }
  };

  const getUrgencyBadge = (urgencyId: string) => {
    const urgency = urgencyLevels.find(u => u.id === urgencyId);
    return urgency ? (
      <Badge className={urgency.color}>
        {urgency.name} ({urgency.time})
      </Badge>
    ) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Signaler un litige</h1>
              <p className="text-gray-600">Commande #{disputeData.orderId}</p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold">{disputeData.productName}</div>
                <div className="text-sm text-gray-600">Produit concerné</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold">{disputeData.sellerName}</div>
                <div className="text-sm text-gray-600">Vendeur</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-bold">{formatCurrency(disputeData.amount)}</div>
                <div className="text-sm text-gray-600">Montant</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Étape {step} sur {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% complété</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Type de litige"}
                {step === 2 && "Description détaillée"}
                {step === 3 && "Pièces justificatives"}
                {step === 4 && "Résolution souhaitée"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Category Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie du litige *
                    </label>
                    <Select
                      value={disputeInfo.category}
                      onValueChange={(value) => setDisputeInfo(prev => ({ ...prev, category: value, subcategory: '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {disputeCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {disputeInfo.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sous-catégorie *
                      </label>
                      <Select
                        value={disputeInfo.subcategory}
                        onValueChange={(value) => setDisputeInfo(prev => ({ ...prev, subcategory: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une sous-catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {disputeCategories
                            .find(c => c.id === disputeInfo.category)
                            ?.subcategories.map(subcategory => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du litige *
                    </label>
                    <Input
                      value={disputeInfo.title}
                      onChange={(e) => setDisputeInfo(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Décrivez brièvement le problème"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Detailed Description */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description détaillée *
                    </label>
                    <Textarea
                      value={disputeInfo.description}
                      onChange={(e) => setDisputeInfo(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez en détail ce qui s'est passé..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Niveau d'urgence *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {urgencyLevels.map(urgency => (
                        <div
                          key={urgency.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            disputeInfo.urgency === urgency.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setDisputeInfo(prev => ({ ...prev, urgency: urgency.id }))}
                        >
                          <div className="font-medium text-sm">{urgency.name}</div>
                          <div className="text-xs text-gray-600">{urgency.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {disputeInfo.urgency && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Un litige {urgencyLevels.find(u => u.id === disputeInfo.urgency)?.name.toLowerCase()} sera traité sous{' '}
                        {calculateEstimatedResolution()}.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 3: Evidence Upload */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pièces justificatives *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="border rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              {file.type.startsWith('image/') ? (
                                <Image className="h-8 w-8 text-blue-500" />
                              ) : (
                                <FileText className="h-8 w-8 text-gray-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {uploadedFiles.length < 10 && (
                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Ajouter fichier</span>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {uploadedFiles.length}/10 fichiers ajoutés (Max: 10MB par fichier)
                    </p>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Les types de fichiers acceptés sont: images (JPG, PNG), PDF, Word et Excel.
                      Assurez-vous que les pièces jointes sont claires et pertinentes.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Resolution Request */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Résolution souhaitée *
                    </label>
                    <Select
                      value={disputeInfo.resolutionRequested}
                      onValueChange={(value) => setDisputeInfo(prev => ({ ...prev, resolutionRequested: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Que souhaitez-vous comme solution ?" />
                      </SelectTrigger>
                      <SelectContent>
                        {resolutionOptions.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Résumé du litige</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Catégorie:</span>
                        <span>{disputeCategories.find(c => c.id === disputeInfo.category)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sous-catégorie:</span>
                        <span>{disputeInfo.subcategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Urgence:</span>
                        {getUrgencyBadge(disputeInfo.urgency)}
                      </div>
                      <div className="flex justify-between">
                        <span>Résolution demandée:</span>
                        <span>{disputeInfo.resolutionRequested}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pièces jointes:</span>
                        <span>{uploadedFiles.length} fichier(s)</span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      Un numéro de dossier sera généré et vous pourrez suivre l'évolution de votre litige
                      depuis votre espace personnel.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Précédent
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 === step
                    ? 'bg-blue-600 text-white'
                    : i + 1 < step
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </div>
            ))}
          </div>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!isStepComplete(step)}
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepComplete(step) || isSubmitting}
            >
              {isSubmitting ? 'Soumission en cours...' : 'Soumettre le litige'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeReporting;
