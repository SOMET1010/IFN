import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarcodeScan, VoiceCommand } from '@/types/merchant';
import { MerchantBarcodeService } from '@/services/merchant/merchantBarcodeService';
import {
  Camera,
  Mic,
  CameraOff,
  MicOff,
  Scan,
  Volume2,
  CheckCircle,
  XCircle,
  Package,
  DollarSign
} from 'lucide-react';

interface BarcodeScannerProps {
  onProductScanned?: (product: Record<string, unknown>) => void;
  onVoiceCommand?: (command: VoiceCommand) => void;
}

export default function BarcodeScanner({ onProductScanned, onVoiceCommand }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastScan, setLastScan] = useState<BarcodeScan | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<VoiceCommand | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const barcodeService = MerchantBarcodeService.getInstance();

  const handleScanBarcode = async () => {
    setScanning(true);
    setError(null);
    setLastScan(null);
    setScannedProduct(null);

    try {
      const scanResult = await barcodeService.scanBarcode();
      setLastScan(scanResult);

      if (scanResult.isValid && scanResult.productId) {
        const product = await barcodeService.getProductByBarcode(scanResult.barcode);
        if (product) {
          setScannedProduct(product);
          onProductScanned?.(product);
        } else {
          setError('Produit non trouvé pour ce code-barres');
        }
      } else {
        setError('Échec du scan du code-barres');
      }
    } catch (err) {
      setError('Erreur lors du scan du code-barres');
      console.error('Error scanning barcode:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleVoiceCommand = async () => {
    setListening(true);
    setError(null);
    setLastVoiceCommand(null);

    try {
      const command = await barcodeService.startVoiceRecognition();
      setLastVoiceCommand(command);

      if (command.status === 'processed') {
        onVoiceCommand?.(command);
      } else {
        setError('Échec de la reconnaissance vocale');
      }
    } catch (err) {
      setError('Erreur lors de la reconnaissance vocale');
      console.error('Error with voice command:', err);
    } finally {
      setListening(false);
    }
  };

  const getIntentText = (intent: string) => {
    switch (intent) {
      case 'add_to_cart': return 'Ajouter au panier';
      case 'search_product': return 'Rechercher produit';
      case 'get_price': return 'Obtenir le prix';
      case 'select_payment': return 'Sélectionner paiement';
      case 'complete_sale': return 'Finaliser vente';
      default: return intent;
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'add_to_cart': return 'bg-green-500';
      case 'search_product': return 'bg-blue-500';
      case 'get_price': return 'bg-purple-500';
      case 'select_payment': return 'bg-orange-500';
      case 'complete_sale': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          Scan Codes-Barres & Saisie Vocale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={handleScanBarcode}
                disabled={scanning || listening}
                className="w-full h-20 flex flex-col items-center justify-center gap-2"
                variant={scanning ? "default" : "outline"}
              >
                {scanning ? (
                  <>
                    <CameraOff className="h-6 w-6 animate-pulse" />
                    <span>Scan en cours...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    <span>Scanner Code-Barres</span>
                  </>
                )}
              </Button>
            </div>

            {lastScan && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${lastScan.isValid ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-sm font-medium">Dernier scan:</span>
                </div>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                  {lastScan.barcode}
                </div>
                <div className="text-xs text-gray-500">
                  {lastScan.timestamp.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <Button
                onClick={handleVoiceCommand}
                disabled={scanning || listening}
                className="w-full h-20 flex flex-col items-center justify-center gap-2"
                variant={listening ? "default" : "outline"}
              >
                {listening ? (
                  <>
                    <MicOff className="h-6 w-6 animate-pulse" />
                    <span>Écoute en cours...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-6 w-6" />
                    <span>Commande Vocale</span>
                  </>
                )}
              </Button>
            </div>

            {lastVoiceCommand && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Dernière commande:</span>
                </div>
                <div className="text-sm italic">"{lastVoiceCommand.command}"</div>
                <div className="flex items-center gap-2">
                  <Badge className={getIntentColor(lastVoiceCommand.intent)}>
                    {getIntentText(lastVoiceCommand.intent)}
                  </Badge>
                  <Badge variant="outline">
                    {(lastVoiceCommand.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {lastVoiceCommand.timestamp.toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {scannedProduct && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Produit scanné avec succès!</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{scannedProduct.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{formatCurrency(scannedProduct.price)}/{scannedProduct.unit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Catégorie: </span>
                  <Badge variant="outline">{scannedProduct.category}</Badge>
                </div>
                <div>
                  <span className="text-gray-600">Stock: </span>
                  <span className="font-medium">{scannedProduct.stock} {scannedProduct.unit}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>💡 <strong>Astuce:</strong> Positionnez le code-barres devant la caméra pour un scan automatique</div>
          <div>🎤 <strong>Commandes vocales:</strong> "Ajouter [quantité] [produit]", "Prix de [produit]", "Payer en [méthode]"</div>
          <div>🌐 <strong>Langues supportées:</strong> Français, Baoulé, Dioula</div>
        </div>
      </CardContent>
    </Card>
  );
}
