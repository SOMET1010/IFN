import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { EnhancedAuthServiceAPI } from '@/services/auth/enhancedAuthService';

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(identifier);

      if (!identifier.trim()) {
        setError('Veuillez entrer un email ou un numéro de téléphone');
        setIsLoading(false);
        return;
      }

      // Request password reset
      const result = await EnhancedAuthServiceAPI.requestPasswordReset(identifier);

      toast({
        title: 'Vérifiez vos messages',
        description: result.message,
      });

      setSuccess(true);

    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Mot de passe oublié ?</h1>
          <p className="text-muted-foreground mt-2">Entrez votre email ou numéro pour réinitialiser</p>
        </div>

        <Card className="border border-border/80 shadow-soft">
          <CardContent className="pt-6">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Instructions envoyées !</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vérifiez votre boîte mail ou vos SMS pour les instructions de réinitialisation.
                  </p>
                </div>
                <Button type="button" variant="outline" className="w-full h-12" onClick={() => navigate('/login')}>
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Numéro de téléphone ou email</Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex: 0102030405 ou votre@email.ci"
                    className="h-12"
                    required
                  />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <Button type="submit" className="w-full h-12" variant="ivoire" disabled={isLoading}>
                  {isLoading ? 'Envoi en cours…' : 'Envoyer les instructions'}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">OU</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full h-12" onClick={() => navigate('/login')}>
                  Retour à la connexion
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

