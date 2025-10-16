import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  CheckCircle,
  Download,
  FileText,
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  Scale,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface ResolutionData {
  disputeId: string;
  resolution: string;
  satisfaction: number;
  timestamp: Date;
  messages: Message[];
  amount: number;
  productName: string;
  sellerName: string;
  buyerName: string;
}

interface DisputeResolutionProps {
  resolutionData: ResolutionData;
  onResolutionComplete: (feedback: Record<string, unknown>) => void;
  onDownloadReceipt: () => void;
}

const DisputeResolution = ({ resolutionData, onResolutionComplete, onDownloadReceipt }: DisputeResolutionProps) => {
  const [feedback, setFeedback] = useState({
    overallRating: 0,
    processRating: 0,
    fairnessRating: 0,
    communicationRating: 0,
    comments: '',
    wouldRecommend: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [implementationProgress, setImplementationProgress] = useState(0);

  useEffect(() => {
    // Simulate implementation progress
    if (resolutionData.resolution.includes('Remboursement')) {
      const interval = setInterval(() => {
        setImplementationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [resolutionData.resolution]);

  const handleRatingChange = (type: keyof typeof feedback, value: number) => {
    setFeedback(prev => ({ ...prev, [type]: value }));
  };

  const submitFeedback = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    const completeFeedback = {
      ...feedback,
      timestamp: new Date(),
      disputeId: resolutionData.disputeId
    };

    onResolutionComplete(completeFeedback);
    setIsSubmitting(false);
  };

  const downloadAgreement = () => {
    // Generate PDF content
    const agreementContent = `
ACCORD DE RÉSOLUTION DE LITIGE
=====================================

Numéro de dossier: ${resolutionData.disputeId}
Date: ${new Date().toLocaleDateString('fr-FR')}

PARTIES CONCERNÉES:
- Acheteur: ${resolutionData.buyerName}
- Vendeur: ${resolutionData.sellerName}

PRODUIT CONCERNÉ:
${resolutionData.productName}

RÉSOLUTION ADOPTÉE:
${resolutionData.resolution}

MONTANT CONCERNÉ:
${formatCurrency(resolutionData.amount)}

SATISFACTION DE LA MÉDIATION:
${resolutionData.satisfaction}%

DATE DE RÉSOLUTION:
${resolutionData.timestamp.toLocaleDateString('fr-FR')}

Signatures électroniques validées par AgriMarket CI
    `;

    const blob = new Blob([agreementContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accord-resolution-${resolutionData.disputeId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getResolutionStatus = () => {
    if (resolutionData.resolution.includes('Remboursement')) {
      return {
        type: 'refund',
        status: implementationProgress === 100 ? 'completed' : 'processing',
        color: implementationProgress === 100 ? 'green' : 'orange',
        text: implementationProgress === 100 ? 'Remboursé' : 'En cours de remboursement'
      };
    } else if (resolutionData.resolution.includes('Échange')) {
      return {
        type: 'exchange',
        status: 'pending',
        color: 'blue',
        text: 'En attente d\'échange'
      };
    } else {
      return {
        type: 'other',
        status: 'completed',
        color: 'green',
        text: 'Résolu'
      };
    }
  };

  const resolutionStatus = getResolutionStatus();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-green-900">Litige résolu !</h1>
              <p className="text-gray-600">Dossier #{resolutionData.disputeId}</p>
            </div>
            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Résolu
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{resolutionData.resolution}</div>
                <div className="text-sm text-gray-600">Solution adoptée</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{resolutionData.satisfaction}%</div>
                <div className="text-sm text-gray-600">Satisfaction</div>
                <Progress value={resolutionData.satisfaction} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{resolutionData.messages.length}</div>
                <div className="text-sm text-gray-600">Messages échangés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Badge className={`bg-${resolutionStatus.color}-100 text-${resolutionStatus.color}-800`}>
                  {resolutionStatus.text}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Statut</div>
                {resolutionStatus.type === 'refund' && resolutionStatus.status === 'processing' && (
                  <Progress value={implementationProgress} className="mt-2 h-2" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resolution Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  Résumé de la résolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Résolution adoptée</h4>
                  <p className="text-green-800">{resolutionData.resolution}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Date de résolution</div>
                    <div className="font-medium">
                      {resolutionData.timestamp.toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600">Durée de médiation</div>
                    <div className="font-medium">
                      {Math.floor((resolutionData.timestamp.getTime() - new Date().getTime()) / (1000 * 60 * 60))}h
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Dialog open={showAgreement} onOpenChange={setShowAgreement}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Voir l'accord
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Accord de résolution - Dossier #{resolutionData.disputeId}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="prose max-w-none">
                          <h3>Parties concernées</h3>
                          <p><strong>Acheteur:</strong> {resolutionData.buyerName}</p>
                          <p><strong>Vendeur:</strong> {resolutionData.sellerName}</p>

                          <h3>Produit concerné</h3>
                          <p>{resolutionData.productName}</p>

                          <h3>Contexte du litige</h3>
                          <p>Les parties se sont mises d'accord pour résoudre leur différend par le biais de la médiation IA d'AgriMarket.</p>

                          <h3>Termes de l'accord</h3>
                          <p>{resolutionData.resolution}</p>

                          <h3>Engagements</h3>
                          <ul>
                            <li>Les deux parties s'engagent à respecter les termes de cet accord</li>
                            <li>La solution sera mise en œuvre dans les plus brefs délais</li>
                            <li>Toute communication future sera basée sur le respect mutuel</li>
                          </ul>

                          <h3>Signatures électroniques</h3>
                          <p>Cet accord est généré et signé électroniquement via la plateforme AgriMarket CI.</p>
                          <p>Date: {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>

                        <div className="flex space-x-3">
                          <Button onClick={downloadAgreement}>
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger l'accord
                          </Button>
                          <Button variant="outline" onClick={() => setShowAgreement(false)}>
                            Fermer
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={downloadAgreement} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Implementation Status */}
            {resolutionStatus.type === 'refund' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Statut d'implémentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progression du remboursement</span>
                      <span className="text-sm text-gray-600">{implementationProgress}%</span>
                    </div>
                    <Progress value={implementationProgress} className="h-3" />

                    {implementationProgress === 100 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Le remboursement a été effectué avec succès sur votre moyen de paiement.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feedback Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Votre feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm text-gray-600">
                  Votre avis nous aide à améliorer notre service de médiation.
                </div>

                {/* Rating Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Évaluation globale du processus
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= feedback.overallRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onClick={() => handleRatingChange('overallRating', star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Qualité du processus
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= feedback.processRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onClick={() => handleRatingChange('processRating', star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Équité de la résolution
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= feedback.fairnessRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onClick={() => handleRatingChange('fairnessRating', star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Communication avec l'assistant IA
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= feedback.communicationRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                          onClick={() => handleRatingChange('communicationRating', star)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires supplémentaires
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    placeholder="Partagez votre expérience ou suggestions..."
                    value={feedback.comments}
                    onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  />
                </div>

                {/* Recommendation */}
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={feedback.wouldRecommend}
                      onChange={(e) => setFeedback(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                    />
                    <span className="text-sm">Je recommanderais ce service de médiation</span>
                  </label>
                </div>

                <Button
                  onClick={submitFeedback}
                  disabled={isSubmitting || feedback.overallRating === 0}
                  className="w-full"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Soumettre le feedback'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-xs font-medium">Litige signalé</div>
                      <div className="text-xs text-gray-600">Il y a 2 jours</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-xs font-medium">Médiation IA initiée</div>
                      <div className="text-xs text-gray-600">Il y a 1 jour</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-xs font-medium">Solution proposée</div>
                      <div className="text-xs text-gray-600">Il y a 12h</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="text-xs font-medium">Accord trouvé</div>
                      <div className="text-xs text-gray-600">Il y a 1h</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={onDownloadReceipt}>
                  <Download className="h-3 w-3 mr-2" />
                  Reçu officiel
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={downloadAgreement}>
                  <FileText className="h-3 w-3 mr-2" />
                  Accord complet
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-3 w-3 mr-2" />
                  Contacter support
                </Button>
              </CardContent>
            </Card>

            {/* Satisfaction Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Satisfaction globale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {resolutionData.satisfaction}%
                  </div>
                  <Progress value={resolutionData.satisfaction} className="h-3 mb-3" />
                  <div className="flex justify-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Processus réussi</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Prochaines étapes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    <span>Soumettre votre feedback</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                    <span>Télécharger les documents</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-gray-400 mr-2" />
                    <span>Vérifier l'implémentation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-gray-400 mr-2" />
                    <span>Notifier l'autre partie</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolution;
