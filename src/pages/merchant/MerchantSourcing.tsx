import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerchantHeader } from '@/components/merchant/MerchantHeader';
import { MerchantSourcingService, type SupplierOffer } from '@/services/merchant/merchantSourcingService';
import { MerchantProcurementService } from '@/services/merchant/merchantProcurementService';
import { orderService, type GroupOrder } from '@/services/cooperative/orderService';
import { merchantCooperativeService } from '@/services/merchant/merchantCooperativeService';
import { formatCurrency } from '@/lib/utils';
import { Truck, ArrowDownUp, Filter, CheckCircle, Users, Package, Star } from 'lucide-react';

export default function MerchantSourcing() {
  const sourcing = useMemo(() => MerchantSourcingService.getInstance(), []);
  const procurement = useMemo(() => MerchantProcurementService.getInstance(), []);

  const [activeTab, setActiveTab] = useState<'suppliers' | 'cooperative'>('suppliers');
  
  // Fournisseurs classiques
  const [q, setQ] = useState('');
  const [maxDays, setMaxDays] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [sort, setSort] = useState<'price' | 'delivery' | 'rating'>('price');
  const [offers, setOffers] = useState<SupplierOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [poDate, setPoDate] = useState<string>(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [placing, setPlacing] = useState(false);

  // Offres coopératives
  const [groupOrders, setGroupOrders] = useState<GroupOrder[]>([]);
  const [cooperativeLoading, setCooperativeLoading] = useState(false);
  const [selectedGroupOrders, setSelectedGroupOrders] = useState<Record<string, boolean>>({});

  const fetchOffers = async () => {
    setLoading(true);
    const data = await sourcing.listOffers({
      productName: q || undefined,
      maxDays: maxDays ? Number(maxDays) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
    });
    setOffers(sortOffers(data, sort));
    setLoading(false);
  };

  const fetchGroupOrders = async () => {
    setCooperativeLoading(true);
    try {
      const allOrders = orderService.getAll();
      const activeOrders = allOrders.filter(order => order.status === 'active');
      setGroupOrders(activeOrders);
    } catch (error) {
      console.error('Error fetching group orders:', error);
    } finally {
      setCooperativeLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchOffers();
    } else {
      fetchGroupOrders();
    }
  }, [activeTab, q, maxDays, minRating]);

  const sortOffers = (data: SupplierOffer[], by: typeof sort) => {
    return [...data].sort((a, b) => {
      if (by === 'price') return a.unitPrice - b.unitPrice;
      if (by === 'delivery') return a.deliveryDays - b.deliveryDays;
      return b.rating - a.rating;
    });
  };

  const handleParticipateInGroupOrder = async (orderId: string) => {
    try {
      const groupOrder = groupOrders.find(order => order.id === orderId);
      if (!groupOrder) return;

      const merchantId = 'MERCHANT-001'; // À récupérer de l'authentification
      const maxQuantity = Math.min(10, groupOrder.maxQuantityPerParticipant); // Exemple: 10 units max par marchand
      
      await merchantCooperativeService.participateInGroupOrder(
        merchantId,
        orderId,
        maxQuantity,
        groupOrder.unitPrice
      );

      // Actualiser la liste des commandes groupées
      fetchGroupOrders();
    } catch (error) {
      console.error('Error participating in group order:', error);
    }
  };

  const calculateSavings = (unitPrice: number, groupOrder: GroupOrder) => {
    const estimatedNormalPrice = 1000; // Prix estimé normal
    return estimatedNormalPrice - unitPrice;
  };

  const placePO = async () => {
    const chosen = offers.filter(o => selected[o.id]);
    if (chosen.length === 0) return;
    setPlacing(true);
    try {
      const items = chosen.map(o => ({ name: o.productName, quantity: `${o.minQty}`, price: o.unitPrice * o.minQty }));
      const po = await procurement.createPurchaseOrder({ supplier: chosen[0].supplier, items, expectedDate: poDate });
      // Export PO summary
      const lines = [
        `Bon de commande ${po.id}`,
        `Fournisseur: ${po.client}`,
        `Date: ${po.date}  Livraison prévue: ${po.deliveryDate}`,
        '----------------------------------------',
        ...items.map(i => `${i.name} | Qté: ${i.quantity} | Total: ${formatCurrency(i.price)}`),
        `TOTAL: ${po.total}`,
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${po.id}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      // Also export HTML
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h2>Bon de commande ${po.id}</h2>
          <p><strong>Fournisseur:</strong> ${po.client}</p>
          <p><strong>Date:</strong> ${po.date} — <strong>Livraison prévue:</strong> ${po.deliveryDate}</p>
          <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr>
                <th style="border:1px solid #ddd; padding:6px; text-align:left;">Produit</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:left;">Quantité</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:left;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(i => `<tr><td style='border:1px solid #ddd;padding:6px;'>${i.name}</td><td style='border:1px solid #ddd;padding:6px;'>${i.quantity}</td><td style='border:1px solid #ddd;padding:6px;'>${formatCurrency(i.price)}</td></tr>`).join('')}
            </tbody>
          </table>
          <h3 style="margin-top: 10px;">TOTAL: ${po.total}</h3>
        </div>
      `;
      const blobHtml = new Blob([html], { type: 'text/html' });
      const urlHtml = URL.createObjectURL(blobHtml);
      const a2 = document.createElement('a');
      a2.href = urlHtml; a2.download = `${po.id}.html`; document.body.appendChild(a2); a2.click(); a2.remove(); URL.revokeObjectURL(urlHtml);
      setSelected({});
    } finally { setPlacing(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <MerchantHeader title="Système d'approvisionnement" showBackButton={true} backTo="/merchant/dashboard" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Comparateur d'offres et commandes groupées</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Trouvez des fournisseurs classiques ou rejoignez des commandes groupées coopératives pour des prix négociés.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'suppliers' | 'cooperative')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="suppliers" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Fournisseurs classiques
                </TabsTrigger>
                <TabsTrigger value="cooperative" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Commandes groupées
                </TabsTrigger>
              </TabsList>

              <TabsContent value="suppliers" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
                  <Input placeholder="Rechercher produit…" value={q} onChange={e => setQ(e.target.value)} />
                  <Input placeholder="Jours max" type="number" value={maxDays} onChange={e => setMaxDays(e.target.value)} />
                  <Input placeholder="Note min (1-5)" type="number" value={minRating} onChange={e => setMinRating(e.target.value)} />
                  <Select value={sort} onValueChange={(v: 'price' | 'delivery' | 'rating') => setSort(v)}>
                    <SelectTrigger><ArrowDownUp className="h-4 w-4 mr-1" /><SelectValue placeholder="Trier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Prix</SelectItem>
                      <SelectItem value="delivery">Délai</SelectItem>
                      <SelectItem value="rating">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={fetchOffers} variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filtrer</Button>
                </div>

                {loading ? (
                  <div role="status" aria-live="polite" className="py-6 text-center">Chargement…</div>
                ) : offers.length === 0 ? (
                  <Alert><AlertDescription>Aucune offre trouvée.</AlertDescription></Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap"></TableHead>
                          <TableHead className="whitespace-nowrap">Fournisseur</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Produit</TableHead>
                          <TableHead className="whitespace-nowrap">Qualité</TableHead>
                          <TableHead className="whitespace-nowrap">Prix</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Min Qté</TableHead>
                          <TableHead className="whitespace-nowrap">Délai</TableHead>
                          <TableHead className="whitespace-nowrap hidden lg:table-cell">Note</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offers.map(o => (
                          <TableRow key={o.id}>
                            <TableCell>
                              <input aria-label={`Sélectionner ${o.productName}`} type="checkbox" checked={!!selected[o.id]} onChange={e => setSelected(s => ({ ...s, [o.id]: e.target.checked }))} />
                            </TableCell>
                          <TableCell className="font-medium">{o.supplier}</TableCell>
                          <TableCell className="hidden sm:table-cell">{o.productName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{o.quality}</Badge>
                          </TableCell>
                          <TableCell className="text-green-600 font-semibold">{formatCurrency(o.unitPrice)}</TableCell>
                          <TableCell className="hidden md:table-cell">{o.minQty}</TableCell>
                          <TableCell>{o.deliveryDays} j</TableCell>
                          <TableCell className="hidden lg:table-cell">{o.rating.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Livraison prévue</span>
                    <Input type="date" className="w-48" value={poDate} onChange={e => setPoDate(e.target.value)} />
                  </div>
                  <Button onClick={placePO} disabled={placing || Object.values(selected).every(v => !v)} className="gap-2">
                    <CheckCircle className="h-4 w-4" /> {placing ? 'Création…' : 'Créer bon de commande'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="cooperative" className="space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Accédez à des marchandises à prix négociés grâce aux commandes groupées organisées par la coopérative.
                  </p>
                </div>

                {cooperativeLoading ? (
                  <div role="status" aria-live="polite" className="py-6 text-center">Chargement des commandes groupées…</div>
                ) : groupOrders.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      Aucune commande groupée disponible actuellement. Revenez plus tard ou consultez la section "Besoins d'approvisionnement" pour exprimer vos besoins.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {groupOrders.map(order => (
                      <Card key={order.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{order.product}</h3>
                              <p className="text-sm text-muted-foreground">{order.description}</p>
                            </div>
                            <Badge variant={order.currentParticipants >= order.targetParticipants ? "secondary" : "default"}>
                              {order.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  <strong>Quantité:</strong> {order.totalQuantity} {order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm">
                                  <strong>Prix négocié:</strong> {formatCurrency(order.unitPrice)}/{order.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-green-600" />
                                <span className="text-sm">
                                  <strong>Participants:</strong> {order.currentParticipants}/{order.targetParticipants}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-purple-600" />
                                <span className="text-sm">
                                  <strong>Livraison:</strong> {new Date(order.deliveryDate || '').toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="h-4 w-4 text-red-600 inline-block">💰</span>
                                <span className="text-sm">
                                  <strong>Économies estimées:</strong> {formatCurrency(calculateSavings(order.unitPrice, order))} par {order.unit}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium mb-2">Détails</h4>
                                <div className="text-sm space-y-1">
                                  <div><strong>Fournisseur:</strong> {order.supplier}</div>
                                  <div><strong>Catégorie:</strong> {order.category}</div>
                                  <div><strong>Conditions:</strong> {order.paymentTerms}</div>
                                  <div><strong>Livraison:</strong> {order.deliveryMethod}</div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium">Actions</h4>
                                <Button
                                  onClick={() => handleParticipateInGroupOrder(order.id)}
                                  disabled={order.currentParticipants >= order.targetParticipants}
                                  className="w-full"
                                >
                                  {order.currentParticipants >= order.targetParticipants ? 
                                    'Commande complète' : 
                                    `Participer à la commande (${order.currentParticipants}/${order.targetParticipants})`
                                  }
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => window.open(`/merchant/needs?orderId=${order.id}`, '_blank')}
                                >
                                  Voir correspondances
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
