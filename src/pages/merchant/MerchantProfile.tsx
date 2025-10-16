import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  FileText,
  Upload,
  Edit,
  CheckCircle,
  Camera,
  Building,
  Truck,
  CreditCard,
  Star,
  Shield,
  Globe,
  Clock,
  TrendingUp,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import MerchantLayout from '@/components/merchant/MerchantLayout';

interface MerchantProfile {
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  region: string;
  description: string;
  businessHours: string;
  establishedYear: number;
  employeeCount: number;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  certifications: string[];
  specialties: string[];
  languages: string[];
  paymentMethods: string[];
  deliveryOptions: string[];
  businessDocuments: {
    businessLicense: File | null;
    taxCertificate: File | null;
    insurance: File | null;
    permits: File | null;
  };
  profileImage: File | null;
  rating: number;
  reviewCount: number;
  memberSince: string;
  lastUpdated: string;
}

const MerchantProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<MerchantProfile>({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    taxId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    description: '',
    businessHours: '',
    establishedYear: new Date().getFullYear(),
    employeeCount: 1,
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    },
    certifications: [],
    specialties: [],
    languages: ['Français'],
    paymentMethods: ['Mobile Money'],
    deliveryOptions: [],
    businessDocuments: {
      businessLicense: null,
      taxCertificate: null,
      insurance: null,
      permits: null
    },
    profileImage: null,
    rating: 4.5,
    reviewCount: 127,
    memberSince: '2023-01-15',
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [newCertification, setNewCertification] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    calculateCompletion();
  }, [profile]);

  const loadProfile = () => {
    // Simuler le chargement du profil depuis le service
    const mockProfile: MerchantProfile = {
      businessName: 'Boutique Agricole Fresh',
      businessType: 'épicerie',
      registrationNumber: 'RC-ABJ-2023-1234',
      taxId: 'IT-123456789',
      phone: '+225 07 89 12 34 56',
      email: 'contact@freshboutique.ci',
      address: 'Rue du Commerce, Cocody',
      city: 'Abidjan',
      region: 'Lagunes',
      description: 'Spécialiste en produits frais et locaux, nous offrons une sélection de fruits et légumes de saison directement producteurs locaux.',
      businessHours: 'Lun-Sam: 7h-19h, Dim: 8h-14h',
      establishedYear: 2020,
      employeeCount: 5,
      website: 'https://freshboutique.ci',
      socialMedia: {
        facebook: 'freshboutiqueci',
        instagram: 'freshboutique.ci'
      },
      certifications: ['Certification BIO', 'HACCP', 'ISO 22000'],
      specialties: ['Fruits tropicaux', 'Légumes locaux', 'Produits bio'],
      languages: ['Français', 'Anglais'],
      paymentMethods: ['Mobile Money', 'Carte Bancaire', 'Espèces', 'Crédit'],
      deliveryOptions: ['Livraison à domicile', 'Click & Collect', 'Livraison express'],
      businessDocuments: {
        businessLicense: null,
        taxCertificate: null,
        insurance: null,
        permits: null
      },
      profileImage: null,
      rating: 4.7,
      reviewCount: 156,
      memberSince: '2023-01-15',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProfile(mockProfile);
  };

  const calculateCompletion = () => {
    const fields = [
      profile.businessName,
      profile.businessType,
      profile.registrationNumber,
      profile.taxId,
      profile.phone,
      profile.email,
      profile.address,
      profile.city,
      profile.region,
      profile.description,
      profile.businessHours
    ];

    const completed = fields.filter(field => field && field.trim() !== '').length;
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletionPercentage(percentage);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString().split('T')[0]
      }));
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profile.languages.includes(newLanguage.trim())) {
      setProfile(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setProfile(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (field: keyof MerchantProfile['businessDocuments'], file: File) => {
    setProfile(prev => ({
      ...prev,
      businessDocuments: {
        ...prev.businessDocuments,
        [field]: file
      }
    }));
  };

  const getProfileCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <MerchantLayout 
      title="Profil Professionnel" 
      showBackButton={true} 
      backTo="/merchant/dashboard"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header avec completion du profil */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {profile.businessName || 'Mon Profil Professionnel'}
              </h1>
              <p className="text-muted-foreground">
                Gérez vos informations professionnelles et documents
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getProfileCompletionColor(completionPercentage)}`}>
                {completionPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Profil complété</div>
            </div>
          </div>
          <Progress value={completionPercentage} className="w-full h-2" />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="business">Informations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Carte principale */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Informations de l'entreprise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nom commercial</Label>
                        <p className="font-semibold">{profile.businessName || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type d'entreprise</Label>
                        <p className="font-semibold">{profile.businessType || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                        <p className="font-semibold">{profile.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="font-semibold">{profile.email}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-muted-foreground">Adresse</Label>
                        <p className="font-semibold">{profile.address}, {profile.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Certifications et Spécialités
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">Certifications</Label>
                      <div className="flex flex-wrap gap-2">
                        {profile.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground mb-2 block">Spécialités</Label>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Colonne latérale */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-1">
                        {profile.rating}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {profile.reviewCount} avis
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Membre depuis</span>
                        <span>{new Date(profile.memberSince).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dernière mise à jour</span>
                        <span>{new Date(profile.lastUpdated).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Méthodes de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.paymentMethods.map((method, index) => (
                        <Badge key={index} variant="outline">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.deliveryOptions.map((option, index) => (
                        <Badge key={index} variant="outline">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Informations */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Informations professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nom commercial *</Label>
                    <Input
                      id="businessName"
                      value={profile.businessName}
                      onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Type d'entreprise *</Label>
                    <Select value={profile.businessType} onValueChange={(value) => setProfile(prev => ({ ...prev, businessType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="épicerie">Épicerie</SelectItem>
                        <SelectItem value="supermarché">Supermarché</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="marché">Marché</SelectItem>
                        <SelectItem value="distribution">Distribution</SelectItem>
                        <SelectItem value="autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Numéro d'enregistrement *</Label>
                    <Input
                      id="registrationNumber"
                      value={profile.registrationNumber}
                      onChange={(e) => setProfile(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      placeholder="RC-XXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Identifiant fiscal *</Label>
                    <Input
                      id="taxId"
                      value={profile.taxId}
                      onChange={(e) => setProfile(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder="IT-XXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+225 XX XX XX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse complète"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Ville"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Région *</Label>
                    <Input
                      id="region"
                      value={profile.region}
                      onChange={(e) => setProfile(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="Région"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description de l'entreprise</Label>
                    <Textarea
                      id="description"
                      value={profile.description}
                      onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre entreprise, vos valeurs, votre mission..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessHours">Horaires d'ouverture</Label>
                    <Input
                      id="businessHours"
                      value={profile.businessHours}
                      onChange={(e) => setProfile(prev => ({ ...prev, businessHours: e.target.value }))}
                      placeholder="Ex: Lun-Sam: 8h-19h"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Année de création</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={profile.establishedYear}
                      onChange={(e) => setProfile(prev => ({ ...prev, establishedYear: parseInt(e.target.value) }))}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Nombre d'employés</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={profile.employeeCount}
                      onChange={(e) => setProfile(prev => ({ ...prev, employeeCount: parseInt(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Site web (optionnel)</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://votresite.ci"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents légaux
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(profile.businessDocuments).map(([key, file]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {key === 'businessLicense' && 'Registre de commerce'}
                          {key === 'taxCertificate' && "Certificat d'imposition"}
                          {key === 'insurance' && 'Assurance professionnelle'}
                          {key === 'permits' && 'Autorisations'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {file ? file.name : 'Non téléversé'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(key as keyof MerchantProfile['businessDocuments'], file);
                          }}
                          className="hidden"
                          id={`file-${key}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById(`file-${key}`)?.click()}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {file ? 'Remplacer' : 'Téléverser'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications et compétences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Certifications</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Ajouter une certification"
                        onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      />
                      <Button type="button" onClick={addCertification} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          {cert}
                          <button
                            onClick={() => removeCertification(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Spécialités</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        placeholder="Ajouter une spécialité"
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      />
                      <Button type="button" onClick={addSpecialty} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {specialty}
                          <button
                            onClick={() => removeSpecialty(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Langues parlées</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Ajouter une langue"
                        onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      />
                      <Button type="button" onClick={addLanguage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((language, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          <Globe className="h-3 w-3" />
                          {language}
                          <button
                            onClick={() => removeLanguage(index)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Préférences */}
          <TabsContent value="preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Méthodes de paiement acceptées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Mobile Money', 'Carte Bancaire', 'Espèces', 'Crédit', 'Virement'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`payment-${method}`}
                          checked={profile.paymentMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile(prev => ({
                                ...prev,
                                paymentMethods: [...prev.paymentMethods, method]
                              }));
                            } else {
                              setProfile(prev => ({
                                ...prev,
                                paymentMethods: prev.paymentMethods.filter(m => m !== method)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`payment-${method}`}>{method}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options de livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Livraison à domicile', 'Click & Collect', 'Livraison express', 'Retrait en magasin'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`delivery-${option}`}
                          checked={profile.deliveryOptions.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfile(prev => ({
                                ...prev,
                                deliveryOptions: [...prev.deliveryOptions, option]
                              }));
                            } else {
                              setProfile(prev => ({
                                ...prev,
                                deliveryOptions: prev.deliveryOptions.filter(o => o !== option)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`delivery-${option}`}>{option}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={profile.socialMedia?.facebook || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialMedia: { ...prev.socialMedia!, facebook: e.target.value }
                      }))}
                      placeholder="votre-page-facebook"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={profile.socialMedia?.instagram || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialMedia: { ...prev.socialMedia!, instagram: e.target.value }
                      }))}
                      placeholder="votre-compte-instagram"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={profile.socialMedia?.twitter || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialMedia: { ...prev.socialMedia!, twitter: e.target.value }
                      }))}
                      placeholder="votre-compte-twitter"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistiques */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avis clients</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.reviewCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Note moyenne: {profile.rating}/5
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.certifications.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Certifications actives
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spécialités</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile.specialties.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Domaines d'expertise
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ancienneté</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date().getFullYear() - profile.establishedYear}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Années d'expérience
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Progression du profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Complétion du profil</span>
                      <span className="text-sm">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} />
                  </div>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Un profil complet inspire confiance aux clients et améliore votre visibilité sur la plateforme.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </MerchantLayout>
  );
};

export default MerchantProfile;
