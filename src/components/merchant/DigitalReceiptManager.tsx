import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DigitalReceipt, ReceiptTemplate } from '@/types/merchant';
import { MerchantReceiptService, ReceiptConfig } from '@/services/merchant/merchantReceiptService';
import {
  Receipt,
  Printer,
  Mail,
  MessageSquare,
  Download,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Smartphone
} from 'lucide-react';

interface DigitalReceiptManagerProps {
  saleData?: Record<string, unknown>;
  onReceiptGenerated?: (receipt: DigitalReceipt) => void;
}

export default function DigitalReceiptManager({ saleData, onReceiptGenerated }: DigitalReceiptManagerProps) {
  const [receipts, setReceipts] = useState<DigitalReceipt[]>([]);
  const [templates, setTemplates] = useState<ReceiptTemplate[]>([]);
  const [config, setConfig] = useState<ReceiptConfig | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [currentReceipt, setCurrentReceipt] = useState<DigitalReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const receiptService = MerchantReceiptService.getInstance();

  useEffect(() => {
    loadTemplates();
    loadConfig();
    loadHistory();
  }, []);

  const loadTemplates = async () => {
    try {
      const templateList = await receiptService.getReceiptTemplates();
      setTemplates(templateList);
    } catch (err) {
      setError('Erreur lors du chargement des templates');
    }
  };

  const loadConfig = async () => {
    try {
      const configData = await receiptService.getConfig();
      setConfig(configData);
      setSelectedTemplate(configData.templateId);
    } catch (err) {
      setError('Erreur lors du chargement de la configuration');
    }
  };

  const loadHistory = async () => {
    try {
      const list = await receiptService.getRecentReceipts(50);
      setReceipts(list);
    } catch (err) {
      // ignore
    }
  };

  const generateReceipt = async () => {
    if (!saleData) {
      setError('Aucune donnée de vente disponible');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const receipt = await receiptService.generateReceipt(saleData, selectedTemplate);
      setCurrentReceipt(receipt);
      setReceipts(prev => [receipt, ...prev]);
      onReceiptGenerated?.(receipt);
    } catch (err) {
      setError('Erreur lors de la génération du reçu');
    } finally {
      setLoading(false);
    }
  };

  const sendReceiptByEmail = async (receipt: DigitalReceipt) => {
    if (!receipt.clientInfo.email) {
      setError('Aucune adresse email disponible pour ce client');
      return;
    }

    try {
      const success = await receiptService.sendReceiptByEmail(receipt, receipt.clientInfo.email);
      if (success) {
        const updatedReceipt = { ...receipt, status: 'sent' as const };
        setCurrentReceipt(updatedReceipt);
        setReceipts(prev => prev.map(r => r.id === receipt.id ? updatedReceipt : r));
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du reçu par email');
    }
  };

  const sendReceiptBySMS = async (receipt: DigitalReceipt) => {
    try {
      const success = await receiptService.sendReceiptBySMS(receipt, receipt.clientInfo.phone);
      if (success) {
        const updatedReceipt = { ...receipt, status: 'sent' as const };
        setCurrentReceipt(updatedReceipt);
        setReceipts(prev => prev.map(r => r.id === receipt.id ? updatedReceipt : r));
      }
    } catch (err) {
      setError('Erreur lors de l\'envoi du reçu par SMS');
    }
  };

  const printReceipt = async (receipt: DigitalReceipt) => {
    try {
      const success = await receiptService.printReceipt(receipt);
      if (success) {
        const updatedReceipt = { ...receipt, status: 'printed' as const };
        setCurrentReceipt(updatedReceipt);
        setReceipts(prev => prev.map(r => r.id === receipt.id ? updatedReceipt : r));
      }
    } catch (err) {
      setError('Erreur lors de l\'impression du reçu');
    }
  };

  const downloadReceipt = async (receipt: DigitalReceipt, format: 'text' | 'html') => {
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'text') {
        content = await receiptService.formatReceiptAsText(receipt);
        filename = `recu_${receipt.receiptNumber}.txt`;
        mimeType = 'text/plain';
      } else {
        content = await receiptService.formatReceiptAsHTML(receipt);
        filename = `recu_${receipt.receiptNumber}.html`;
        mimeType = 'text/html';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du reçu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-500';
      case 'sent': return 'bg-green-500';
      case 'printed': return 'bg-purple-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated': return 'Généré';
      case 'sent': return 'Envoyé';
      case 'printed': return 'Imprimé';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Gestion des Reçus Numériques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate">Générer un reçu</TabsTrigger>
            <TabsTrigger value="history">Historique ({receipts.length})</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Template:</span>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={generateReceipt}
                disabled={loading || !saleData}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Générer le reçu
                  </>
                )}
              </Button>

              {currentReceipt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reçu généré avec succès!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Numéro:</span>
                        <span className="font-medium ml-2">{currentReceipt.receiptNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Statut:</span>
                        <Badge className={getStatusColor(currentReceipt.status)}>
                          {getStatusText(currentReceipt.status)}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Montant:</span>
                        <span className="font-medium ml-2">{formatCurrency(currentReceipt.total)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <span className="font-medium ml-2">{currentReceipt.clientInfo.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => sendReceiptByEmail(currentReceipt)}
                        disabled={!currentReceipt.clientInfo.email}
                        size="sm"
                        variant="outline"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer par email
                      </Button>
                      <Button
                        onClick={() => sendReceiptBySMS(currentReceipt)}
                        size="sm"
                        variant="outline"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Envoyer par SMS
                      </Button>
                      <Button
                        onClick={() => printReceipt(currentReceipt)}
                        size="sm"
                        variant="outline"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimer
                      </Button>
                      <Button
                        onClick={() => downloadReceipt(currentReceipt, 'text')}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger (TXT)
                      </Button>
                      <Button
                        onClick={() => downloadReceipt(currentReceipt, 'html')}
                        size="sm"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger (HTML)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {receipts.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Aucun reçu généré pour le moment.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {receipts.map(receipt => (
                  <div key={receipt.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{receipt.receiptNumber}</span>
                          <Badge className={getStatusColor(receipt.status)}>
                            {getStatusText(receipt.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {receipt.clientInfo.name} - {formatCurrency(receipt.total)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(receipt.transactionDate).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" aria-label={`Aperçu du reçu ${receipt.receiptNumber}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => printReceipt(receipt)}
                          size="sm"
                          variant="outline"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            {config && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Les paramètres de configuration des reçus seront disponibles prochainement.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
