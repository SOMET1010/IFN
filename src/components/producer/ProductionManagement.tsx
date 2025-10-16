import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Calendar as CalendarIcon,
  MapPin,
  Droplets,
  Sun,
  Cloud,
  Thermometer,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sprout,
  Tractor,
  Package,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface CropCycle {
  id: string;
  product: string;
  variety: string;
  plantingDate: string;
  expectedHarvest: string;
  actualHarvest?: string;
  status: 'planned' | 'planted' | 'growing' | 'ready' | 'harvested';
  area: number; // en hectares
  location: string;
  expectedYield: number;
  actualYield?: number;
  notes?: string;
  irrigationSystem?: string;
  soilType?: string;
  climateConditions?: string;
}

interface WeatherAlert {
  id: string;
  type: 'drought' | 'flood' | 'frost' | 'heat' | 'storm';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedCrops: string[];
  recommendations: string[];
  date: string;
}

interface TreatmentSchedule {
  id: string;
  cropId: string;
  treatmentType: 'fertilizer' | 'pesticide' | 'herbicide' | 'irrigation';
  productName: string;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'completed' | 'overdue';
  dosage: string;
  instructions: string;
}

interface Field {
  id: string;
  name: string;
  area: number;
  location: string;
  soilType: string;
  currentCrop?: string;
  plantingDate?: string;
  expectedHarvest?: string;
  status: 'empty' | 'planted' | 'growing' | 'ready' | 'fallow';
}

const cropCycleSchema = z.object({
  product: z.string().min(1, 'Le produit est requis'),
  variety: z.string().min(1, 'La variété est requise'),
  plantingDate: z.date(),
  expectedHarvest: z.date(),
  area: z.number().min(0.1, 'La superficie doit être supérieure à 0'),
  location: z.string().min(1, 'La localisation est requise'),
  expectedYield: z.number().min(0.1, 'Le rendement attendu doit être supérieur à 0'),
  irrigationSystem: z.string().optional(),
  soilType: z.string().optional(),
  notes: z.string().optional(),
});

type CropCycleFormData = z.infer<typeof cropCycleSchema>;

const mockCropCycles: CropCycle[] = [
  {
    id: '1',
    product: 'Cacao',
    variety: 'Forastero',
    plantingDate: '2024-03-15',
    expectedHarvest: '2024-12-15',
    status: 'growing',
    area: 2.5,
    location: 'Parcelle Nord',
    expectedYield: 1200,
    irrigationSystem: 'Goutte-à-goutte',
    soilType: 'Argileux',
    notes: 'Bon développement, surveillance régulière des maladies'
  },
  {
    id: '2',
    product: 'Café',
    variety: 'Arabica',
    plantingDate: '2024-01-20',
    expectedHarvest: '2024-10-20',
    actualHarvest: '2024-10-15',
    status: 'harvested',
    area: 1.8,
    location: 'Parcelle Sud',
    expectedYield: 800,
    actualYield: 850,
    irrigationSystem: 'Sprinkler',
    soilType: 'Volcanique'
  }
];

const mockWeatherAlerts: WeatherAlert[] = [
  {
    id: '1',
    type: 'drought',
    severity: 'medium',
    message: 'Période de sécheresse prévue dans les 2 prochaines semaines',
    affectedCrops: ['Cacao', 'Café'],
    recommendations: [
      'Augmenter la fréquence d\'irrigation',
      'Apporter du paillage pour conserver l\'humidité',
      'Surveiller l\'état des plants'
    ],
    date: '2024-01-15T10:00:00Z'
  }
];

const mockTreatmentSchedules: TreatmentSchedule[] = [
  {
    id: '1',
    cropId: '1',
    treatmentType: 'fertilizer',
    productName: 'NPK 15-15-15',
    scheduledDate: '2024-02-01',
    dosage: '200kg/ha',
    instructions: 'Appliquer uniformément, incorporer légèrement dans le sol',
    status: 'completed'
  },
  {
    id: '2',
    cropId: '1',
    treatmentType: 'irrigation',
    productName: 'Eau',
    scheduledDate: '2024-02-15',
    dosage: '25mm',
    instructions: 'Irrigation goutte-à-goutte pendant 4 heures',
    status: 'scheduled'
  }
];

const mockFields: Field[] = [
  {
    id: '1',
    name: 'Parcelle Nord',
    area: 2.5,
    location: 'Coordonnées GPS: 6.8277°N, 5.2893°O',
    soilType: 'Argileux',
    currentCrop: 'Cacao',
    plantingDate: '2024-03-15',
    expectedHarvest: '2024-12-15',
    status: 'growing'
  },
  {
    id: '2',
    name: 'Parcelle Sud',
    area: 1.8,
    location: 'Coordonnées GPS: 6.8280°N, 5.2895°O',
    soilType: 'Volcanique',
    status: 'fallow'
  }
];

export function ProductionManagement() {
  const [cropCycles, setCropCycles] = useState<CropCycle[]>(mockCropCycles);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>(mockWeatherAlerts);
  const [treatmentSchedules, setTreatmentSchedules] = useState<TreatmentSchedule[]>(mockTreatmentSchedules);
  const [fields, setFields] = useState<Field[]>(mockFields);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showPlantingDialog, setShowPlantingDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const form = useForm<CropCycleFormData>({
    resolver: zodResolver(cropCycleSchema),
    defaultValues: {
      product: '',
      variety: '',
      plantingDate: new Date(),
      expectedHarvest: new Date(),
      area: 0,
      location: '',
      expectedYield: 0,
    },
  });

  const getStatusBadge = (status: CropCycle['status']) => {
    const variants = {
      planned: "outline",
      planted: "default",
      growing: "secondary",
      ready: "default",
      harvested: "outline"
    } as const;

    const labels = {
      planned: "Planifié",
      planted: "Planté",
      growing: "En croissance",
      ready: "Prêt à récolter",
      harvested: "Récolté"
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getWeatherIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'drought':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'flood':
        return <Droplets className="h-5 w-5 text-blue-500" />;
      case 'frost':
        return <Thermometer className="h-5 w-5 text-blue-300" />;
      case 'heat':
        return <Thermometer className="h-5 w-5 text-red-500" />;
      case 'storm':
        return <Cloud className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTreatmentIcon = (type: TreatmentSchedule['treatmentType']) => {
    switch (type) {
      case 'fertilizer':
        return <Package className="h-4 w-4" />;
      case 'pesticide':
        return <AlertTriangle className="h-4 w-4" />;
      case 'herbicide':
        return <Tractor className="h-4 w-4" />;
      case 'irrigation':
        return <Droplets className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateGrowthProgress = (plantingDate: string, expectedHarvest: string) => {
    const planting = new Date(plantingDate);
    const harvest = new Date(expectedHarvest);
    const now = new Date();

    const totalDuration = harvest.getTime() - planting.getTime();
    const elapsed = now.getTime() - planting.getTime();

    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  };

  const onSubmit = async (data: CropCycleFormData) => {
    try {
      const newCycle: CropCycle = {
        id: Date.now().toString(),
        product: data.product,
        variety: data.variety,
        plantingDate: data.plantingDate.toISOString().split('T')[0],
        expectedHarvest: data.expectedHarvest.toISOString().split('T')[0],
        status: 'planned',
        area: data.area,
        location: data.location,
        expectedYield: data.expectedYield,
        irrigationSystem: data.irrigationSystem,
        soilType: data.soilType,
        notes: data.notes,
      };

      setCropCycles(prev => [...prev, newCycle]);
      form.reset();
      setShowPlantingDialog(false);
    } catch (error) {
      console.error('Erreur lors de la création du cycle:', error);
    }
  };

  const totalArea = fields.reduce((sum, field) => sum + field.area, 0);
  const activeCrops = cropCycles.filter(cycle => ['planted', 'growing', 'ready'].includes(cycle.status)).length;
  const upcomingHarvests = cropCycles.filter(cycle => cycle.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion de la Production</h2>
          <p className="text-muted-foreground">Planifiez et suivez vos cycles de production</p>
        </div>
        <Dialog open={showPlantingDialog} onOpenChange={setShowPlantingDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Sprout className="h-4 w-4" />
              Nouveau cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Planifier un nouveau cycle de culture</DialogTitle>
              <DialogDescription>
                Définissez les paramètres de votre nouveau cycle de production
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Culture *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une culture" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Cacao">Cacao</SelectItem>
                            <SelectItem value="Café">Café</SelectItem>
                            <SelectItem value="Anacarde">Anacarde</SelectItem>
                            <SelectItem value="Manioc">Manioc</SelectItem>
                            <SelectItem value="Igname">Igname</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="variety"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variété *</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Forastero, Arabica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superficie (ha) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="ex: 2.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localisation *</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: Parcelle Nord" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedYield"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rendement attendu (kg/ha) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="ex: 1200"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="irrigationSystem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Système d'irrigation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Système d'irrigation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="goutte-a-goutte">Goutte-à-goutte</SelectItem>
                            <SelectItem value="sprinkler">Sprinkler</SelectItem>
                            <SelectItem value="inondation">Inondation</SelectItem>
                            <SelectItem value="gravitaire">Gravitaire</SelectItem>
                            <SelectItem value="aucun">Aucun</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de plantation *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('plantingDate') ? (
                        format(form.watch('plantingDate'), 'PPP', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                    {showCalendar && (
                      <div className="absolute z-10 bg-white border rounded-md shadow-lg">
                        <Calendar
                          mode="single"
                          selected={form.watch('plantingDate')}
                          onSelect={(date) => {
                            form.setValue('plantingDate', date || new Date());
                            setShowCalendar(false);
                          }}
                          locale={fr}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Date de récolte prévue *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setShowCalendar(!showCalendar)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch('expectedHarvest') ? (
                        format(form.watch('expectedHarvest'), 'PPP', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes et observations..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit">
                    Créer le cycle
                  </Button>
                  <Button variant="outline" onClick={() => setShowPlantingDialog(false)}>
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Superficie totale</p>
                <p className="text-2xl font-bold">{totalArea} ha</p>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cultures actives</p>
                <p className="text-2xl font-bold">{activeCrops}</p>
              </div>
              <Sprout className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Récoltes imminentes</p>
                <p className="text-2xl font-bold">{upcomingHarvests}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Traitements prévus</p>
                <p className="text-2xl font-bold">{treatmentSchedules.filter(t => t.status === 'scheduled').length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Alertes Météo
            </CardTitle>
            <CardDescription>Conditions climatiques à surveiller</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weatherAlerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start gap-3">
                    {getWeatherIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium capitalize">{alert.type}</span>
                        <Badge variant="outline">{alert.severity}</Badge>
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Cultures affectées:</p>
                        <div className="flex gap-1 flex-wrap">
                          {alert.affectedCrops.map((crop, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {crop}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium">Recommandations:</p>
                        <ul className="text-xs list-disc list-inside mt-1">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Crop Cycles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cycles de Production Actifs</CardTitle>
            <CardDescription>Suivez l'état de vos cultures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cropCycles
                .filter(cycle => cycle.status !== 'harvested')
                .map((cycle) => (
                  <div key={cycle.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cycle.product}</span>
                        <Badge variant="outline">{cycle.variety}</Badge>
                        {getStatusBadge(cycle.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">{cycle.area} ha</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{Math.round(calculateGrowthProgress(cycle.plantingDate, cycle.expectedHarvest))}%</span>
                      </div>
                      <Progress
                        value={calculateGrowthProgress(cycle.plantingDate, cycle.expectedHarvest)}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Plantation:</span> {formatDate(cycle.plantingDate)}
                      </div>
                      <div>
                        <span className="font-medium">Récolte prévue:</span> {formatDate(cycle.expectedHarvest)}
                      </div>
                      <div>
                        <span className="font-medium">Rendement attendu:</span> {cycle.expectedYield} kg/ha
                      </div>
                      <div>
                        <span className="font-medium">Localisation:</span> {cycle.location}
                      </div>
                    </div>

                    {cycle.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{cycle.notes}</p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Treatments */}
        <Card>
          <CardHeader>
            <CardTitle>Calendrier des Traitements</CardTitle>
            <CardDescription>Planifiez et suivez vos interventions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentSchedules
                .filter(treatment => treatment.status === 'scheduled')
                .map((treatment) => (
                  <div key={treatment.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getTreatmentIcon(treatment.treatmentType)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{treatment.productName}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {treatment.treatmentType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{treatment.instructions}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(treatment.scheduledDate)}</span>
                        <span>•</span>
                        <span>{treatment.dosage}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Planifié
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble des Parcelles</CardTitle>
          <CardDescription>État et utilisation de vos terrains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{field.name}</span>
                  <Badge variant={field.status === 'growing' ? 'default' : 'outline'}>
                    {field.status === 'growing' ? 'En culture' : field.status === 'fallow' ? 'Jachère' : 'Vide'}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium">Superficie:</span> {field.area} ha</p>
                  <p><span className="font-medium">Type de sol:</span> {field.soilType}</p>
                  <p><span className="font-medium">Localisation:</span> {field.location}</p>
                  {field.currentCrop && (
                    <>
                      <p><span className="font-medium">Culture actuelle:</span> {field.currentCrop}</p>
                      <p><span className="font-medium">Plantation:</span> {formatDate(field.plantingDate!)}</p>
                      <p><span className="font-medium">Récolte prévue:</span> {formatDate(field.expectedHarvest!)}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}