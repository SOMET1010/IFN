import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, EyeOff, Store, Sprout, Users, Loader2 } from 'lucide-react';

type UserRole = 'merchant' | 'producer' | 'cooperative';

interface LocationState {
  role?: UserRole;
}

const roleLabels: Record<UserRole, string> = {
  merchant: 'Commerçant',
  producer: 'Producteur',
  cooperative: 'Coopérative',
};

const roleIcons: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  merchant: Store,
  producer: Sprout,
  cooperative: Users,
};

export default function SignupDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '',
    businessName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.role) {
      setRole(state.role);
    } else {
      toast({
        title: "Sélection de rôle manquante",
        description: "Veuillez d'abord sélectionner un type de compte.",
        variant: "destructive",
      });
      navigate('/signup/role');
    }
  }, [location, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.location.trim()) {
      errors.location = 'La localisation est requise';
    }

    if (role === 'merchant' || role === 'cooperative') {
      if (!formData.businessName.trim()) {
        errors.businessName = role === 'merchant' ? 'Le nom de la boutique est requis' : 'Le nom de la coopérative est requis';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        title: "Erreur",
        description: "Type de compte non défini.",
        variant: "destructive",
      });
      navigate('/signup/role');
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs dans le formulaire.",
        variant: "destructive",
      });
      return;
    }

    const result = await signup({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role,
      phone: formData.phone || undefined,
      location: formData.location,
      businessName: formData.businessName || undefined,
    });

    if (result.success) {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });

      if (result.requiresVerification) {
        navigate('/signup/verify');
      } else {
        navigate('/signup/success');
      }
    } else if (result.error) {
      toast({
        title: "Erreur d'inscription",
        description: result.error.message,
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/signup/role');
  };

  if (!role) {
    return null;
  }

  const RoleIcon = roleIcons[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <RoleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Informations du compte</h1>
          <p className="text-muted-foreground text-base">
            Type de compte : <span className="font-semibold text-foreground">{roleLabels[role]}</span>
          </p>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Type de compte</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Créez votre compte {roleLabels[role]}</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour créer votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Votre nom complet"
                    className={fieldErrors.name ? 'border-destructive' : ''}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    className={fieldErrors.email ? 'border-destructive' : ''}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+225 XX XX XX XX XX"
                    className={fieldErrors.phone ? 'border-destructive' : ''}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-destructive">{fieldErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ville, Commune"
                    className={fieldErrors.location ? 'border-destructive' : ''}
                  />
                  {fieldErrors.location && (
                    <p className="text-xs text-destructive">{fieldErrors.location}</p>
                  )}
                </div>
              </div>

              {(role === 'merchant' || role === 'cooperative') && (
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    {role === 'merchant' ? 'Nom de la boutique *' : 'Nom de la coopérative *'}
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder={role === 'merchant' ? 'Nom de votre boutique' : 'Nom de votre coopérative'}
                    className={fieldErrors.businessName ? 'border-destructive' : ''}
                  />
                  {fieldErrors.businessName && (
                    <p className="text-xs text-destructive">{fieldErrors.businessName}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Au moins 8 caractères"
                      className={fieldErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirmer le mot de passe"
                      className={fieldErrors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>

                <Button
                  type="submit"
                  variant="ivoire"
                  size="lg"
                  disabled={isLoading}
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
