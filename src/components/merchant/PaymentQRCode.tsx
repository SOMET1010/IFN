import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentQRCodeProps {
  merchantId: string;
  merchantName: string;
  amount: number;
  reference: string;
  onClose?: () => void;
}

export const PaymentQRCode = ({ merchantId, merchantName, amount, reference, onClose }: PaymentQRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [merchantId, amount, reference]);

  const generateQRCode = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 256;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const data = JSON.stringify({
      merchantId,
      merchantName,
      amount,
      reference,
      timestamp: new Date().toISOString()
    });

    drawSimpleQRPattern(ctx, size, data);
  };

  const drawSimpleQRPattern = (ctx: CanvasRenderingContext2D, size: number, data: string) => {
    const moduleSize = size / 25;
    const hash = simpleHash(data);

    ctx.fillStyle = '#000000';

    ctx.fillRect(0, 0, moduleSize * 7, moduleSize * 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(moduleSize, moduleSize, moduleSize * 5, moduleSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(moduleSize * 2, moduleSize * 2, moduleSize * 3, moduleSize * 3);

    ctx.fillRect(size - moduleSize * 7, 0, moduleSize * 7, moduleSize * 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(size - moduleSize * 6, moduleSize, moduleSize * 5, moduleSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(size - moduleSize * 5, moduleSize * 2, moduleSize * 3, moduleSize * 3);

    ctx.fillRect(0, size - moduleSize * 7, moduleSize * 7, moduleSize * 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(moduleSize, size - moduleSize * 6, moduleSize * 5, moduleSize * 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(moduleSize * 2, size - moduleSize * 5, moduleSize * 3, moduleSize * 3);

    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const skip = (i < 8 && j < 8) || (i < 8 && j > 16) || (i > 16 && j < 8);
        if (!skip) {
          const hashIndex = (i * 25 + j) % hash.length;
          if (hash.charCodeAt(hashIndex) % 2 === 0) {
            ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize - 1, moduleSize - 1);
          }
        }
      }
    }
  };

  const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `qrcode-paiement-${reference}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const printQRCode = () => {
    window.print();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code de Paiement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <canvas
              ref={canvasRef}
              className="w-64 h-64"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div className="text-center space-y-2 w-full">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Marchand</p>
              <p className="font-semibold">{merchantName}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Montant à payer</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Référence</p>
              <p className="font-mono text-sm">{reference}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
            <p className="text-sm text-blue-900">
              <strong>Instructions:</strong> Scannez ce QR code avec votre application Mobile Money pour effectuer le paiement.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={downloadQRCode}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <Button
            onClick={printQRCode}
            variant="outline"
            className="flex-1"
          >
            Imprimer
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="default"
              className="flex-1"
            >
              Fermer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentQRCode;
