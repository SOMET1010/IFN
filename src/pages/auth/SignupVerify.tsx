import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function SignupVerify() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);

    setTimeout(() => {
      toast({
        title: "Email envoyé",
        description: "Un nouvel email de vérification a été envoyé à votre adresse.",
      });
      setIsResending(false);
    }, 1500);
  };

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Mail className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Vérifiez votre email</h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Dernière étape pour activer votre compte
          </p>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium">Type de compte</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 rounded-full border-2 border-muted flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Email de vérification envoyé</CardTitle>
            <CardDescription className="text-base">
              Nous avons envoyé un email de vérification à :
            </CardDescription>
            {user?.email && (
              <p className="text-lg font-semibold text-primary mt-2">
                {user.email}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Prochaines étapes
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>Consultez votre boîte de réception</li>
                    <li>Cliquez sur le lien de vérification dans l'email</li>
                    <li>Revenez vous connecter à votre compte</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Vous ne voyez pas l'email ?</strong> Vérifiez votre dossier spam ou courrier indésirable.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renvoyer l'email de vérification
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ivoire"
                size="lg"
                onClick={handleContinue}
                className="w-full"
              >
                Aller à la page de connexion
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide ?{' '}
            <button
              onClick={() => navigate('/support')}
              className="text-primary font-medium hover:underline"
            >
              Contactez le support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
