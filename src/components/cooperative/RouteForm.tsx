import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calculator, MapPin, Truck, Clock, Fuel, DollarSign, Shield } from 'lucide-react';

const stopSchema = z.object({
  order: z.number().min(1, 'L\'ordre est requis'),
  location: z.string().min(2, 'Le lieu est requis'),
  address: z.string().min(5, 'L\'adresse est requise'),
  type: z.enum(['départ', 'arrivée', 'livraison', 'collecte', 'maintenance', 'pause']),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable(),
  load: z.array(z.string()).optional().default([]),
  unload: z.array(z.string()).optional().default([]),
  contact: z.string().min(2, 'Le contact est requis'),
  phone: z.string().min(10, 'Le téléphone est requis'),
  status: z.enum(['pending', 'in_progress', 'completed', 'skipped', 'delayed']),
  notes: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

const incidentSchema = z.object({
  type: z.string().min(2, 'Le type d\'incident est requis'),
  description: z.string().min(5, 'La description est requise'),
  time: z.string().min(1, 'L\'heure est requise'),
  location: z.string().min(2, 'Le lieu est requis'),
  severity: z.enum(['low', 'medium', 'high']),
  resolved: z.boolean(),
  resolution: z.string().optional(),
});

const routeSchema = z.object({
  name: z.string().min(2, 'Le nom de la tournée est requis'),
  description: z.string().optional(),
  type: z.enum(['approvisionnement', 'collecte', 'livraison', 'maintenance', 'surveillance']),
  status: z.enum(['scheduled', 'active', 'completed', 'cancelled', 'delayed', 'paused']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  driver: z.string().min(2, 'Le chauffeur est requis'),
  driverContact: z.string().min(10, 'Le contact du chauffeur est requis'),
  vehicle: z.string().min(2, 'Le véhicule est requis'),
  vehicleId: z.string().min(1, 'L\'ID du véhicule est requis'),
  phone: z.string().min(10, 'Le téléphone est requis'),
  startDate: z.string().min(1, 'La date de début est requise'),
  estimatedDuration: z.string().min(1, 'La durée estimée est requise'),
  actualDuration: z.string().optional(),
  totalDistance: z.string().min(1, 'La distance totale est requise'),
  actualDistance: z.string().optional(),
  fuelConsumption: z.string().min(1, 'La consommation de carburant est requise'),
  actualFuelConsumption: z.string().optional(),
  estimatedCost: z.number().min(0, 'Le coût estimé doit être positif'),
  actualCost: z.number().optional(),
  currency: z.string().min(3, 'La devise est requise'),
  stops: z.array(stopSchema).min(2, 'Au moins 2 arrêts sont requis'),
  weather: z.string().min(2, 'Les conditions météo sont requises'),
  traffic: z.string().min(2, 'Le trafic est requis'),
  notes: z.string().optional(),
  safetyChecks: z.object({
    preDeparture: z.boolean(),
    vehicleInspection: z.boolean(),
    documentsCheck: z.boolean(),
    emergencyKit: z.boolean(),
  }),
  incidents: z.array(incidentSchema).optional().default([]),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface RouteFormProps {
  item?: RouteFormData & { id?: string };
  vehicles?: Array<{ id: string; type: string; plate: string; driver: string; status: string }>;
  onSubmit: (data: RouteFormData & { id: string }) => void;
  onCancel: () => void;
  trigger?: React.ReactNode;
}

const routeTypes = [
  { value: 'approvisionnement', label: 'Approvisionnement' },
  { value: 'collecte', label: 'Collecte' },
  { value: 'livraison', label: 'Livraison' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'surveillance', label: 'Surveillance' },
];

const routeStatuses = [
  { value: 'scheduled', label: 'Planifiée' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'delayed', label: 'Retardée' },
  { value: 'paused', label: 'En pause' },
];

const priorities = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Élevée' },
  { value: 'urgent', label: 'Urgente' },
];

const currencies = [
  'FCFA', 'EUR', 'USD', 'XOF'
];

const stopTypes = [
  { value: 'départ', label: 'Départ' },
  { value: 'arrivée', label: 'Arrivée' },
  { value: 'livraison', label: 'Livraison' },
  { value: 'collecte', label: 'Collecte' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'pause', label: 'Pause' },
];

const stopStatuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'skipped', label: 'Ignoré' },
  { value: 'delayed', label: 'Retardé' },
];

const weatherOptions = [
  'Ensoleillé', 'Nuageux', 'Pluie légère', 'Pluie forte', 'Orage', 'Brouillard', 'Vent fort'
];

const trafficOptions = [
  'Faible', 'Modéré', 'Élevé', 'Très élevé', 'Embouteillé'
];

const incidentTypes = [
  'Panne mécanique', 'Accident', 'Retard', 'Problème de chargement', 'Mauvaise route', 'Autre'
];

const severityOptions = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Élevée' },
];

export const RouteForm: React.FC<RouteFormProps> = ({ item, vehicles = [], onSubmit, onCancel, trigger }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      type: item?.type || 'approvisionnement',
      status: item?.status || 'scheduled',
      priority: item?.priority || 'medium',
      driver: item?.driver || '',
      driverContact: item?.driverContact || '',
      vehicle: item?.vehicle || '',
      vehicleId: item?.vehicleId || '',
      phone: item?.phone || '',
      startDate: item?.startDate || new Date().toISOString().split('T')[0],
      estimatedDuration: item?.estimatedDuration || '4h',
      actualDuration: item?.actualDuration || '',
      totalDistance: item?.totalDistance || '100 km',
      actualDistance: item?.actualDistance || '',
      fuelConsumption: item?.fuelConsumption || '15 L',
      actualFuelConsumption: item?.actualFuelConsumption || '',
      estimatedCost: item?.estimatedCost || 50000,
      actualCost: item?.actualCost,
      currency: item?.currency || 'FCFA',
      stops: item?.stops || [
        {
          order: 1,
          location: '',
          address: '',
          type: 'départ',
          arrivalTime: '',
          departureTime: '',
          load: [],
          unload: [],
          contact: '',
          phone: '',
          status: 'pending',
          notes: '',
        },
        {
          order: 2,
          location: '',
          address: '',
          type: 'arrivée',
          arrivalTime: '',
          departureTime: null,
          load: [],
          unload: [],
          contact: '',
          phone: '',
          status: 'pending',
          notes: '',
        }
      ],
      weather: item?.weather || 'Ensoleillé',
      traffic: item?.traffic || 'Modéré',
      notes: item?.notes || '',
      safetyChecks: {
        preDeparture: item?.safetyChecks?.preDeparture || false,
        vehicleInspection: item?.safetyChecks?.vehicleInspection || false,
        documentsCheck: item?.safetyChecks?.documentsCheck || false,
        emergencyKit: item?.safetyChecks?.emergencyKit || false,
      },
      incidents: item?.incidents || [],
    },
  });

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
    swap: swapStops,
  } = useFieldArray({
    control: form.control,
    name: 'stops',
  });

  const {
    fields: incidentFields,
    append: appendIncident,
    remove: removeIncident,
  } = useFieldArray({
    control: form.control,
    name: 'incidents',
  });

  const calculateTotals = () => {
    const estimatedCost = form.watch('estimatedCost');
    const actualCost = form.watch('actualCost');
    const totalDistance = form.watch('totalDistance');
    
    setTotalCost(actualCost || estimatedCost);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      form.setValue('vehicle', `${vehicle.type} - ${vehicle.plate}`);
      form.setValue('driver', vehicle.driver);
    }
  };

  const onSubmitForm = async (data: RouteFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        id: item?.id || `ROUTE-${Date.now()}`,
      });
    } catch (error) {
      console.error('Error submitting route form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const FormContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {item ? 'Modifier la tournée' : 'Nouvelle tournée'}
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={calculateTotals}
          className="gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculer les totaux
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="stops">Arrêts et itinéraire</TabsTrigger>
              <TabsTrigger value="safety">Sécurité et incidents</TabsTrigger>
              <TabsTrigger value="costs">Coûts et statistiques</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la tournée</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Tournée Nord - Approvisionnement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de tournée</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner le statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {routeStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Véhicule</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        handleVehicleSelect(value);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un véhicule" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.type} - {vehicle.plate} ({vehicle.driver})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chauffeur</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du chauffeur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="driverContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact du chauffeur</FormLabel>
                      <FormControl>
                        <Input placeholder="+225 XX XX XX XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone de suivi</FormLabel>
                      <FormControl>
                        <Input placeholder="+225 XX XX XX XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée estimée</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 4h30m" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance totale</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 150 km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consommation de carburant</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 25 L" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weather"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions météo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Conditions météo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weatherOptions.map((weather) => (
                            <SelectItem key={weather} value={weather}>
                              {weather}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="traffic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trafic</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Trafic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {trafficOptions.map((traffic) => (
                            <SelectItem key={traffic} value={traffic}>
                              {traffic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description détaillée de la tournée..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            <TabsContent value="stops" className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Arrêts de la tournée</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendStop({
                      order: stopFields.length + 1,
                      location: '',
                      address: '',
                      type: 'livraison',
                      arrivalTime: '',
                      departureTime: '',
                      load: [],
                      unload: [],
                      contact: '',
                      phone: '',
                      status: 'pending',
                      notes: '',
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un arrêt
                  </Button>
                </div>
                {stopFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <FormField
                            control={form.control}
                            name={`stops.${index}.type`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {stopTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="flex gap-2">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => swapStops(index, index - 1)}
                            >
                              ↑
                            </Button>
                          )}
                          {index < stopFields.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => swapStops(index, index + 1)}
                            >
                              ↓
                            </Button>
                          )}
                          {stopFields.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStop(index)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`stops.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lieu</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du lieu" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stops.${index}.address`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input placeholder="Adresse complète" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stops.${index}.contact`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du contact" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stops.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input placeholder="+225 XX XX XX XX" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name={`stops.${index}.arrivalTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heure d'arrivée</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stops.${index}.departureTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heure de départ</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`stops.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statut</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {stopStatuses.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                      {status.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`stops.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Notes supplémentaires..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="safety" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Contrôles de sécurité</h4>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="safetyChecks.preDeparture"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Vérification pré-départ
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="safetyChecks.vehicleInspection"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Inspection du véhicule
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="safetyChecks.documentsCheck"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Vérification des documents
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="safetyChecks.emergencyKit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Trousse d'urgence
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Incidents</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendIncident({
                      type: '',
                      description: '',
                      time: '',
                      location: '',
                      severity: 'low',
                      resolved: false,
                      resolution: '',
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un incident
                  </Button>
                </div>
                {incidentFields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline">Incident #{index + 1}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIncident(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`incidents.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type d'incident</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {incidentTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`incidents.${index}.severity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gravité</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {severityOptions.map((severity) => (
                                    <SelectItem key={severity.value} value={severity.value}>
                                      {severity.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`incidents.${index}.time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heure</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`incidents.${index}.location`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lieu</FormLabel>
                              <FormControl>
                                <Input placeholder="Lieu de l'incident" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`incidents.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Description de l'incident..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`incidents.${index}.resolved`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Incident résolu
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {form.watch(`incidents.${index}.resolved`) && (
                        <FormField
                          control={form.control}
                          name={`incidents.${index}.resolution`}
                          render={({ field }) => (
                            <FormItem className="mt-4">
                              <FormLabel>Résolution</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Comment l'incident a été résolu..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coût estimé</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coût réel</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée réelle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 5h15m" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="actualDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance réelle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 145 km" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actualFuelConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consommation réelle</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 22 L" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Coût total</p>
                      <p className="text-2xl font-bold text-primary">
                        {totalCost.toLocaleString()} {form.watch('currency')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Distance</p>
                      <p className="text-2xl font-bold">
                        {form.watch('actualDistance') || form.watch('totalDistance')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes supplémentaires</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes supplémentaires sur la tournée..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la tournée'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  if (trigger) {
    return (
      <div>
        {trigger}
        <FormContent />
      </div>
    );
  }

  return <FormContent />;
};
