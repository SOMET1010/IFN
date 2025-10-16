import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TrendingUp, DollarSign, Package, Plus, Edit, Trash2 } from 'lucide-react';
import { ProducerSale } from '@/types';
import { producerSaleService } from '@/services/producer/producerSaleService';
import { SaleForm } from '@/components/producer/SaleForm';
import ProducerLayout from '@/components/producer/ProducerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const ProducerSales = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<ProducerSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<ProducerSale | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<ProducerSale | null>(null);
  const [salesStats, setSalesStats] = useState<{
    totalRevenue: number;
    totalQuantity: number;
    monthlyRevenue: number;
  }>({ totalRevenue: 0, totalQuantity: 0, monthlyRevenue: 0 });

  useEffect(() => {
    if (user?.id) {
      // Initialiser d'abord les données de démo, puis charger
      producerSaleService.initializeDemoData(user.id);
      loadSales();
    }
  }, [user?.id]);

  const loadSales = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [salesResponse, statsResponse] = await Promise.all([
        producerSaleService.getSalesByProducer(user.id),
        producerSaleService.getSaleStats(user.id),
      ]);

      if (salesResponse.success && salesResponse.data) {
        // Trier par date du plus récent au plus ancien
        const sortedSales = salesResponse.data.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setSales(sortedSales);
      }

      if (statsResponse.success && statsResponse.data) {
        const currentMonth = new Date().toISOString().substring(0, 7);
        const monthlyRevenue = statsResponse.data.byMonth[currentMonth]?.revenue || 0;

        setSalesStats({
          totalRevenue: statsResponse.data.totalRevenue,
          totalQuantity: statsResponse.data.totalQuantity,
          monthlyRevenue,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = () => {
    setSelectedSale(null);
    setShowForm(true);
  };

  const handleEditSale = (sale: ProducerSale) => {
    setSelectedSale(sale);
    setShowForm(true);
  };

  const handleDeleteSale = (sale: ProducerSale) => {
    setSaleToDelete(sale);
    setShowDeleteDialog(true);
  };

  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!saleToDelete) return;

    try {
      const response = await producerSaleService.delete(saleToDelete.id);
      if (response.success) {
        await loadSales();
        toast({ title: 'Vente supprimée', description: `Vente de "${saleToDelete.product}" supprimée.` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Erreur lors de la suppression', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setShowDeleteDialog(false);
      setSaleToDelete(null);
    }
  };

  const getStatusBadge = (status: ProducerSale['status']) => {
    const variants = {
      completed: "default",
      pending: "outline",
      cancelled: "destructive",
      failed: "destructive"
    } as const;

    const labels = {
      completed: "Terminée",
      pending: "En attente",
      cancelled: "Annulée",
      failed: "Échouée"
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus?: ProducerSale['payment_status']) => {
    if (!paymentStatus) return null;
    const variants = {
      paid: "default",
      pending: "outline",
      failed: "destructive"
    } as const;

    const labels = {
      paid: "Payé",
      pending: "En attente",
      failed: "Échoué"
    };

    return <Badge variant={variants[paymentStatus]} className="ml-2">{labels[paymentStatus]}</Badge>;
  };

  

  if (loading) {
    return (
      <ProducerLayout title="Ventes" showBackButton={true} backTo="/producer/dashboard">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            {/* Skeleton stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 sm:p-6 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            {/* Skeleton list */}
            <div className="p-4 border rounded-lg">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 border-b last:border-b-0">
                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-4 items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-14" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </ProducerLayout>
    );
  }

  return (
    <ProducerLayout title="Ventes" showBackButton={true} backTo="/producer/dashboard">

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Revenus totaux</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</p>
                  <p className="text-xs text-green-600">+12%</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Quantité vendue</p>
                  <p className="text-lg sm:text-2xl font-bold">{salesStats.totalQuantity.toLocaleString()} kg</p>
                  <p className="text-xs text-green-600">+8%</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Ce mois</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(salesStats.monthlyRevenue)}</p>
                  <p className="text-xs text-green-600">+15%</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Historique des ventes</h2>
          <SaleForm
            producerId={user?.id || ''}
            onSuccess={loadSales}
            isOpen={showForm}
            onOpenChange={setShowForm}
            sale={selectedSale || undefined}
          />
        </div>

        {sales.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune vente</h3>
              <p className="text-muted-foreground text-center mb-4">
                Vous n'avez pas encore enregistré de vente. Commencez par ajouter votre première vente.
              </p>
              <Button onClick={handleCreateSale}>
                <Plus className="h-4 w-4 mr-2" />
                Enregistrer ma première vente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Liste des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Desktop Header */}
                <div className="hidden sm:grid grid-cols-6 gap-2 md:gap-4 text-sm font-medium text-muted-foreground">
                  <span className="truncate">PRODUIT</span>
                  <span className="truncate">QUANTITÉ</span>
                  <span className="truncate">PRIX TOTAL</span>
                  <span className="truncate">ACHETEUR</span>
                  <span className="truncate">DATE</span>
                  <span className="truncate">STATUT</span>
                </div>
                {sales.map((sale, index) => (
                  <div
                    key={sale.id}
                    className="grid grid-cols-1 sm:grid-cols-6 gap-2 sm:gap-4 text-sm py-2 sm:py-3 border-b hover:bg-muted/50 rounded-md p-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-primary/20 animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="font-medium text-xs sm:text-sm">{sale.product}</div>
                    <div className="text-xs sm:text-sm">{sale.quantity} {sale.unit}</div>
                    <div className="font-semibold text-green-600 text-xs sm:text-sm">{formatCurrency(sale.total_price)}</div>
                    <div className="min-w-0">
                      <div className="truncate text-xs sm:text-sm">{sale.buyer}</div>
                      {sale.buyer_contact && (
                        <div className="text-xs text-muted-foreground truncate">{sale.buyer_contact}</div>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm">{formatDate(sale.date)}</div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(sale.status)}
                      {getPaymentStatusBadge(sale.payment_status)}
                      <div className="flex gap-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary hover:rotate-12"
                          title="Modifier"
                          aria-label="Modifier la vente"
                          onClick={() => handleEditSale(sale)}
                        >
                          <Edit className="h-3 w-3 transition-transform duration-200" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 sm:h-6 sm:w-6 text-destructive transition-all duration-200 hover:scale-110 hover:bg-destructive/10 hover:rotate-12"
                          title="Supprimer"
                          aria-label="Supprimer la vente"
                          onClick={() => handleDeleteSale(sale)}
                        >
                          <Trash2 className="h-3 w-3 transition-transform duration-200" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la vente de "{saleToDelete?.product}" à "{saleToDelete?.buyer}" pour {formatCurrency(saleToDelete?.total_price || 0)} ?
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
        </main>
        <FloatingVoiceNavigator />
    </ProducerLayout>
  );
};

export default ProducerSales;
