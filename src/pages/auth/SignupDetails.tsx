import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Camera, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAnimatedProgress } from '@/hooks/useAnimatedProgress';
import { EnhancedAuthServiceAPI } from '@/services/auth/enhancedAuthService';
import { UIEnhancementService } from '@/services/ui/uiEnhancementService';
import { PasswordStrengthService } from '@/services/auth/passwordStrengthService';

// Interface for validation error details
interface ValidationErrorDetails {
  code: string;
  details: {
    validationErrors: string[];
  };
}

const useQuery = () => new URLSearchParams(useLocation().search);

const SignupDetails = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const role = useMemo(() => {
    const r = query.get('role');
    return r === 'merchant' || r === 'producer' || r === 'cooperative' ? r : (sessionStorage.getItem('signup_role') as 'merchant' | 'producer' | 'cooperative' | null);
  }, [query]);

  const [form, setForm] = useState({
    // Champs pour les individus (producteurs, marchands)
    firstName: '',
    lastName: '',
    // Champs pour les coopératives
    cooperativeName: '',
    registrationNumber: '',
    representativeName: '',
    // Champs communs
    email: '',
    phone: '',
    city: '',
    district: '',
    password: '',
    confirmPassword: '',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return navigate('/signup/role');

    // Clear previous errors
    setErrors({});
    setIsLoading(true);

    try {
      // Validate form based on role
      const validationErrors: Record<string, string> = {};

      // Validation commune à tous les rôles
      if (!form.email.trim()) validationErrors.email = 'L\'email est requis';
      if (!form.phone.trim()) validationErrors.phone = 'Le téléphone est requis';
      if (!form.city.trim()) validationErrors.city = 'La ville est requise';
      if (!form.district.trim()) validationErrors.district = 'Le quartier est requis';

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (form.email && !emailRegex.test(form.email)) {
        validationErrors.email = 'Email invalide';
      }

      // Password validation
      const passwordStrength = PasswordStrengthService.checkPasswordStrength(form.password);
      if (passwordStrength.score < 50) {
        validationErrors.password = 'Le mot de passe est trop faible';
      }

      if (form.password !== form.confirmPassword) {
        validationErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }

      // Validation spécifique selon le rôle
      if (role === 'cooperative') {
        if (!form.cooperativeName.trim()) validationErrors.cooperativeName = 'Le nom de la coopérative est requis';
        if (!form.registrationNumber.trim()) validationErrors.registrationNumber = 'Le numéro d\'enregistrement est requis';
        if (!form.representativeName.trim()) validationErrors.representativeName = 'Le nom du représentant est requis';
      } else {
        // Pour les producteurs et marchands (individus)
        if (!form.firstName.trim()) validationErrors.firstName = 'Le prénom est requis';
        if (!form.lastName.trim()) validationErrors.lastName = 'Le nom est requis';
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Préparer les données pour l'inscription selon le rôle
      let userName = '';
      if (role === 'cooperative') {
        userName = form.cooperativeName;
      } else {
        userName = `${form.firstName} ${form.lastName}`;
      }

      // Préparer les données pour l'inscription selon le rôle
      const registrationData = {
        name: userName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: role as 'producer' | 'merchant' | 'cooperative',
        location: `${form.city}, ${form.district}`,
        // Ajouter les champs spécifiques selon le rôle
        ...(role === 'cooperative' ? {
          cooperativeName: form.cooperativeName,
          registrationNumber: form.registrationNumber,
          representativeName: form.representativeName
        } : {
          firstName: form.firstName,
          lastName: form.lastName
        })
      };

      // Register user
      const result = await EnhancedAuthServiceAPI.register(registrationData);

      // Store user data for next step
      sessionStorage.setItem('signup_user', JSON.stringify({
        ...result.user,
        ...form,
        photo,
        location,
        verificationToken: result.verificationToken
      }));

      navigate('/signup/verify');

    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      // Handle validation errors specifically
      if (error instanceof Error && (error as unknown as ValidationErrorDetails).code === 'VALIDATION_ERROR' && (error as unknown as ValidationErrorDetails).details?.validationErrors) {
        const validationError = error as unknown as ValidationErrorDetails;
        // Convert validation errors array to field-specific errors
        const fieldErrors: Record<string, string> = {};
        validationError.details.validationErrors.forEach((errorMessage: string) => {
          // Try to match error messages to specific fields
          if (errorMessage.includes('email')) {
            fieldErrors.email = errorMessage;
          } else if (errorMessage.includes('mot de passe')) {
            fieldErrors.password = errorMessage;
          } else if (errorMessage.includes('ne correspondent pas')) {
            fieldErrors.confirmPassword = errorMessage;
          } else if (errorMessage.includes('nom')) {
            if (role === 'cooperative') {
              fieldErrors.cooperativeName = errorMessage;
            } else {
              fieldErrors.firstName = errorMessage;
              fieldErrors.lastName = errorMessage;
            }
          } else if (errorMessage.includes('téléphone')) {
            fieldErrors.phone = errorMessage;
          } else if (errorMessage.includes('localisation')) {
            fieldErrors.city = errorMessage;
          } else {
            // If no specific field match, add to general errors
            if (!fieldErrors.general) {
              fieldErrors.general = errorMessage;
            } else {
              fieldErrors.general += ', ' + errorMessage;
            }
          }
        });
        setErrors(fieldErrors);
      } else {
        // Handle other types of errors
        setErrors({
          general: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleLabel = {
    merchant: 'Marchand',
    producer: 'Producteur',
    cooperative: 'Coopérative'
  }[role || 'merchant'];
  const progress = useAnimatedProgress(66);

  // handlers for photo + geolocation
  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const requestGeolocation = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Géolocalisation non supportée par ce navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-start py-10 sm:py-16 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Créez votre compte</CardTitle>
            <CardDescription>
              Étape 2: Informations personnelles — Profil: {roleLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleNext}>
              {/* Champs spécifiques pour les coopératives */}
              {role === 'cooperative' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="cooperativeName">Nom de la coopérative</Label>
                    <Input
                      id="cooperativeName"
                      name="cooperativeName"
                      placeholder="Ex: Coopérative des Producteurs de Cacao"
                      value={form.cooperativeName}
                      onChange={handleChange}
                      required
                      className={errors.cooperativeName ? 'border-red-500' : ''}
                    />
                    {errors.cooperativeName && <p className="text-sm text-red-500">{errors.cooperativeName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Numéro d'enregistrement</Label>
                    <Input
                      id="registrationNumber"
                      name="registrationNumber"
                      placeholder="Ex: RC-ABJ-2024-1234"
                      value={form.registrationNumber}
                      onChange={handleChange}
                      required
                      className={errors.registrationNumber ? 'border-red-500' : ''}
                    />
                    {errors.registrationNumber && <p className="text-sm text-red-500">{errors.registrationNumber}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="representativeName">Nom du représentant légal</Label>
                    <Input
                      id="representativeName"
                      name="representativeName"
                      placeholder="Nom complet du représentant"
                      value={form.representativeName}
                      onChange={handleChange}
                      required
                      className={errors.representativeName ? 'border-red-500' : ''}
                    />
                    {errors.representativeName && <p className="text-sm text-red-500">{errors.representativeName}</p>}
                  </div>
                </>
              )}

              {/* Champs pour les individus (producteurs, marchands) */}
              {role !== 'cooperative' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Entrez votre nom"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Entrez votre prénom"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>
                </>
              )}

              {/* Champs communs à tous les rôles */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Ex: 01 23 45 67 89"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Entrez votre ville"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quartier</Label>
                <Input
                  id="district"
                  name="district"
                  placeholder="Entrez votre quartier"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className={errors.district ? 'border-red-500' : ''}
                />
                {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrez votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmez votre mot de passe"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Add photo */}
              <div className="md:col-span-2">
                <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
                <button type="button" onClick={() => document.getElementById('photo-input')?.click()} className="w-full flex items-center gap-3 rounded-md border bg-muted/30 px-4 py-3 text-left hover:bg-muted/50">
                  <Camera className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Ajouter une photo de profil</div>
                    <div className="text-xs text-muted-foreground">
                      {photo ? 'Photo sélectionnée' : 'PNG, JPG, jusqu\'à 5 Mo'}
                    </div>
                  </div>
                </button>
                {photo && (
                  <div className="mt-2">
                    <img src={photo} alt="Prévisualisation" className="h-20 w-20 rounded-full object-cover" />
                  </div>
                )}
              </div>

              {/* Geolocation */}
              <div className="md:col-span-2">
                <button type="button" onClick={requestGeolocation} className="w-full flex items-center gap-3 rounded-md border bg-muted/30 px-4 py-3 text-left hover:bg-muted/50">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Partager ma géolocalisation</div>
                    <div className="text-xs text-muted-foreground">
                      {location ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}` : 'Utiliser votre position actuelle pour améliorer les services'}
                    </div>
                  </div>
                </button>
                {locError && <p className="text-xs text-red-500 mt-1">{locError}</p>}
              </div>

              {errors.general && (
                <div className="md:col-span-2">
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                </div>
              )}

              <div className="md:col-span-2 flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => navigate('/signup/role')}>Précédent</Button>
                <Button type="submit" disabled={isLoading} className="min-w-40">
                  {isLoading ? 'Inscription...' : 'Suivant'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupDetails;
