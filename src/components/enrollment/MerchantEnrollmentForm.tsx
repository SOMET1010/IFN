import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Input,
} from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  IDCard, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  FileText, 
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  MerchantEnrollmentFormData,
  MerchantEnrollmentStatus,
  MarketType,
  MerchantEnrollment,
  EnrollmentDocument
} from '@/types/merchant';
import { merchantEnrollmentService } from '@/services/merchant/merchantEnrollmentService';

// Schéma de validation
const merchantEnrollmentSchema = z.object({
  // Informations de base
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom de famille doit contenir au moins 2 caractères'),
  dateOfBirth: z.string().min(1, 'La date de naissance est requise'),
  nationality: z.string().min(2, 'La nationalité est requise'),
  
  // Coordonnées
  phone: z.string().regex(/^\+?\d{8,15}$/, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  commune: z.string().min(2, 'La commune est requise'),
  market: z.string().min(2, 'Le marché est requis'),
  marketType: z.nativeEnum(MarketType, {
    required_error: 'Le type de marché est requis',
  }),
  
  // Documents d'identité
  cniNumber: z.string().min(5, 'Le numéro de CNI est requis'),
  cniExpiryDate: z.string().optional(),
  cmuNumber: z.string().optional(),
  rstiNumber: z.string().optional(),
  
  // Informations professionnelles
  businessName: z.string().min(2, 'Le nom de l\'entreprise est requis'),
  businessType: z.string().min(2, 'Le type d\'activité est requis'),
  registrationDate: z.string().optional(),
  taxNumber: z.string().optional(),
  
  // Documents
  documents: z.array(z.object({
    type: z.enum(['cni', 'cmu', 'rsti', 'business_license', 'tax_certificate', 'other']),
    file: z.instanceof(File),
    filename: z.string()
  })).min(1, 'Au moins un document est requis'),
});

type MerchantEnrollmentFormValues = z.infer<typeof merchantEnrollmentSchema>;

interface MerchantEnrollmentFormProps {
  onSuccess?: (enrollment: MerchantEnrollment) => void;
  trigger?: React.ReactNode;
  cooperativeId?: string;
  cooperativeName?: string;
}

export const MerchantEnrollmentForm: React.FC<MerchantEnrollmentFormProps> = ({ 
  onSuccess, 
  trigger, 
  cooperativeId,
  cooperativeName 
}) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadedFiles, setUploadedFiles] = useState<{
    type: string;
    file: File;
    filename: string;
    preview?: string;
  }[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const form = useForm<MerchantEnrollmentFormValues>({
    resolver: zodResolver(merchantEnrollmentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: 'Ivoirienne',
      phone: '',
      email: '',
      address: '',
      commune: '',
      market: '',
      marketType: MarketType.TRADITIONAL,
      cniNumber: '',
      cniExpiryDate: '',
      cmuNumber: '',
      rstiNumber: '',
      businessName: '',
      businessType: '',
      registrationDate: '',
      taxNumber: '',
      documents: []
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const filename = file.name;
    
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 10MB');
      return;
    }

    // Créer une prévisualisation pour les images
    let preview: string | undefined;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    // Mettre à jour l'état des fichiers
    setUploadedFiles(prev => {
      // Supprimer un fichier existant du même type
      const filtered = prev.filter(f => f.type !== type);
      return [...filtered, { type, file, filename, preview }];
    });

    // Mettre à jour le formulaire
    form.setValue('documents', [
      ...form.getValues('documents').filter(doc => doc.type !== type),
      { type, file, filename }
    ]);

    // Simuler la progression du téléchargement
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      setUploadProgress(prev => ({ ...prev, [type]: progress }));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
      
      // Nettoyer après un délai
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[type];
          return newProgress;
        });
      }, 1000);
    }, 1500);
  };

  const removeFile = (type: string) => {
    setUploadedFiles(prev => prev.filter(f => f.type !== type));
    form.setValue('documents', form.getValues('documents').filter(doc => doc.type !== type));
  };

  const onSubmit = async (data: MerchantEnrollmentFormValues) => {
    setIsSubmitting(true);
    setFormErrors([]);

    try {
      const enrollmentData: MerchantEnrollmentFormData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim(),
        address: data.address.trim(),
        commune: data.commune.trim(),
        market: data.market.trim(),
        marketType: data.marketType,
        cniNumber: data.cniNumber.trim(),
        cniExpiryDate: data.cniExpiryDate,
        cmuNumber: data.cmuNumber?.trim(),
        rstiNumber: data.rstiNumber?.trim(),
        businessName: data.businessName.trim(),
        businessType: data.businessType.trim(),
        registrationDate: data.registrationDate,
        taxNumber: data.taxNumber?.trim(),
        documents: data.documents.map(doc => ({
          type: doc.type as 'cni' | 'cmu' | 'rsti' | 'business_license' | 'tax_certificate' | 'other',
          file: doc.file,
          filename: doc.filename
        }))
      };

      const result = await merchantEnrollmentService.createEnrollment(enrollmentData);
      
      if (result.success && result.data) {
        // Si une coopérative est fournie, activer immédiatement l'enrôlement
        if (cooperativeId && cooperativeName) {
          await merchantEnrollmentService.activateEnrollment(
            result.data.id, 
            cooperativeId, 
            cooperativeName
          );
        }
        
        onSuccess?.(result.data);
        setOpen(false);
        form.reset();
        setUploadedFiles([]);
      } else {
        setFormErrors([result.error || 'Une erreur est survenue lors de l\'enrôlement']);
      }
    } catch (error) {
      setFormErrors(['Une erreur est survenue lors de l\'enrôlement']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const marketTypeOptions = [
    { value: MarketType.TRADITIONAL, label: 'Marché traditionnel' },
    { value: MarketType.MODERN, label: 'Marché moderne' },
    { value: MarketType.STREET, label: 'Marché de rue' },
    { value: MarketType.MARKET_HALL, label: 'Hall de marché' },
  ];

  const businessTypeOptions = [
    { value: 'epicerie', label: 'Épicerie' },
    { value: 'marchand_de_fruits_legumes', label: 'Fruits et légumes' },
    { value: 'boulangerie', label: 'Boulangerie' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'marchand_de_viande', label: 'Boucherie' },
    { value: 'marchand_de_poisson', label: 'Poissonnerie' },
    { value: 'marchand_de_vetements', label: 'Vêtements' },
    { value: 'autres', label: 'Autres' },
  ];

  const documentTypes = [
    { value: 'cni', label: 'CNI', required: true, icon: <IDCard className="h-4 w-4" /> },
    { value: 'cmu', label: 'CMU', icon: <FileText className="h-4 w-4" /> },
    { value: 'rsti', label: 'RSTI', icon: <FileText className="h-4 w-4" /> },
    { value: 'business_license', label: 'Registre de commerce', icon: <Building className="h-4 w-4" /> },
    { value: 'tax_certificate', label: 'Attestation fiscale', icon: <FileText className="h-4 w-4" /> },
    { value: 'other', label: 'Autre', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <User className="h-4 w-4" />
            S\'enregistrer comme marchand
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Enrôlement de marchand
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Remplissez ce formulaire pour rejoindre la coopérative
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Affichage des erreurs globales */}
            {formErrors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Erreurs:</p>
                      <ul className="text-sm text-red-700 mt-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de famille *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de famille" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationalité *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ivoirienne, Burkinabè..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Coordonnées */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone *</FormLabel>
                        <FormControl>
                          <Input placeholder="+225 XX XX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse complète" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="commune"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commune *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Cocody, Abobo..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="market"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marché *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du marché" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marketType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de marché *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {marketTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Documents d'identité */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IDCard className="h-5 w-5" />
                    Documents d'identité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cniNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de CNI *</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro de CNI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cniExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'expiration de la CNI (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cmuNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro CMU (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro de CMU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rstiNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro RSTI (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro RSTI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Informations professionnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Informations professionnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'entreprise *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de l'entreprise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'activité *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'enregistrement (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro fiscal (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="Numéro fiscal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Documents à télécharger */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents à télécharger
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documentTypes.map((docType) => {
                      const uploadedFile = uploadedFiles.find(f => f.type === docType.value);
                      const progress = uploadProgress[docType.value];
                      
                      return (
                        <div key={docType.value} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {docType.icon}
                              <span className="font-medium">{docType.label}</span>
                              {docType.required && <Badge variant="destructive" className="text-xs">Requis</Badge>}
                            </div>
                            {uploadedFile && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(docType.value)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>

                          {!uploadedFile ? (
                            <div className="space-y-2">
                              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="h-4 w-4 text-gray-500 mb-2" />
                                  <p className="text-xs text-gray-500">
                                    {docType.required ? 'Télécharger' : 'Optionnel'}
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileUpload(e, docType.value)}
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {progress !== undefined && progress < 100 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  <span>Téléchargement: {Math.round(progress)}%</span>
                                </div>
                              )}
                              
                              {progress === 100 && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Document téléchargé</span>
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-600 truncate">
                                {uploadedFile.filename}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Soumettre
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
