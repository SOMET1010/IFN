import { useAuth } from '@/contexts/AuthContext';
import { RecommendationEngine } from '@/components/ui/recommendation-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Settings,
  ArrowRight,
  Users,
  MapPin,
  Clock
} from 'lucide-react';

export const RecommendationsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connectez-vous pour accéder aux recommandations
            </h3>
            <p className="text-gray-500 mb-4">
              Découvrez des produits adaptés à vos préférences.
            </p>
            <Button asChild>
              <a href="/login">Se connecter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Recommandations personnelles</h1>
          <p className="text-xl text-gray-600">
            Découvrez des produits sélectionnés spécialement pour vous.
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">
              <Sparkles className="h-4 w-4 mr-2" />
              Recommandations
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Préférences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            <RecommendationEngine maxProducts={16} showTitle={false} />
          </TabsContent>

          <TabsContent value="trending">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Produits tendance</h2>
                <p className="text-gray-600">
                  Découvrez les produits les plus populaires du moment.
                </p>
              </div>

              <RecommendationEngine maxProducts={12} showTitle={false} />
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gérer vos préférences</h2>
                <p className="text-gray-600">
                  Personnalisez vos préférences pour améliorer les recommandations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span>Catégories préférées</span>
                    </CardTitle>
                    <CardDescription>
                      Sélectionnez vos catégories de produits favorites
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Choisissez les catégories qui vous intéressent le plus pour recevoir des recommandations pertinentes.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/user/preferences">
                        Configurer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span>Producteurs préférés</span>
                    </CardTitle>
                    <CardDescription>
                      Suivez vos producteurs favoris
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Suivez vos producteurs préférés pour être notifié de leurs nouveaux produits.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/user/preferences">
                        Configurer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-green-500" />
                      <span>Notifications</span>
                    </CardTitle>
                    <CardDescription>
                      Gérez vos préférences de notification
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Choisissez comment et quand vous souhaitez recevoir des notifications.
                    </p>
                    <Button asChild className="w-full">
                      <a href="/user/preferences">
                        Configurer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};