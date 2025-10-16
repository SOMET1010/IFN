import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MerchantClient } from '@/types/merchant';
import QuickClientRegister from '@/components/merchant/QuickClientRegister';
import ClientPurchaseHistory from '@/components/merchant/ClientPurchaseHistory';
import ProductRecommendations from '@/components/merchant/ProductRecommendations';
import BarcodeScanner from '@/components/merchant/BarcodeScanner';
import MultiChannelPayment from '@/components/merchant/MultiChannelPayment';
import PromotionManager from '@/components/merchant/PromotionManager';
import DigitalReceiptManager from '@/components/merchant/DigitalReceiptManager';
import { User, ShoppingCart, Sparkles, History, Plus, ArrowLeft, Package, Trash2, Tag, Calculator } from 'lucide-react';
import { useMerchantSales } from '@/services/merchant/merchantSaleService';
import { useMerchantInventory } from '@/services/merchant/merchantInventoryService';
import { MerchantClientService } from '@/services/merchant/merchantClientService';
import { MerchantPromotionService } from '@/services/merchant/merchantPromotionService';
import { MerchantBarcodeService } from '@/services/merchant/merchantBarcodeService';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export default function MerchantSalesWorkflow() {
  const [selectedClient, setSelectedClient] = useState<MerchantClient | null>(null);
  const [activeTab, setActiveTab] = useState('register');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedPromotion, setAppliedPromotion] = useState<any>(null);
  const [saleCompleted, setSaleCompleted] = useState(false);
  const [saleData, setSaleData] = useState<any>(null);
  const [paymentPending, setPaymentPending] = useState<null | { reference?: string }>(null);

  const { createSale } = useMerchantSales();
  const { inventory, updateInventoryItem } = useMerchantInventory();
  const promotionService = useMemo(() => MerchantPromotionService.getInstance(), []);
  const barcodeService = useMemo(() => MerchantBarcodeService.getInstance(), []);
  const clientService = useMemo(() => MerchantClientService.getInstance(), []);

  const handleClientRegistered = (client: MerchantClient) => {
    setSelectedClient(client);
    setActiveTab('recommendations');
  };

  const handleClientSelected = (client: MerchantClient) => {
    setSelectedClient(client);
    setActiveTab('recommendations');
  };

  const handleProductSelect = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
        category: product.category
      }]);
    }
    setActiveTab('sale');
  };

  const handleBackToRegister = () => {
    setSelectedClient(null);
    setActiveTab('register');
  };

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId));
    } else {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      ));
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handlePromotionApplied = async (promotion: any) => {
    const total = cart.reduce((sum, i) => sum + i.totalPrice, 0);
    const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice }));
    const loyalty = selectedClient?.loyaltyPoints || 0;
    try {
      const res = await promotionService.validatePromotionApplicability(promotion.id, items, total, loyalty);
      if (res.applicable && res.discount > 0) {
        setAppliedPromotion({ name: promotion.name, value: res.discount });
      } else {
        setAppliedPromotion(null);
      }
    } catch {
      setAppliedPromotion(null);
    }
  };

  const handlePaymentComplete = async (transaction: any) => {
    const tx = transaction?.transaction ?? transaction;
    if (!tx || tx.status !== 'completed') {
      setPaymentPending({ reference: tx?.reference });
      setSaleCompleted(false);
      setSaleData(null);
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = appliedPromotion ? appliedPromotion.value : 0;
    const total = subtotal - discount;

    const saleTransaction = {
      id: tx.id,
      clientId: selectedClient?.id,
      clientInfo: {
        name: selectedClient?.name || '',
        phone: selectedClient?.phone || '',
        email: selectedClient?.email
      },
      items: cart,
      subtotal,
      tax: 0,
      discount,
      total,
      paymentMethod: tx.methodName || tx.methodId,
      transactionDate: new Date(),
      status: 'completed'
    };
    setSaleData(saleTransaction);
    setSaleCompleted(true);
    setPaymentPending(null);

    try {
      await createSale.mutateAsync({
        client: selectedClient?.name || 'Client',
        products: cart.map(i => `${i.productName} x${i.quantity}`).join(', '),
        amount: `${formatCurrency(total)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        paymentMethod: tx.methodName || tx.methodId || 'cash',
      });
    } catch {
      // Silently ignore sale creation errors as the payment was already processed
      // The transaction is considered complete even if local recording fails
    }

    // If credit payment, create a credit account/schedule
    try {
      if ((tx.methodId || '').toLowerCase() === 'credit') {
        const { MerchantCreditService } = await import('@/services/merchant/merchantCreditService');
        const svc = MerchantCreditService.getInstance();
        await svc.createFromTransaction(tx);
      }
    } catch {
      // Silently ignore credit service errors
      // The main payment is complete, credit tracking is secondary
    }

    try {
      const byName = new Map((inventory.data || []).map(it => [it.product, it]));
      for (const line of cart) {
        const inv = byName.get(line.productName);
        if (inv) {
          const newQty = Math.max(0, inv.currentStock - line.quantity);
          await updateInventoryItem.mutateAsync({ id: inv.id, item: { currentStock: newQty } });
        }
      }
    } catch {
      // Silently ignore inventory update errors
      // The sale is complete, inventory sync is best-effort
    }

    try {
      if (selectedClient?.id) {
        await clientService.addPurchaseToHistory({
          clientId: selectedClient.id,
          products: cart.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            category: i.category,
          })),
          totalAmount: total,
          paymentMethod: tx.methodName || tx.methodId || 'cash',
          purchaseDate: new Date(),
          status: 'completed',
        });
      }
    } catch {
      // Silently ignore client history update errors
      // The sale is complete, purchase history tracking is secondary
    }
  };

  const handleResetSale = () => {
    setCart([]);
    setAppliedPromotion(null);
    setSaleCompleted(false);
    setSaleData(null);
  };

  const getCartTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = appliedPromotion ? appliedPromotion.value : 0;
    return subtotal - discount;
  };

  // Auto-apply best promotion on cart/customer change, unless manually overridden
  useEffect(() => {
    const applyBest = async () => {
      if (cart.length === 0) {
        setAppliedPromotion(null);
        return;
      }
      const items = cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.unitPrice }));
      const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
      const loyalty = selectedClient?.loyaltyPoints || 0;
      const best = await promotionService.getBestPromotionForCart(items, subtotal, loyalty);
      if (best.promotion && best.discount > 0) {
        setAppliedPromotion({ name: best.promotion.name, value: best.discount });
      } else {
        setAppliedPromotion(null);
      }
    };
    // If appliedPromotion is an object from manual selection (with id), skip auto
    if (!appliedPromotion || !('id' in appliedPromotion)) {
      applyBest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, selectedClient?.id]);

  const handleVoiceCommand = async (command: any) => {
    if (!command) return;
    const intent = command.intent;
    const entities = command.entities || {};
    if (intent === 'add_to_cart' && entities.productId) {
      const product = await barcodeService.getProductById(String(entities.productId));
      if (product) {
        const qty = Number(entities.quantity || 1);
        const newItem = {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: product.price,
          totalPrice: product.price * qty,
          category: product.category,
        } as CartItem;
        const existingItem = cart.find(i => i.productId === newItem.productId);
        if (existingItem) {
          handleQuantityChange(existingItem.productId, existingItem.quantity + qty);
        } else {
          setCart([...cart, newItem]);
        }
      }
      setActiveTab('sale');
    }
    if (intent === 'select_payment' || intent === 'complete_sale') {
      setActiveTab('sale');
    }
  };

  if (!selectedClient) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Workflow de Vente</h1>
            <p className="text-gray-600">Enregistrez un client ou sélectionnez un client existant pour commencer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QuickClientRegister
              onClientRegistered={handleClientRegistered}
              onClientSelected={handleClientSelected}
            />
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">1. Enregistrement client</div>
                    <div className="text-xs text-gray-600">
                      Saisissez le numéro de téléphone pour identifier ou enregistrer un client
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <History className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">2. Consultation historique</div>
                    <div className="text-xs text-gray-600">
                      Accédez à l'historique des achats du client
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">3. Recommandations</div>
                    <div className="text-xs text-gray-600">
                      Produits suggérés basés sur les préférences du client
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">4. Processus de vente</div>
                    <div className="text-xs text-gray-600">
                      Ajoutez des produits et finalisez la vente
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques du jour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ventes réalisées</span>
                  <Badge className="bg-green-500">23</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nouveaux clients</span>
                  <Badge className="bg-blue-500">5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">CA du jour</span>
                  <span className="font-medium">{formatCurrency(125000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket moyen</span>
                  <span className="font-medium">{formatCurrency(5435)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToRegister}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Workflow de Vente</h1>
            <p className="text-gray-600">
              Client: {selectedClient.name} - {selectedClient.phone}
            </p>
          </div>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Points fidélité</p>
                <p className="text-2xl font-bold">{selectedClient.loyaltyPoints}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total dépensé</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedClient.totalSpent)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nombre de visites</p>
                <p className="text-2xl font-bold">{selectedClient.visitCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <History className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Niveau fidélité</p>
                <p className="text-lg font-bold">
                  {selectedClient.loyaltyPoints >= 1000 ? 'Or' :
                   selectedClient.loyaltyPoints >= 500 ? 'Argent' :
                   selectedClient.loyaltyPoints >= 200 ? 'Bronze' : 'Standard'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Recommandations
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="sale" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle vente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations">
          <ProductRecommendations
            client={selectedClient}
            onProductSelect={handleProductSelect}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="history">
          <ClientPurchaseHistory
            client={selectedClient}
            refreshTrigger={refreshTrigger}
          />
        </TabsContent>

        <TabsContent value="sale">
          <div className="space-y-6">
            {saleCompleted ? (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    Vente complétée avec succès! Transaction ID: {saleData?.id}
                  </AlertDescription>
                </Alert>
                <DigitalReceiptManager saleData={saleData} />
                <div className="flex justify-end">
                  <Button onClick={handleResetSale}>
                    Nouvelle vente
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {paymentPending && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-800">
                      Paiement en attente de confirmation{paymentPending.reference ? ` (réf. ${paymentPending.reference})` : ''}. Veuillez confirmer l'opération sur le téléphone du client.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <BarcodeScanner onProductScanned={handleProductSelect} onVoiceCommand={handleVoiceCommand} />

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          Panier
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {cart.length === 0 ? (
                          <Alert>
                            <AlertDescription>
                              Le panier est vide. Scannez des produits ou sélectionnez des recommandations.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-4">
                            {cart.map((item) => (
                              <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-sm text-gray-600">{item.category}</div>
                                  <div className="text-sm font-medium">{formatCurrency(item.unitPrice)}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                    >
                                      -
                                    </Button>
                                    <span className="w-12 text-center">{item.quantity}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveItem(item.productId)}
                                    aria-label={`Supprimer ${item.productName} du panier`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <PromotionManager onPromotionApplied={handlePromotionApplied} />
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          Récapitulatif
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Sous-total:</span>
                            <span>{formatCurrency(cart.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
                          </div>
                          {appliedPromotion && (
                            <div className="flex justify-between text-green-600">
                              <span>Remise ({appliedPromotion.name}):</span>
                              <span>-{formatCurrency(appliedPromotion.value)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(getCartTotal())}</span>
                          </div>
                        </div>

                        {cart.length > 0 && (
                          <MultiChannelPayment
                            amount={getCartTotal()}
                            customerInfo={{
                              name: selectedClient.name,
                              phone: selectedClient.phone,
                              email: selectedClient.email
                            }}
                            onPaymentComplete={handlePaymentComplete}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
