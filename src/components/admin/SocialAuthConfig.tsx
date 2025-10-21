import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { socialAuthService } from '@/services/auth/socialAuthService';
import { CheckCircle, XCircle, ExternalLink, Smartphone, Mail, AlertCircle } from 'lucide-react';

export default function SocialAuthConfig() {
  const providers = socialAuthService.getAvailableProviders();
  const configGuide = socialAuthService.getConfigurationGuide();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuration Authentification Sociale</h2>
        <p className="text-muted-foreground mt-1">
          Gérez les méthodes d'authentification alternatives pour vos utilisateurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fournisseurs d'authentification disponibles</CardTitle>
          <CardDescription>
            État actuel des méthodes d'authentification sociale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {socialAuthService.getAvailableProviders().map((provider) => (
              <Card key={provider.id} className={provider.enabled ? 'border-green-200' : 'border-gray-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {provider.id === 'mobile_money' ? (
                          <Smartphone className="h-5 w-5" />
                        ) : (
                          <Mail className="h-5 w-5" />
                        )}
                        <h3 className="font-semibold">{provider.name}</h3>
                      </div>
                      <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                        {provider.enabled ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Inactif
                          </span>
                        )}
                      </Badge>
                      {provider.requiresConfig && !provider.enabled && (
                        <p className="text-xs text-muted-foreground">
                          Configuration Supabase requise
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mobile_money" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mobile_money">Mobile Money</TabsTrigger>
          <TabsTrigger value="google">Google OAuth</TabsTrigger>
        </TabsList>

        {configGuide.map((guide) => (
          <TabsContent key={guide.provider} value={guide.provider} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{guide.title}</CardTitle>
                <CardDescription>
                  Guide étape par étape pour configurer l'authentification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {guide.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>

                {guide.provider === 'mobile_money' ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Mobile Money est déjà configuré et fonctionnel!</strong>
                      <br />
                      Vos utilisateurs peuvent se connecter avec Orange Money, MTN Mobile Money et Moov Money
                      sans aucune configuration supplémentaire.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Configuration requise:</strong> Pour activer {guide.provider}, vous devez avoir
                      accès au Dashboard Supabase et configurer les clés API appropriées.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a
                      href={guide.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      Documentation
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  {guide.provider === 'google' && (
                    <Button variant="outline" asChild>
                      <a
                        href="https://console.cloud.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        Google Cloud Console
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {guide.provider === 'mobile_money' && (
              <Card>
                <CardHeader>
                  <CardTitle>Comment ça marche?</CardTitle>
                  <CardDescription>
                    Fonctionnement de l'authentification Mobile Money
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">1. L'utilisateur entre son numéro</h4>
                      <p className="text-muted-foreground">
                        L'utilisateur sélectionne son opérateur (Orange, MTN, Moov) et entre son numéro de téléphone
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">2. Envoi du code OTP</h4>
                      <p className="text-muted-foreground">
                        Un code à 6 chiffres est généré et stocké temporairement (en production, envoyé par SMS)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3. Vérification</h4>
                      <p className="text-muted-foreground">
                        L'utilisateur entre le code reçu. Si valide, un compte Supabase est créé automatiquement
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">4. Connexion automatique</h4>
                      <p className="text-muted-foreground">
                        L'utilisateur est connecté avec son compte Mobile Money, sans besoin de mot de passe
                      </p>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Mode démo:</strong> Actuellement, le code OTP est affiché dans la console du navigateur.
                      En production, intégrez les APIs SMS de Orange Money, MTN et Moov Money pour envoyer les codes
                      par SMS réels.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Pourquoi Mobile Money d'abord?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Mobile Money est la méthode d'authentification privilégiée pour plusieurs raisons:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
            <li>Pas besoin d'accès au Dashboard Supabase pour la configuration</li>
            <li>Adapté au contexte local de la Côte d'Ivoire</li>
            <li>La plupart des utilisateurs ont déjà un compte Mobile Money</li>
            <li>Authentification simple sans mémorisation de mot de passe</li>
            <li>Prépare l'intégration future des paiements Mobile Money</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
