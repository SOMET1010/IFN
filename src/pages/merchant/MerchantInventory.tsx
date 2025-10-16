import { useState, useMemo, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, AlertTriangle, Package, Edit, Trash2, Download, Search, Barcode } from 'lucide-react';
import { useMerchantInventory } from '@/services/merchant/merchantInventoryService';
import { InventoryForm } from '@/components/merchant/InventoryForm';
import type { MerchantInventory } from '@/services/merchant/merchantService';
import BarcodeScanner from '@/components/merchant/BarcodeScanner';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { InventoryStatus, InventoryStatusLabels, InventoryStatusVariants } from '@/types/merchant';
import { notifyLowStock } from '@/services/notification/notificationService';
import FloatingVoiceNavigator from '@/components/merchant/FloatingVoiceNavigator';

const MerchantInventory = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchantInventory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  const {
    inventory,
    lowStockItems,
    criticalStockItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    exportInventory
  } = useMerchantInventory();

  const getStatusBadge = useCallback((status: string) => {
    return (
      <Badge variant={InventoryStatusVariants[status as InventoryStatus] || 'default'}>
        {InventoryStatusLabels[status as InventoryStatus] || status}
      </Badge>
    );
  }, []);

  const getStockPercentage = useCallback((current: number, max: number) => {
    return Math.round((current / max) * 100);
  }, []);

  const filteredInventory = useMemo(() => {
    return inventory.data?.filter(item =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [inventory.data, searchTerm]);

  // Notify once when items become low/critical
  useMemo(() => {
    const low = (lowStockItems.data || []).map(i => ({ id: i.id, product: i.product, level: 'low' as const }));
    const crit = (criticalStockItems.data || []).map(i => ({ id: i.id, product: i.product, level: 'critical' as const }));
    if (low.length + crit.length > 0) {
      // fire and forget
      notifyLowStock([...crit, ...low]).catch(() => {});
    }
    return null;
  }, [lowStockItems.data, criticalStockItems.data]);

  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditItem = (item: MerchantInventory) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Omit<MerchantInventory, 'id'>) => {
    try {
      if (editingItem) {
        await updateInventoryItem.mutateAsync({ id: editingItem.id, item: data });
      } else {
        await addInventoryItem.mutateAsync(data);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await deleteInventoryItem.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportInventory.mutateAsync();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventory_export.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting inventory:', error);
    }
  };

  const handleProductScanned = (product: { id: string; name: string; barcode: string }) => {
    console.log('Product scanned:', product);
    // TODO: Implement stock update based on scanned product
  };

  return (
    <MerchantLayout
      title="Inventaire"
      showBackButton={true}
      backTo="/merchant/dashboard"
    >
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="inventory" className="gap-2">
                    <Package className="h-4 w-4" />
                    Inventaire
                  </TabsTrigger>
                  <TabsTrigger value="scanner" className="gap-2">
                    <Barcode className="h-4 w-4" />
                    Scan codes-barres
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="inventory" className="space-y-8">
                {/* Alert Cards */}
                {(criticalStockItems.data?.length || 0 > 0 || lowStockItems.data?.length || 0 > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(criticalStockItems.data?.length || 0) > 0 && (
                      <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-destructive/10 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                            <span className="font-medium text-destructive">
                              {criticalStockItems.data?.length} produit(s) en stock critique
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {(lowStockItems.data?.length || 0) > 0 && (
                      <Card className="border-orange-500/50 bg-orange-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                              <Package className="h-5 w-5 text-orange-500" />
                            </div>
                            <span className="font-medium text-orange-500">
                              {lowStockItems.data?.length} produit(s) en stock faible
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Header Section */}
                <div className="bg-muted/30 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">Inventaire</h2>
                      <p className="text-muted-foreground mt-1">Gérez vos produits et stocks</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Rechercher un produit..."
                          className="pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                        disabled={exportInventory.isPending}
                        aria-label="Exporter l'inventaire"
                        className="h-11 w-11"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ivoire" className="gap-2 h-11" onClick={handleAddItem}>
                        <Plus className="h-4 w-4" />
                        Ajouter Stock
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {inventory.isLoading && (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-muted-foreground">Chargement de l'inventaire...</p>
                    </div>
                  </div>
                )}

                {/* Inventory Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInventory.map((item) => (
                    <Card key={item.id} className="transition-all hover:shadow-lg border-border/60">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-semibold">{item.product}</CardTitle>
                          {getStatusBadge(item.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">
                            {item.currentStock} {item.unit}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            sur {item.maxStock} {item.unit} max
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Niveau de stock</span>
                            <span className="font-medium">{getStockPercentage(item.currentStock, item.maxStock)}%</span>
                          </div>
                          <Progress
                            value={getStockPercentage(item.currentStock, item.maxStock)}
                            className="h-2.5"
                          />
                        </div>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Emplacement</span>
                            <span className="font-medium bg-muted px-2 py-1 rounded">{item.location}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Expire le</span>
                            <span className="font-medium">{item.expiryDate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Prix</span>
                            <span className="font-semibold text-primary">{formatCurrency(item.price)}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="flex-1 h-9"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/5 h-9 w-9"
                            aria-label={`Supprimer l'article ${item.product}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Empty State */}
                {!inventory.isLoading && filteredInventory.length === 0 && (
                  <div className="text-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-muted/30 rounded-full">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          {searchTerm ? 'Aucun article ne correspond à votre recherche.' : 'Commencez par ajouter des articles à votre inventaire.'}
                        </p>
                        {!searchTerm && (
                          <Button onClick={handleAddItem} size="lg" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter votre premier article
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Dialog */}
                <Dialog open={showForm} onOpenChange={setShowForm}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
                      </DialogTitle>
                    </DialogHeader>
                    <InventoryForm
                      item={editingItem}
                      onSubmit={handleFormSubmit}
                      onCancel={() => {
                        setShowForm(false);
                        setEditingItem(null);
                      }}
                      isLoading={addInventoryItem.isPending || updateInventoryItem.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </TabsContent>

              <TabsContent value="scanner">
                <BarcodeScanner onProductScanned={handleProductScanned} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
    </MerchantLayout>
  );
};

export default MerchantInventory;
