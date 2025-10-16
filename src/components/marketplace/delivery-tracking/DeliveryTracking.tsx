import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Package,
  User,
  Star,
  Camera,
  Upload
} from 'lucide-react';

interface DeliveryData {
  orderId: string;
  trackingNumber: string;
  status: 'preparing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimatedDelivery: Date;
  currentLocation?: string;
  driver?: {
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
    licensePlate: string;
  };
  route?: {
    origin: string;
    destination: string;
    currentStep: number;
    totalSteps: number;
  };
  packageInfo: {
    weight: string;
    dimensions: string;
    specialInstructions?: string;
  };
}

interface DeliveryTrackingProps {
  orderId?: string;
  initialTrackingNumber?: string;
}

const DeliveryTracking = ({ orderId, initialTrackingNumber }: DeliveryTrackingProps) => {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false);
  const [deliveryImages, setDeliveryImages] = useState<File[]>([]);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [deliveryComments, setDeliveryComments] = useState('');

  useEffect(() => {
    if (initialTrackingNumber) {
      trackDelivery(initialTrackingNumber);
    }
  }, [initialTrackingNumber, trackDelivery]);

  const trackDelivery = useCallback(async (number: string) => {
    setIsTracking(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock delivery data
    const mockData: DeliveryData = {
      orderId: orderId || `ORD${Date.now()}`,
      trackingNumber: number,
      status: 'in_transit',
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      currentLocation: 'Yamoussoukro, Boulevard de la République',
      driver: {
        name: 'Kouassi Jean',
        phone: '+225 07 00 00 00 00',
        rating: 4.8,
        vehicle: 'Toyota Hiace',
        licensePlate: 'CI-1234-AB'
      },
      route: {
        origin: 'Abidjan, Plateau',
        destination: 'Yamoussoukro, Centre-ville',
        currentStep: 2,
        totalSteps: 4
      },
      packageInfo: {
        weight: '15 kg',
        dimensions: '40x30x25 cm',
        specialInstructions: 'Produits frais, manipuler avec précaution'
      }
    };

    setDeliveryData(mockData);
    setIsTracking(false);
  }, [orderId]);

  const handleTrackDelivery = () => {
    if (trackingNumber.trim()) {
      trackDelivery(trackingNumber);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setDeliveryImages(prev => [...prev, ...files]);
  };

  const confirmDelivery = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (deliveryData) {
      setDeliveryData({
        ...deliveryData,
        status: 'delivered'
      });
    }

    setShowProofOfDelivery(false);
  };

  const getStatusConfig = (status: DeliveryData['status']) => {
    const configs = {
      preparing: {
        label: 'Préparation',
        color: 'bg-blue-100 text-blue-800',
        icon: Package,
        progress: 20
      },
      picked_up: {
        label: 'Collecté',
        color: 'bg-purple-100 text-purple-800',
        icon: Truck,
        progress: 40
      },
      in_transit: {
        label: 'En transit',
        color: 'bg-orange-100 text-orange-800',
        icon: Navigation,
        progress: 60
      },
      out_for_delivery: {
        label: 'En cours de livraison',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Truck,
        progress: 80
      },
      delivered: {
        label: 'Livré',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        progress: 100
      }
    };

    return configs[status];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{2})(?=\d)/g, '$1 ');
  };

  if (!deliveryData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Truck className="h-6 w-6 mr-2" />
                Suivi de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600">
                Entrez votre numéro de suivi pour suivre votre colis
              </p>

              <div className="flex space-x-2">
                <Input
                  placeholder="Numéro de suivi"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackDelivery()}
                />
                <Button onClick={handleTrackDelivery} disabled={isTracking}>
                  {isTracking ? 'Recherche...' : 'Suivre'}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Exemple: TRK123456789</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(deliveryData.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Suivi de livraison</h1>
              <p className="text-gray-600">Commande #{deliveryData.orderId}</p>
            </div>
            <Badge className={statusConfig.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progression de la livraison</span>
              <span>{statusConfig.progress}%</span>
            </div>
            <Progress value={statusConfig.progress} className="h-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Tracking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Statut de la livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['preparing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].map((status, index) => {
                    const isCompleted = index <= ['preparing', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].indexOf(deliveryData.status);
                    const isCurrent = status === deliveryData.status;
                    const statusStepConfig = getStatusConfig(status as DeliveryData['status']);
                    const StepIcon = statusStepConfig.icon;

                    return (
                      <div key={status} className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'
                        }`}>
                          <StepIcon className={`h-5 w-5 ${isCompleted ? 'text-white' : isCurrent ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                            {statusStepConfig.label}
                          </div>
                          {isCurrent && deliveryData.currentLocation && (
                            <p className="text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {deliveryData.currentLocation}
                            </p>
                          )}
                          {isCompleted && status === 'delivered' && (
                            <p className="text-sm text-gray-600 mt-1">
                              Livré le {formatTime(new Date())}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            {deliveryData.driver && deliveryData.status !== 'delivered' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Livreur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{deliveryData.driver.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span>{deliveryData.driver.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-600">{deliveryData.driver.vehicle} • {deliveryData.driver.licensePlate}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        {formatPhoneNumber(deliveryData.driver.phone)}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Confirmation */}
            {deliveryData.status === 'out_for_delivery' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Votre livraison arrive bientôt</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Votre colis est en cours de livraison. Veuillez être disponible à l'adresse de livraison.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Informations importantes</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Le livreur vous contactera avant d'arriver</li>
                      <li>• Vérifiez l'état du colis avant de signer</li>
                      <li>• Préparez une pièce d'identité si nécessaire</li>
                    </ul>
                  </div>

                  <Dialog open={showProofOfDelivery} onOpenChange={setShowProofOfDelivery}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4">
                        Confirmer la réception
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirmer la livraison</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Photos du colis reçu</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {deliveryImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Proof ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => setDeliveryImages(prev => prev.filter((_, i) => i !== index))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {deliveryImages.length < 4 && (
                              <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">Ajouter photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Noter le service</h4>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-6 w-6 cursor-pointer ${
                                  star <= deliveryRating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                onClick={() => setDeliveryRating(star)}
                              />
                                ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Commentaires (optionnel)</h4>
                          <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            rows={3}
                            placeholder="Partagez votre expérience..."
                            value={deliveryComments}
                            onChange={(e) => setDeliveryComments(e.target.value)}
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setShowProofOfDelivery(false)}>
                            Annuler
                          </Button>
                          <Button onClick={confirmDelivery} disabled={deliveryRating === 0}>
                            Confirmer la réception
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Delivered Success */}
            {deliveryData.status === 'delivered' && (
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-900 mb-2">Livraison réussie !</h2>
                  <p className="text-gray-600 mb-6">
                    Votre colis a été livré avec succès. Merci d'avoir choisi AgriMarket !
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Date de livraison</div>
                      <div className="font-medium">{formatTime(new Date())}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Livreur</div>
                      <div className="font-medium">{deliveryData.driver?.name}</div>
                    </div>
                  </div>

                  <Button onClick={() => window.print()}>
                    Télécharger le reçu
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Package Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informations du colis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Numéro de suivi</span>
                  <span className="font-medium">{deliveryData.trackingNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Poids</span>
                  <span className="font-medium">{deliveryData.packageInfo.weight}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dimensions</span>
                  <span className="font-medium">{deliveryData.packageInfo.dimensions}</span>
                </div>
                {deliveryData.packageInfo.specialInstructions && (
                  <div className="bg-yellow-50 p-2 rounded text-xs">
                    <div className="font-medium text-yellow-900 mb-1">Instructions spéciales</div>
                    <div className="text-yellow-800">{deliveryData.packageInfo.specialInstructions}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Route Information */}
            {deliveryData.route && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Itinéraire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Départ</div>
                        <div className="text-xs text-gray-600">{deliveryData.route.origin}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Actuellement</div>
                        <div className="text-xs text-gray-600">{deliveryData.currentLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                      <div>
                        <div className="text-sm font-medium">Destination</div>
                        <div className="text-xs text-gray-600">{deliveryData.route.destination}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estimated Delivery */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Livraison estimée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatTime(deliveryData.estimatedDelivery)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {deliveryData.status === 'delivered' ? 'Livré' : 'Heure estimée'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Besoin d'aide ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Support client
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter le livreur
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Signaler un problème
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;