import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, CheckCircle, AlertTriangle, Download, Camera } from 'lucide-react';
import { useMerchantOrders } from '@/services/merchant/merchantOrderService';
import { useMerchantInventory } from '@/services/merchant/merchantInventoryService';
import { MerchantHeader } from '@/components/merchant/MerchantHeader';
import { formatCurrency } from '@/lib/utils';

export default function MerchantReceiving() {
  const { orders, updateOrderStatus } = useMerchantOrders();
  const { inventory, updateInventoryItem } = useMerchantInventory();

  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [qcNotes, setQcNotes] = useState('');
  const [qcChecks, setQcChecks] = useState({ quality: true, packaging: true, freshness: true });
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmedOrders = useMemo(() => (orders.data || []).filter(o => o.status === 'confirmed'), [orders.data]);
  const deliveredOrders = useMemo(() => (orders.data || []).filter(o => o.status === 'delivered'), [orders.data]);

  const openReceive = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = (orders.data || []).find(o => o.id === orderId);
    const defaults: Record<string, number> = {};
    order?.products.forEach(p => {
      const qty = parseFloat(String(p.quantity).toString().replace(/[^0-9.]/g, '')) || 0;
      defaults[p.name] = qty;
    });
    setReceivedQuantities(defaults);
    setQcNotes('');
    setQcChecks({ quality: true, packaging: true, freshness: true });
    setPhotos([]);
  };

  const closeReceive = () => {
    setSelectedOrderId(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
  };

  const generateLabels = (orderId: string) => {
    const order = (orders.data || []).find(o => o.id === orderId);
    if (!order) return;
    const lines: string[] = [];
    lines.push(`Etiquettes - Réception ${order.id}`);
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push('----------------------------------------');
    order.products.forEach(p => {
      const qty = receivedQuantities[p.name] ?? p.quantity;
      lines.push(`${p.name} | Qté: ${qty} | Prix: ${formatCurrency(p.price)}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiquettes_${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const receiveOrder = async () => {
    if (!selectedOrderId) return;
    const order = (orders.data || []).find(o => o.id === selectedOrderId);
    if (!order) return;
    setIsProcessing(true);
    try {
      // Update stock by matching product name in inventory
      const byName = new Map((inventory.data || []).map(it => [it.product, it]));
      for (const p of order.products) {
        const inv = byName.get(p.name);
        const inc = Number(receivedQuantities[p.name] ?? 0) || 0;
        if (inv && inc > 0) {
          await updateInventoryItem.mutateAsync({ id: inv.id, item: { currentStock: inv.currentStock + inc } });
        }
      }
      // Mark order as delivered
      await updateOrderStatus.mutateAsync({ id: order.id, status: 'delivered' });
      closeReceive();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MerchantHeader title="Réception & Qualité" showBackButton={true} backTo="/merchant/dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Livraisons en attente</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.isLoading ? (
                  <div role="status" aria-live="polite" className="py-6 text-center">Chargement…</div>
                ) : confirmedOrders.length === 0 ? (
                  <Alert>
                    <AlertDescription>Aucune livraison confirmée à réceptionner.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Commande</TableHead>
                          <TableHead className="whitespace-nowrap">Client</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Produits</TableHead>
                          <TableHead className="whitespace-nowrap">Total</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Date</TableHead>
                          <TableHead className="whitespace-nowrap">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {confirmedOrders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.client}</TableCell>
                            <TableCell className="hidden sm:table-cell">{order.products.map(p => `${p.name}(${p.quantity})`).join(', ')}</TableCell>
                            <TableCell className="text-green-600 font-semibold">{order.total}</TableCell>
                            <TableCell className="hidden md:table-cell">{order.deliveryDate}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => openReceive(order.id)} className="gap-2">
                                  <CheckCircle className="h-4 w-4" /> Réceptionner
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => generateLabels(order.id)} className="gap-2">
                                  <Download className="h-4 w-4" /> Etiquettes
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Livraisons reçues</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveredOrders.length === 0 ? (
                  <Alert>
                    <AlertDescription>Aucune réception enregistrée.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Commande</TableHead>
                          <TableHead className="whitespace-nowrap">Client</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Produits</TableHead>
                          <TableHead className="whitespace-nowrap">Total</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Date</TableHead>
                          <TableHead className="whitespace-nowrap">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveredOrders.map(order => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.client}</TableCell>
                            <TableCell className="hidden sm:table-cell">{order.products.map(p => `${p.name}(${p.quantity})`).join(', ')}</TableCell>
                            <TableCell className="text-green-600 font-semibold">{order.total}</TableCell>
                            <TableCell className="hidden md:table-cell">{order.deliveryDate}</TableCell>
                            <TableCell><Badge variant="secondary">Réceptionné</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!selectedOrderId} onOpenChange={(o) => !o && closeReceive()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contrôle qualité & réception</DialogTitle>
            <DialogDescription>
              Vérifiez la qualité et saisissez les quantités réellement reçues avant de valider.
            </DialogDescription>
          </DialogHeader>
          {selectedOrderId && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={qcChecks.quality} onChange={e => setQcChecks(v => ({ ...v, quality: e.target.checked }))} />
                  Qualité conforme
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={qcChecks.packaging} onChange={e => setQcChecks(v => ({ ...v, packaging: e.target.checked }))} />
                  Emballage intact
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={qcChecks.freshness} onChange={e => setQcChecks(v => ({ ...v, freshness: e.target.checked }))} />
                  Fraîcheur vérifiée
                </label>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Quantités reçues</div>
                <div className="space-y-2">
                  {(orders.data || []).find(o => o.id === selectedOrderId)?.products.map(p => (
                    <div key={p.name} className="flex items-center gap-3">
                      <div className="w-48 text-sm">{p.name}</div>
                      <Input
                        className="w-32"
                        type="number"
                        value={receivedQuantities[p.name] ?? ''}
                        onChange={e => setReceivedQuantities({ ...receivedQuantities, [p.name]: Number(e.target.value) })}
                        placeholder={String(p.quantity)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Photos (optionnel)</div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <Camera className="h-4 w-4" />
                  Joindre des photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
                </label>
                {photos.length > 0 && (
                  <div className="text-xs text-muted-foreground">{photos.length} fichier(s) sélectionné(s)</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Remarques</div>
                <Input value={qcNotes} onChange={e => setQcNotes(e.target.value)} placeholder="Observations…" />
              </div>

              {(!qcChecks.quality || !qcChecks.packaging || !qcChecks.freshness) && (
                <Alert>
                  <AlertDescription>
                    <AlertTriangle className="inline h-4 w-4 mr-1 text-orange-600" />
                    Une ou plusieurs vérifications ont échoué. Corrigez avant validation ou poursuivez avec réserve.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeReceive}>Annuler</Button>
                <Button onClick={receiveOrder} disabled={isProcessing} className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {isProcessing ? 'Traitement…' : 'Valider la réception'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
