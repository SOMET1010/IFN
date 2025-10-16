import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Warehouse,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  Navigation,
  Users,
  FileText,
  Camera,
  Phone,
  MessageSquare,
  Route,
  Gauge,
  Calendar
} from 'lucide-react';
import { logisticsService, LogisticsStep, Warehouse as WarehouseType, DeliveryVehicle, RouteOptimization } from '@/services/producer/logisticsService';
import { formatCurrency, formatDate } from '@/lib/format';

interface LogisticsTrackingProps {
  orderId: string;
  product: string;
  quantity: number;
  pickupLocation: { address: string; coordinates: { lat: number; lng: number } };
  deliveryLocation: { address: string; coordinates: { lat: number; lng: number } };
  onStepUpdate?: (stepId: string, status: string, notes?: string) => void;
}

export function LogisticsTracking({
  orderId,
  product,
  quantity,
  pickupLocation,
  deliveryLocation,
  onStepUpdate
}: LogisticsTrackingProps) {
  const [logisticsSteps, setLogisticsSteps] = useState<LogisticsStep[]>([]);
  const [availableWarehouses, setAvailableWarehouses] = useState<WarehouseType[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<DeliveryVehicle[]>([]);
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseType | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<DeliveryVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [showDelayDialog, setShowDelayDialog] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [delayDuration, setDelayDuration] = useState(30);

  useEffect(() => {
    loadLogisticsData();
  }, [orderId]);

  const loadLogisticsData = async () => {
    setLoading(true);
    try {
      const [steps, warehouses, vehicles, route] = await Promise.all([
        logisticsService.getLogisticsSteps(orderId),
        logisticsService.getAvailableWarehouses(pickupLocation.address, quantity),
        logisticsService.getAvailableVehicles(pickupLocation.address, quantity),
        logisticsService.optimizeRoute(orderId, pickupLocation.coordinates, deliveryLocation.coordinates)
      ]);

      setLogisticsSteps(steps);
      setAvailableWarehouses(warehouses);
      setAvailableVehicles(vehicles);
      setRouteOptimization(route);
    } catch (error) {
      console.error('Erreur lors du chargement des données logistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseSelection = async (warehouse: WarehouseType) => {
    const success = await logisticsService.reserveWarehouse(warehouse.id, orderId, 48); // 48 hours
    if (success) {
      setSelectedWarehouse(warehouse);
      setShowWarehouseDialog(false);
      // Update the warehouse check-in step
      const checkInStep = await logisticsService.checkInWarehouse(orderId, warehouse.id, quantity);
      updateStepStatus('step1', 'in_progress', checkInStep.notes);
    }
  };

  const handleVehicleAssignment = async (vehicle: DeliveryVehicle) => {
    const success = await logisticsService.assignVehicle(orderId, vehicle.id);
    if (success) {
      setSelectedVehicle(vehicle);
      setShowVehicleDialog(false);
      // Update the loading step
      updateStepStatus('step4', 'pending', `Véhicule assigné: ${vehicle.licensePlate}`);
    }
  };

  const handleReportDelay = async () => {
    if (delayReason && delayDuration > 0) {
      await logisticsService.reportDelay(orderId, delayReason, delayDuration);
      setShowDelayDialog(false);
      setDelayReason('');
      setDelayDuration(30);
    }
  };

  const updateStepStatus = async (stepId: string, status: LogisticsStep['status'], notes?: string) => {
    const success = await logisticsService.updateLogisticsStep(stepId, status, notes);
    if (success) {
      setLogisticsSteps(prev => prev.map(step =>
        step.id === stepId ? { ...step, status, notes, timestamp: status === 'in_progress' ? new Date().toISOString() : step.timestamp } : step
      ));
      onStepUpdate?.(stepId, status, notes);
    }
  };

  const getStepIcon = (type: LogisticsStep['type']) => {
    switch (type) {
      case 'warehouse_checkin':
        return <Warehouse className="h-5 w-5" />;
      case 'quality_control':
        return <CheckCircle className="h-5 w-5" />;
      case 'packaging':
        return <Package className="h-5 w-5" />;
      case 'loading':
        return <Package className="h-5 w-5" />;
      case 'in_transit':
        return <Truck className="h-5 w-5" />;
      case 'delivery':
        return <MapPin className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStepColor = (status: LogisticsStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: LogisticsStep['status']) => {
    const variants = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      completed: 'Terminé',
      failed: 'Échoué'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const completedSteps = logisticsSteps.filter(step => step.status === 'completed').length;
  const totalSteps = logisticsSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des informations logistiques...</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={60} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logistics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Suivi Logistique - Commande #{orderId.slice(-6)}
          </CardTitle>
          <CardDescription>
            Suivez chaque étape du processus logistique de votre commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progression logistique</span>
              <span>{completedSteps}/{totalSteps} étapes terminées</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {selectedWarehouse ? (
                <Warehouse className="h-8 w-8 text-blue-500" />
              ) : (
                <Warehouse className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <div className="font-medium">Entrepôt</div>
                <div className="text-sm text-muted-foreground">
                  {selectedWarehouse ? selectedWarehouse.name : 'Non assigné'}
                </div>
              </div>
              {!selectedWarehouse && (
                <Button
                  size="sm"
                  onClick={() => setShowWarehouseDialog(true)}
                  className="ml-auto"
                >
                  Assigner
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              {selectedVehicle ? (
                <Truck className="h-8 w-8 text-green-500" />
              ) : (
                <Truck className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <div className="font-medium">Véhicule</div>
                <div className="text-sm text-muted-foreground">
                  {selectedVehicle ? `${selectedVehicle.licensePlate}` : 'Non assigné'}
                </div>
              </div>
              {!selectedVehicle && (
                <Button
                  size="sm"
                  onClick={() => setShowVehicleDialog(true)}
                  className="ml-auto"
                >
                  Assigner
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Navigation className="h-8 w-8 text-purple-500" />
              <div>
                <div className="font-medium">Itinéraire</div>
                <div className="text-sm text-muted-foreground">
                  {routeOptimization ? `${routeOptimization.totalDistance}km` : 'Calcul en cours...'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logistics Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Étapes logistiques</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logisticsSteps.map((step, index) => (
              <div key={step.id} className={`p-4 border rounded-lg ${getStepColor(step.status)}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                    'bg-gray-300'
                  }`}>
                    {getStepIcon(step.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold capitalize">
                          {step.type.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.type === 'warehouse_checkin' && 'Réception et stockage des produits'}
                          {step.type === 'quality_control' && 'Contrôle qualité avant expédition'}
                          {step.type === 'packaging' && 'Emballage et préparation des colis'}
                          {step.type === 'loading' && 'Chargement du véhicule'}
                          {step.type === 'in_transit' && 'Transport vers destination'}
                          {step.type === 'delivery' && 'Livraison finale au client'}
                        </p>
                      </div>
                      {getStatusBadge(step.status)}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm">
                      {step.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>~{step.estimatedDuration} min</span>
                        </div>
                      )}
                      {step.timestamp && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(step.timestamp)}</span>
                        </div>
                      )}
                    </div>

                    {step.notes && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                        {step.notes}
                      </div>
                    )}

                    {/* Action buttons based on step status */}
                    <div className="mt-3 flex gap-2">
                      {step.status === 'pending' && index === 0 && (
                        <Button
                          size="sm"
                          onClick={() => updateStepStatus(step.id, 'in_progress')}
                        >
                          Démarrer
                        </Button>
                      )}
                      {step.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateStepStatus(step.id, 'completed', 'Étape terminée avec succès')}
                        >
                          Terminer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs defaultValue="route" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="route">Itinéraire</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="delays">Gestion retards</TabsTrigger>
        </TabsList>

        <TabsContent value="route" className="space-y-4">
          {routeOptimization && (
            <Card>
              <CardHeader>
                <CardTitle>Itinéraire optimisé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{routeOptimization.totalDistance} km</div>
                    <div className="text-sm text-muted-foreground">Distance totale</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{Math.round(routeOptimization.estimatedTime / 60)}h {routeOptimization.estimatedTime % 60}min</div>
                    <div className="text-sm text-muted-foreground">Temps estimé</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatCurrency(routeOptimization.fuelCost)}</div>
                    <div className="text-sm text-muted-foreground">Coût carburant</div>
                  </div>
                </div>

                {routeOptimization.trafficData && (
                  <Alert className={routeOptimization.trafficData.level === 'high' ? 'border-yellow-200' : ''}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Trafic actuellement {routeOptimization.trafficData.level === 'high' ? 'élevé' : routeOptimization.trafficData.level === 'medium' ? 'moyen' : 'faible'}
                      {routeOptimization.trafficData.delay > 0 && ` - Retard estimé: ${routeOptimization.trafficData.delay} min`}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3 mt-4">
                  {routeOptimization.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-500' : index === routeOptimization.waypoints.length - 1 ? 'bg-red-500' : 'bg-blue-500'
                      } text-white`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{waypoint.address}</div>
                        <div className="text-sm text-muted-foreground">
                          Arrivée estimée: {new Date(waypoint.estimatedArrival).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <Badge variant={waypoint.priority === 'high' ? 'default' : 'secondary'}>
                        {waypoint.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tracking en temps réel</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVehicle ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Informations véhicule</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Immatriculation:</span>
                          <span>{selectedVehicle.licensePlate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{selectedVehicle.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacité:</span>
                          <span>{selectedVehicle.capacity} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Charge actuelle:</span>
                          <span>{selectedVehicle.currentLoad} kg</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Chauffeur</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Nom:</span>
                          <span>{selectedVehicle.driver.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Téléphone:</span>
                          <span>{selectedVehicle.driver.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Note:</span>
                          <div className="flex items-center gap-1">
                            <span>{selectedVehicle.driver.rating}/5</span>
                            <span>⭐</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Contacter chauffeur
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Envoyer message
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucun véhicule assigné pour cette commande
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents logistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Bon de livraison</div>
                      <div className="text-sm text-muted-foreground">Document obligatoire pour la livraison</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Télécharger
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Certificat de qualité</div>
                      <div className="text-sm text-muted-foreground">Vérification des produits</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Télécharger
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Photos de chargement</div>
                      <div className="text-sm text-muted-foreground">Preuves visuelles du chargement</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir photos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des retards</CardTitle>
              <CardDescription>
                Signalez et gérez les retards de livraison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    En cas de retard, veuillez le signaler rapidement pour informer toutes les parties concernées.
                  </AlertDescription>
                </Alert>

                <Button onClick={() => setShowDelayDialog(true)}>
                  Signaler un retard
                </Button>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Le signalement automatique notifie le client et le chauffeur</p>
                  <p>• Les retards sont suivis pour améliorer les futurs livraisons</p>
                  <p>• Des alternatives peuvent être proposées en cas de retard important</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warehouse Selection Dialog */}
      <Dialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sélectionner un entrepôt</DialogTitle>
            <DialogDescription>
              Choisissez un entrepôt disponible pour votre commande de {quantity}kg
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableWarehouses.map(warehouse => (
              <div key={warehouse.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{warehouse.name}</h4>
                    <p className="text-sm text-muted-foreground">{warehouse.location.address}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium">Capacité:</span>
                        <span> {warehouse.capacity.toLocaleString()}kg</span>
                      </div>
                      <div>
                        <span className="font-medium">Disponible:</span>
                        <span> {warehouse.availability}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="capitalize"> {warehouse.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Stock actuel:</span>
                        <span> {warehouse.currentStock.toLocaleString()}kg</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs font-medium">Équipements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {warehouse.facilities.map((facility, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {facility}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleWarehouseSelection(warehouse)}
                    disabled={warehouse.availability < 10 || warehouse.capacity < warehouse.currentStock + quantity}
                  >
                    Réserver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Vehicle Selection Dialog */}
      <Dialog open={showVehicleDialog} onOpenChange={setShowVehicleDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sélectionner un véhicule</DialogTitle>
            <DialogDescription>
              Choisissez un véhicule disponible pour la livraison de {quantity}kg
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableVehicles.map(vehicle => (
              <div key={vehicle.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{vehicle.licensePlate}</h4>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className="capitalize"> {vehicle.type}</span>
                      </div>
                      <div>
                        <span className="font-medium">Capacité:</span>
                        <span> {vehicle.capacity}kg</span>
                      </div>
                      <div>
                        <span className="font-medium">Charge actuelle:</span>
                        <span> {vehicle.currentLoad}kg</span>
                      </div>
                      <div>
                        <span className="font-medium">Statut:</span>
                        <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <h5 className="font-medium text-sm">Chauffeur</h5>
                      <div className="text-sm text-muted-foreground">
                        <div>{vehicle.driver.name} - {vehicle.driver.phone}</div>
                        <div>Note: {vehicle.driver.rating}/5</div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleVehicleAssignment(vehicle)}
                    disabled={vehicle.status !== 'available' || vehicle.capacity < quantity}
                  >
                    Assigner
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delay Report Dialog */}
      <Dialog open={showDelayDialog} onOpenChange={setShowDelayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un retard</DialogTitle>
            <DialogDescription>
              Informez les parties concernées d'un retard de livraison
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="delayReason">Raison du retard</Label>
              <Textarea
                id="delayReason"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="Décrivez la raison du retard..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="delayDuration">Durée estimée du retard (minutes)</Label>
              <Input
                id="delayDuration"
                type="number"
                value={delayDuration}
                onChange={(e) => setDelayDuration(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDelayDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleReportDelay} disabled={!delayReason || delayDuration <= 0}>
                Signaler le retard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}