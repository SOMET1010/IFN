import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function SignupSuccess() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const handleExplore = () => {
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <CheckCircle2 className="h-14 w-14 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 animate-bounce">
                <Sparkles className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Compte créé avec succès !
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Bienvenue dans l'écosystème d'inclusion numérique
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Votre compte est prêt</CardTitle>
            <CardDescription className="text-base">
              Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Prochaines étapes
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Complétez votre profil
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Ajoutez vos informations professionnelles pour une meilleure expérience
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Explorez la marketplace
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Découvrez les produits et services disponibles
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Configurez vos préférences
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Personnalisez votre expérience selon vos besoins
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="ivoire"
                size="lg"
                onClick={handleContinue}
                className="w-full"
              >
                Accéder à mon tableau de bord
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExplore}
                className="w-full"
              >
                Explorer la marketplace
              </Button>
            </div>

            {user && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Connecté en tant que{' '}
                  <span className="font-semibold text-foreground">{user.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Besoin d'aide pour démarrer ?
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Consultez notre guide de démarrage rapide ou contactez notre équipe de support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
