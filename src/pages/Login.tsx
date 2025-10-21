import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, AlertCircle, Eye, EyeOff, Mail, User } from 'lucide-react';
import { validateLoginForm } from '@/lib/validations';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});
  const { login, isLoading, error, clearError, requiresProfile, requiresVerification, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle navigation based on auth state
  React.useEffect(() => {
    if (isAuthenticated) {
      if (requiresVerification) {
        navigate('/signup/verify');
      } else if (requiresProfile) {
        navigate('/signup/details');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, requiresProfile, requiresVerification, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFieldErrors({});

    // Client-side validation
    const validationErrors = validateLoginForm({ email, password });
    if (validationErrors.length > 0) {
      const emailError = validationErrors.find(err => err.toLowerCase().includes('email') || err.toLowerCase().includes('téléphone'));
      const passwordError = validationErrors.find(err => err.toLowerCase().includes('mot de passe'));

      setFieldErrors({
        email: emailError,
        password: passwordError
      });

      toast({
        title: "Erreurs de validation",
        description: validationErrors.join('. '),
        variant: "destructive",
      });
      return;
    }

    const success = await login(email, password, rememberMe);

    if (success) {
      // La navigation est gérée par l'effet ci-dessus
      toast({
        title: "Connexion réussie",
        description: "Bienvenue dans l'écosystème d'inclusion numérique",
      });
    } else {
      // Error is already handled by AuthContext
      if (error) {
        let description = error.message;

        // Gérer les erreurs spécifiques
        if (error.code === 'ACCOUNT_NOT_VERIFIED') {
          description = "Veuillez vérifier votre email avant de vous connecter. Un email de vérification vous a été envoyé.";
        } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
          description = "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
        }

        toast({
          title: "Erreur de connexion",
          description,
          variant: "destructive",
        });
      }
    }
  };

  const handleMobileMoney = () => {
    navigate('/login/mobile-money');
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }

    // Clear field-specific error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Inclusion Numérique</h1>
          <p className="text-muted-foreground">Connectez-vous à votre compte</p>
        </div>

        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardContent className="pt-8">
            {/* Messages d'état */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-destructive">
                      {error.message}
                    </p>
                    {error.code === 'ACCOUNT_NOT_VERIFIED' && (
                      <button
                        onClick={() => {/* TODO: Renvoyer l'email de vérification */}}
                        className="text-xs text-destructive hover:underline"
                      >
                        Renvoyer l'email de vérification
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Messages d'information */}
            {requiresProfile && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Veuillez compléter votre profil pour continuer
                </p>
              </div>
            )}

            {requiresVerification && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Veuillez vérifier votre email pour continuer
                </p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email ou téléphone
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="votre@email.com"
                    className={`h-12 pl-10 ${fieldErrors.email ? 'border-destructive focus:border-destructive' : ''}`}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={`h-12 pr-12 ${fieldErrors.password ? 'border-destructive focus:border-destructive' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
                )}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-primary hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal">
                    Se souvenir de moi
                  </Label>
                </div>
              </div>

              <Button
                type="button"
                variant="ivoire"
                className="w-full h-12 justify-center space-x-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                onClick={handleMobileMoney}
              >
                <Smartphone className="h-5 w-5" />
                <span>Connexion avec Mobile Money</span>
              </Button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">Ou avec votre email</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full h-12 rounded-lg border-2 hover:bg-accent transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Se connecter avec Email
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup/role')}
                  className="text-primary font-medium hover:underline transition-colors"
                >
                  Créer un compte
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informations */}
        <div className="text-center space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800 mb-2">✅ Connexion la plus simple</p>
            <p className="text-xs text-green-700">
              Utilisez votre numéro Mobile Money (Orange, MTN, Moov)
              <br />
              Pas besoin d'email ou de mot de passe !
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Démo : marchand1@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
};
