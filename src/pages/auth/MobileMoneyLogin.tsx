import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { socialAuthService } from '@/services/auth/socialAuthService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MobileMoneyLogin = () => {
  const [provider, setProvider] = useState<'orange' | 'mtn' | 'moov'>('orange');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSendCode = async () => {
    if (!phone || phone.trim().length < 8) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await socialAuthService.authenticateWithMobileMoney(phone, provider);

      if (result.success && result.otpSent) {
        setSessionId(result.sessionId);
        setStep('otp');
        toast({
          title: 'Code envoyé',
          description: `Un code OTP a été envoyé au ${phone}. En démo, le code est affiché dans la console.`,
        });
      } else {
        setError(result.error || 'Erreur lors de l\'envoi du code');
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de l\'envoi du code',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Une erreur est survenue lors de l\'envoi du code');
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'phone') {
      await handleSendCode();
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Veuillez entrer le code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await socialAuthService.verifyMobileMoneyOTP(sessionId, otp);

      if (result.success && result.userId) {
        toast({
          title: 'Connexion réussie',
          description: 'Bienvenue dans votre espace Mobile Money',
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        setError(result.error || 'Code incorrect');
        toast({
          title: 'Erreur',
          description: result.error || 'Code incorrect',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Une erreur est survenue lors de la vérification');
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError(null);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="absolute left-6 top-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Connexion Mobile Money</h1>
          <p className="text-muted-foreground mt-2">
            {step === 'phone'
              ? 'Connectez-vous avec votre portefeuille mobile'
              : 'Entrez le code reçu par SMS'}
          </p>
        </div>

        <Card className="border border-border/80 shadow-soft">
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 'phone' ? (
                <>
                  <div className="space-y-2">
                    <Label>Opérateur Mobile Money</Label>
                    <Select value={provider} onValueChange={(val) => setProvider(val as 'orange' | 'mtn' | 'moov')}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orange">🟠 Orange Money</SelectItem>
                        <SelectItem value="mtn">🟡 MTN Mobile Money</SelectItem>
                        <SelectItem value="moov">🔵 Moov Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError(null);
                      }}
                      placeholder="Ex: 0102030405 ou +2250102030405"
                      className="h-12"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Format accepté: 0XXXXXXXX ou +225XXXXXXXX
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <p className="text-center text-sm text-muted-foreground mb-4">
                      Code envoyé à <strong>{phone}</strong>
                    </p>
                    <Label htmlFor="otp">Code de vérification (6 chiffres)</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setOtp(value);
                        setError(null);
                      }}
                      placeholder="000000"
                      className="h-12 text-center text-2xl tracking-widest font-mono"
                      required
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={handleSendCode}
                        disabled={isLoading}
                        className="text-sm text-primary hover:underline disabled:opacity-50"
                      >
                        Renvoyer le code
                      </button>
                      <p className="text-xs text-muted-foreground">
                        Code valide 5 minutes
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-800">
                      💡 <strong>Mode démo:</strong> Le code OTP est affiché dans la console du navigateur (F12)
                    </AlertDescription>
                  </Alert>
                </>
              )}

              <Button type="submit" className="w-full h-12" variant="ivoire" disabled={isLoading}>
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {step === 'phone' ? 'Envoi du code...' : 'Vérification...'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    {step === 'phone' ? 'Recevoir le code' : 'Vérifier et se connecter'}
                  </span>
                )}
              </Button>

              {step === 'phone' && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-2 text-muted-foreground">OU</span>
                    </div>
                  </div>

                  <Button type="button" variant="outline" className="w-full h-12" onClick={() => navigate('/login')}>
                    Se connecter avec Email / Mot de passe
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileMoneyLogin;

