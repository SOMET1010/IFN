import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { useAnimatedProgress } from '@/hooks/useAnimatedProgress';
import { EnhancedAuthServiceAPI } from '@/services/auth/enhancedAuthService';
import { NotificationService } from '@/services/auth/notificationService';

const SignupVerify = () => {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Get user data from session storage
  const userData = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('signup_user') || '{}') : null;
  const role = (typeof window !== 'undefined' ? sessionStorage.getItem('signup_role') : null) as 'merchant' | 'producer' | 'cooperative' | null;
  const progress = useAnimatedProgress(100);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    if (!userData || !userData.id || code.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, any 6-digit code will work
      // In production, this would verify against the actual verification token
      if (/^\d{6}$/.test(code)) {
        // Verify email (simulated)
        const verifyResult = await EnhancedAuthServiceAPI.verifyEmail(userData.verificationToken);

        if (verifyResult) {
          setSuccess(true);

          // Keep data for welcome screen; cleanup will be handled there or after
          navigate('/signup/success');
        } else {
          setError('Code de vérification invalide');
        }
      } else {
        setError('Le code doit contenir 6 chiffres');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Erreur lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (seconds === 0 && userData) {
      // Reset timer
      setSeconds(60);
      setError(null);

      // In production, resend verification email/SMS
      console.log('Resending verification code to:', userData.email);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-start py-10 sm:py-16 px-4">
      <div className="w-full max-w-xl">
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vérifiez votre email</CardTitle>
            <CardDescription>
              {userData ? `Saisissez le code à 6 chiffres envoyé à ${userData.email}` : 'Aucune donnée utilisateur trouvée'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600">Compte vérifié avec succès !</h3>
                  <p className="text-sm text-muted-foreground">Redirection vers la page de connexion...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <InputOTP value={code} onChange={setCode} maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <div className="text-center">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="text-center text-sm text-muted-foreground">
                  {seconds > 0 ? (
                    <span>Renvoyer le code dans {seconds}s</span>
                  ) : (
                    <button
                      onClick={handleResendCode}
                      className="text-primary hover:underline font-medium"
                    >
                      Renvoyer le code
                    </button>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate(`/signup/details${role ? `?role=${role}` : ''}`)}>
                    Précédent
                  </Button>
                  <Button onClick={handleVerify} disabled={code.length !== 6 || isLoading} className="min-w-40">
                    {isLoading ? 'Vérification...' : 'Vérifier'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupVerify;
