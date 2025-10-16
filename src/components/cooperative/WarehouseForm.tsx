import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Warehouse as WarehouseIcon, AlertTriangle } from 'lucide-react';
import {
  warehouseSchema,
  warehouseZoneSchema,
  WarehouseFormData,
  WarehouseZoneFormData,
  Warehouse,
} from '@/services/cooperative/warehouseService';

interface WarehouseFormProps {
  warehouse?: Warehouse;
  onSuccess: (warehouse: Warehouse) => void;
  trigger?: React.ReactNode;
}

const zoneFormSchema = warehouseZoneSchema.extend({
  _tempId: z.string(), // Pour le fonctionnement du field array
});

type ZoneFormData = z.infer<typeof zoneFormSchema>;

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  warehouse,
  onSuccess,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Valeurs par défaut pour l'édition
  const defaultValues: Partial<WarehouseFormData> = warehouse
    ? {
        name: warehouse.name,
        location: warehouse.location,
        type: warehouse.type,
        totalCapacity: warehouse.totalCapacity,
        usedCapacity: warehouse.usedCapacity,
        capacityUnit: warehouse.capacityUnit,
        temperature: warehouse.temperature,
        humidity: warehouse.humidity,
        ventilation: warehouse.ventilation,
        securityLevel: warehouse.securityLevel,
        accessControl: warehouse.accessControl,
        status: warehouse.status,
        manager: warehouse.manager,
        contact: warehouse.contact,
        operatingHours: warehouse.operatingHours,
        lastInspection: warehouse.lastInspection,
        nextMaintenance: warehouse.nextMaintenance,
        certifications: warehouse.certifications,
        zones: warehouse.zones,
      }
    : {
        name: '',
        location: '',
        type: 'Entrepôt général',
        totalCapacity: 0,
        usedCapacity: 0,
        capacityUnit: 'm²',
        temperature: '18-22°C',
        humidity: '60-65%',
        ventilation: 'Contrôlée',
        securityLevel: 'Élevée',
        accessControl: 'Badge',
        status: 'operational',
        manager: '',
        contact: '',
        operatingHours: '08:00-18:00',
        lastInspection: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        certifications: [],
        zones: [],
      };

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues,
  });

  const {
    fields: zoneFields,
    append: appendZone,
    remove: removeZone,
    update: updateZone,
  } = useFieldArray({
    control: form.control,
    name: 'zones',
  });

  const [certificationsInput, setCertificationsInput] = useState(
    warehouse?.certifications?.join(', ') || ''
  );

  const onSubmit = async (data: WarehouseFormData) => {
    setIsSubmitting(true);
    try {
      // Gérer les certifications
      const certifications = certificationsInput
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const finalData = {
        ...data,
        certifications,
      };

      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (warehouse) {
        // Mise à jour
        const updatedWarehouse = {
          ...warehouse,
          ...finalData,
          zones: finalData.zones.map((zone, index) => ({
            ...zone,
            id: warehouse.zones[index]?.id || `zone-${Date.now()}-${index}`,
          })),
        };
        onSuccess(updatedWarehouse);
      } else {
        // Création
        const newWarehouse = {
          ...finalData,
          id: `WH-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          zones: finalData.zones.map((zone, index) => ({
            id: `zone-${Date.now()}-${index}`,
            name: zone.name || '',
            capacity: zone.capacity || 0,
            used: zone.used || 0,
            products: zone.products || [],
          })),
        } as Warehouse;
        onSuccess(newWarehouse);
      }

      setOpen(false);
      form.reset();
      setCertificationsInput('');
    } catch (error) {
      console.error('Error submitting warehouse form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewZone = () => {
    const newZone: ZoneFormData = {
      _tempId: `temp-${Date.now()}`,
      name: '',
      capacity: 100,
      used: 0,
      products: [],
    };
    appendZone(newZone);
  };

  const handleZoneProductsChange = (zoneIndex: number, productsInput: string) => {
    const products = productsInput
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const currentZone = zoneFields[zoneIndex];
    if (currentZone) {
      updateZone(zoneIndex, {
        ...currentZone,
        products,
      });
    }
  };

  const defaultTrigger = (
    <Button variant="ivoire" className="gap-2">
      <WarehouseIcon className="h-4 w-4" />
      {warehouse ? 'Modifier' : 'Nouvel Entrepôt'}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger || defaultTrigger}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {warehouse ? 'Modifier l\'entrepôt' : 'Créer un nouvel entrepôt'}
          </DialogTitle>
          <DialogDescription>
            {warehouse
              ? 'Modifiez les informations de l\'entrepôt existant.'
              : 'Remplissez les informations pour créer un nouvel entrepôt.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entrepôt *</FormLabel>
                      <FormControl>
                        <Input placeholder="Entrepôt Principal - Zone Est" {...field} />
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
                        <Input placeholder="Abidjan, Port-Bouët" {...field} />
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
                      <FormLabel>Type d'entrepôt *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Entrepôt général">Entrepôt général</SelectItem>
                          <SelectItem value="Stockage frigorifique">Stockage frigorifique</SelectItem>
                          <SelectItem value="Silo de stockage">Silo de stockage</SelectItem>
                          <SelectItem value="Magasin">Magasin</SelectItem>
                          <SelectItem value="Dépôt">Dépôt</SelectItem>
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
                      <FormLabel>Statut *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="operational">Opérationnel</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="closed">Fermé</SelectItem>
                          <SelectItem value="planning">En planification</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Capacité et conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capacité et conditions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="totalCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité totale *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2000"
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
                  name="usedCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité utilisée *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1650"
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
                  name="capacityUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unité de capacité *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="m²">m²</SelectItem>
                          <SelectItem value="m³">m³</SelectItem>
                          <SelectItem value="tonnes">tonnes</SelectItem>
                          <SelectItem value="unités">unités</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Température *</FormLabel>
                      <FormControl>
                        <Input placeholder="18-22°C" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="humidity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Humidité *</FormLabel>
                      <FormControl>
                        <Input placeholder="60-65%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ventilation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ventilation *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de ventilation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Contrôlée">Contrôlée</SelectItem>
                          <SelectItem value="Forcée">Forcée</SelectItem>
                          <SelectItem value="Naturelle">Naturelle</SelectItem>
                          <SelectItem value="Climatisée">Climatisée</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sécurité et gestion */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sécurité et gestion</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="securityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau de sécurité *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Niveau de sécurité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Élevée">Élevée</SelectItem>
                          <SelectItem value="Moyenne">Moyenne</SelectItem>
                          <SelectItem value="Faible">Faible</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accessControl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contrôle d'accès *</FormLabel>
                      <FormControl>
                        <Input placeholder="Badge + Biométrie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsable *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kouadio Amani" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact *</FormLabel>
                      <FormControl>
                        <Input placeholder="+225 01 02 03 04" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horaires d'ouverture *</FormLabel>
                      <FormControl>
                        <Input placeholder="24h/24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastInspection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dernière inspection *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextMaintenance"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Prochaine maintenance *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <FormItem>
                  <FormLabel>Certifications (séparées par des virgules)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ISO 22000, HACCP, Certification Bio"
                      value={certificationsInput}
                      onChange={(e) => setCertificationsInput(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Entrez les certifications séparées par des virgules
                  </FormDescription>
                </FormItem>
              </CardContent>
            </Card>

            {/* Zones de stockage */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Zones de stockage
                  <Button type="button" variant="outline" size="sm" onClick={addNewZone}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une zone
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {zoneFields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune zone de stockage définie
                  </p>
                ) : (
                  zoneFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Zone {index + 1}</h4>
                        {zoneFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeZone(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`zones.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de la zone</FormLabel>
                              <FormControl>
                                <Input placeholder="Zone A - Cacao" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`zones.${index}.capacity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacité</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="800"
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
                          name={`zones.${index}.used`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Utilisé</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="650"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormLabel>Produits stockés</FormLabel>
                        <Textarea
                          placeholder="Fèves de cacao, Intrants, Matériel"
                          defaultValue={field.products?.join(', ') || ''}
                          onChange={(e) => handleZoneProductsChange(index, e.target.value)}
                        />
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.products?.map((product, productIndex) => (
                            <Badge key={productIndex} variant="outline" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : warehouse ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
