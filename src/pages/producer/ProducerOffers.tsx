import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Eye, Trash2, Calendar, Package, MapPin } from 'lucide-react';
import { ProducerOffer } from '@/types';
import { producerOfferService } from '@/services/producer/producerOfferService';
import { OfferForm } from '@/components/producer/OfferForm';
import ProducerLayout from '@/components/producer/ProducerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const ProducerOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<ProducerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<ProducerOffer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<ProducerOffer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [offerDetails, setOfferDetails] = useState<ProducerOffer | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Initialiser d'abord les données de démo, puis charger
      producerOfferService.initializeDemoData(user.id, user.name || 'Producteur');
      loadOffers();
    }
  }, [user?.id]);

  const loadOffers = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await producerOfferService.getOffersByProducer(user.id);
      if (response.success && response.data) {
        const sorted = [...response.data].sort((a, b) =>
          new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        );
        setOffers(sorted);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = () => {
    setSelectedOffer(null);
    setShowForm(true);
  };

  const handleEditOffer = (offer: ProducerOffer) => {
    setSelectedOffer(offer);
    setShowForm(true);
  };

  const handleDeleteOffer = (offer: ProducerOffer) => {
    setOfferToDelete(offer);
    setShowDeleteDialog(true);
  };

  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!offerToDelete) return;

    try {
      const response = await producerOfferService.delete(offerToDelete.id);
      if (response.success) {
        await loadOffers();
        toast({ title: 'Offre supprimée', description: `"${offerToDelete.product}" a été supprimée.` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Erreur lors de la suppression', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setShowDeleteDialog(false);
      setOfferToDelete(null);
    }
  };

  const getStatusBadge = (status: ProducerOffer['status']) => {
    const variants = {
      en_cours: "default",
      terminee: "secondary",
      en_attente: "outline",
      annulee: "destructive"
    } as const;

    const labels = {
      en_cours: "En cours",
      terminee: "Terminée",
      en_attente: "En attente",
      annulee: "Annulée"
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getQualityBadge = (quality?: ProducerOffer['quality']) => {
    if (!quality) return null;
    const variants = {
      Premium: "default",
      Standard: "secondary",
      Bio: "outline"
    } as const;
    return <Badge variant={variants[quality]} className="ml-2">{quality}</Badge>;
  };

  if (loading) {
    return (
      <ProducerLayout title="Offres de produits" showBackButton={true} backTo="/producer/dashboard">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </ProducerLayout>
    );
  }

  return (
    <ProducerLayout title="Offres de produits" showBackButton={true} backTo="/producer/dashboard">

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Offres de produits</h2>
          <OfferForm
            producerId={user?.id || ''}
            producerName={user?.name || 'Producteur'}
            onSuccess={loadOffers}
            isOpen={showForm}
            onOpenChange={setShowForm}
            offer={selectedOffer || undefined}
          />
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune offre</h3>
              <p className="text-muted-foreground text-center mb-4">
                Vous n'avez pas encore créé d'offre. Commencez par ajouter votre première offre.
              </p>
              <Button onClick={handleCreateOffer}>
                <Plus className="h-4 w-4 mr-2" />
                Créer ma première offre
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1 pr-2">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span className="truncate">{offer.product}</span>
                        {getStatusBadge(offer.status)}
                        {getQualityBadge(offer.quality)}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {offer.description}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Voir les détails"
                        aria-label="Voir les détails de l'offre"
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        onClick={() => { setOfferDetails(offer); setShowDetails(true); }}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Modifier"
                        aria-label="Modifier l'offre"
                        onClick={() => handleEditOffer(offer)}
                        className="h-6 w-6 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-6 w-6 sm:h-8 sm:w-8"
                        title="Supprimer"
                        aria-label="Supprimer l'offre"
                        onClick={() => handleDeleteOffer(offer)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Quantité</span>
                      <p className="font-semibold">{offer.quantity} {offer.unit}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Prix</span>
                      <p className="font-semibold text-green-600">{offer.price} {offer.price_unit}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-muted-foreground">Récolte</span>
                        <p className="font-semibold">{offer.harvest_date || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium text-muted-foreground">Expiration</span>
                        <p className="font-semibold">{offer.expiry_date || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  {offer.location && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-1 text-xs sm:text-sm">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Localisation:</span>
                        <span className="font-medium truncate">{offer.location}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer l'offre "{offerToDelete?.product}" ?
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
        {/* Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'offre</DialogTitle>
              <DialogDescription>Informations complètes sur l'offre sélectionnée</DialogDescription>
            </DialogHeader>
            {offerDetails && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{offerDetails.product}</h3>
                    {getStatusBadge(offerDetails.status)}
                    {getQualityBadge(offerDetails.quality)}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(offerDetails.price)} <span className="text-xs text-muted-foreground">({offerDetails.price_unit})</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Quantité</div>
                    <div className="font-medium">{offerDetails.quantity} {offerDetails.unit}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Producteur</div>
                    <div className="font-medium">{offerDetails.producer_name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Récolte</div>
                    <div className="font-medium">{offerDetails.harvest_date ? formatDate(offerDetails.harvest_date, { month: 'long' }) : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Expiration</div>
                    <div className="font-medium">{offerDetails.expiry_date ? formatDate(offerDetails.expiry_date, { month: 'long' }) : 'N/A'}</div>
                  </div>
                  {offerDetails.location && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Localisation</div>
                      <div className="font-medium">{offerDetails.location}</div>
                    </div>
                  )}
                </div>

                {offerDetails.description && (
                  <div>
                    <div className="text-sm text-muted-foreground">Description</div>
                    <p className="text-sm mt-1">{offerDetails.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Créée: {formatDate(offerDetails.created_at)}</div>
                  <div>Mise à jour: {formatDate(offerDetails.updated_at)}</div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </div>
        </main>
        <FloatingVoiceNavigator />
    </ProducerLayout>
  );
};

export default ProducerOffers;
