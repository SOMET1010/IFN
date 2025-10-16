import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Calendar, MapPin, Cloud, Droplets, Sun, Wind } from 'lucide-react';
import { ProducerHarvest } from '@/types';
import { producerHarvestService } from '@/services/producer/producerHarvestService';
import { HarvestForm } from '@/components/producer/HarvestForm';
import ProducerLayout from '@/components/producer/ProducerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const ProducerHarvests = () => {
  const { user } = useAuth();
  const [harvests, setHarvests] = useState<ProducerHarvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHarvest, setSelectedHarvest] = useState<ProducerHarvest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [harvestToDelete, setHarvestToDelete] = useState<ProducerHarvest | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Initialiser d'abord les données de démo, puis charger
      producerHarvestService.initializeDemoData(user.id);
      loadHarvests();
    }
  }, [user?.id]);

  const loadHarvests = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await producerHarvestService.getHarvestsByProducer(user.id);
      if (response.success && response.data) {
        // Trier par date du plus récent au plus ancien
        const sortedHarvests = response.data.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHarvests(sortedHarvests);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des récoltes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHarvest = () => {
    setSelectedHarvest(null);
    setShowForm(true);
  };

  const handleEditHarvest = (harvest: ProducerHarvest) => {
    setSelectedHarvest(harvest);
    setShowForm(true);
  };

  const handleDeleteHarvest = (harvest: ProducerHarvest) => {
    setHarvestToDelete(harvest);
    setShowDeleteDialog(true);
  };

  const { toast } = useToast();

  const confirmDelete = async () => {
    if (!harvestToDelete) return;

    try {
      const response = await producerHarvestService.delete(harvestToDelete.id);
      if (response.success) {
        await loadHarvests();
        toast({ title: 'Récolte supprimée', description: `"${harvestToDelete.product}" du ${harvestToDelete.date} supprimée.` });
      } else {
        toast({ title: 'Erreur', description: response.error || 'Erreur lors de la suppression', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setShowDeleteDialog(false);
      setHarvestToDelete(null);
    }
  };

  const getQualityBadge = (quality: ProducerHarvest['quality']) => {
    const variants = {
      Premium: "default",
      Standard: "secondary",
      Bio: "outline"
    } as const;
    return <Badge variant={variants[quality]}>{quality}</Badge>;
  };

  const getWeatherIcon = (weather?: string) => {
    const lowerWeather = weather?.toLowerCase() || '';
    if (lowerWeather.includes('sec') || lowerWeather.includes('soleil')) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    } else if (lowerWeather.includes('humide') || lowerWeather.includes('pluie')) {
      return <Droplets className="h-4 w-4 text-blue-500" />;
    } else if (lowerWeather.includes('nuage') || lowerWeather.includes('couvert')) {
      return <Cloud className="h-4 w-4 text-gray-500" />;
    } else {
      return <Wind className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <ProducerLayout title="Récoltes" showBackButton={true} backTo="/producer/dashboard">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </ProducerLayout>
    );
  }

  return (
      <ProducerLayout title="Récoltes" showBackButton={true} backTo="/producer/dashboard">

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Récoltes</h2>
              <HarvestForm
                producerId={user?.id || ''}
                onSuccess={loadHarvests}
                isOpen={showForm}
                onOpenChange={setShowForm}
                harvest={selectedHarvest || undefined}
              />
            </div>

        {harvests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune récolte</h3>
              <p className="text-muted-foreground text-center mb-4">
                Vous n'avez pas encore enregistré de récolte. Commencez par ajouter votre première récolte.
              </p>
              <Button onClick={handleCreateHarvest}>
                <Plus className="h-4 w-4 mr-2" />
                Enregistrer ma première récolte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {harvests.map((harvest, index) => (
              <Card
                key={harvest.id}
                className="transition-all duration-300 hover:shadow-xl hover:scale-105 group relative overflow-hidden animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-2">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                        <span className="truncate">{harvest.product}</span>
                        {getQualityBadge(harvest.quality)}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {formatDate(harvest.date, { month: 'long' })}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Modifier"
                        className="h-6 w-6 sm:h-8 sm:w-8 transition-all duration-200 hover:scale-110 hover:bg-primary/10 hover:text-primary hover:rotate-12"
                        aria-label="Modifier la récolte"
                        onClick={() => handleEditHarvest(harvest)}
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-6 w-6 sm:h-8 sm:w-8 transition-all duration-200 hover:scale-110 hover:bg-destructive/10 hover:rotate-12"
                        title="Supprimer"
                        aria-label="Supprimer la récolte"
                        onClick={() => handleDeleteHarvest(harvest)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="text-center group">
                    <div className="text-2xl sm:text-3xl font-bold text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-primary/80">
                      {harvest.quantity.toLocaleString()} {harvest.unit}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                      Quantité récoltée
                    </p>
                  </div>

                  <div className="space-y-2">
                    {harvest.location && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="truncate">{harvest.location}</span>
                      </div>
                    )}

                    {harvest.weather_conditions && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        {getWeatherIcon(harvest.weather_conditions)}
                        <span className="truncate">{harvest.weather_conditions}</span>
                      </div>
                    )}
                  </div>

                  {harvest.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {harvest.notes}
                      </p>
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
                Êtes-vous sûr de vouloir supprimer la récolte de "{harvestToDelete?.product}" du {harvestToDelete?.date ? formatDate(harvestToDelete.date) : ''} ?
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

export default ProducerHarvests;
