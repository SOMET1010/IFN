import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPreferences } from '@/components/ui/user-preferences';
import { AccountManagement } from '@/components/producer/AccountManagement';
import { ArrowLeft, ShoppingBag, Settings, History, Heart, Shield, User } from 'lucide-react';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

export const UserPreferencesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preferences');

  const handleBack = () => {
    // Rediriger vers le dashboard approprié selon le rôle de l'utilisateur
    if (user?.role) {
      switch (user.role) {
        case 'producer':
          navigate('/producer/dashboard');
          break;
        case 'merchant':
          navigate('/merchant/dashboard');
          break;
        case 'cooperative':
          navigate('/cooperative/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      navigate(-1);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connectez-vous pour accéder à vos préférences
            </h3>
            <p className="text-gray-500">
              Vous devez être connecté pour gérer vos préférences utilisateur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Retour"
                onClick={handleBack}
                className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Mon Espace</h1>
                <p className="text-sm text-muted-foreground">
                  Gérez votre profil, vos préférences et votre activité
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" size="icon" aria-label="Paramètres" className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-muted transition-colors">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Préférences
            </TabsTrigger>
            <TabsTrigger value="orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favoris
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="account">
              <Shield className="h-4 w-4 mr-2" />
              Compte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences">
            <UserPreferences />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Mes commandes</CardTitle>
                <CardDescription>
                  Consultez l'historique de vos commandes et leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  La gestion des commandes sera bientôt disponible...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Mes produits favoris</CardTitle>
                <CardDescription>
                  Consultez et gérez vos produits préférés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  La gestion des favoris sera bientôt disponible...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Mon activité</CardTitle>
                <CardDescription>
                  Consultez l'historique de votre activité sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  L'historique d'activité sera bientôt disponible...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <AccountManagement
              producerId={user?.id || ''}
              producerName={user?.name || ''}
              onAccountUpdate={(updates) => {
                console.log('Account updated:', updates);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      <FloatingVoiceNavigator />
    </div>
  );
};