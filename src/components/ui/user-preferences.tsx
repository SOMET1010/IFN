import { useState } from 'react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Star,
  Bell,
  Truck,
  MapPin,
  Mail,
  MessageSquare,
  Settings,
  RefreshCw
} from 'lucide-react';

const categories = [
  { id: 'fruits', label: 'Fruits', color: 'bg-orange-100 text-orange-800' },
  { id: 'legumes', label: 'Légumes', color: 'bg-green-100 text-green-800' },
  { id: 'volaille', label: 'Volaille', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'poissons', label: 'Poissons', color: 'bg-blue-100 text-blue-800' },
  { id: 'cereales', label: 'Céréales', color: 'bg-amber-100 text-amber-800' }
];

const mockProducers = [
  { id: 'producer1', name: 'Kouadio Amani', location: 'Abidjan' },
  { id: 'producer2', name: 'Fatou Traoré', location: 'Bouaké' },
  { id: 'producer3', name: 'Yao N\'Guessan', location: 'San-Pédro' },
  { id: 'producer4', name: 'Marie Konan', location: 'Yamoussoukro' },
  { id: 'producer5', name: 'Jean Kouassi', location: 'Korhogo' }
];

export const UserPreferences: React.FC = () => {
  const { user } = useAuth();
  const { preferences, loading, updatePreferences, addToFavorites, removeFromFavorites,
           addPreferredProducer, removePreferredProducer, updateNotificationSettings,
           updateDeliveryPreferences, resetPreferences } = useUserPreferences();

  const [isSaving, setIsSaving] = useState(false);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');

  if (!user || !preferences) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connectez-vous pour gérer vos préférences
          </h3>
          <p className="text-gray-500">
            Vous devez être connecté pour accéder à vos préférences utilisateur.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        ...preferences,
        delivery_preferences: {
          ...preferences.delivery_preferences,
          delivery_instructions: deliveryInstructions || preferences.delivery_preferences.delivery_instructions,
          default_address: defaultAddress || preferences.delivery_preferences.default_address
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationToggle = async (setting: keyof typeof preferences.notification_settings, value: boolean) => {
    await updateNotificationSettings({ [setting]: value });
  };

  const handleDeliveryMethodChange = async (method: 'pickup' | 'delivery') => {
    await updateDeliveryPreferences({ preferred_delivery_method: method });
  };

  const toggleFavoriteCategory = async (categoryId: string) => {
    if (preferences.favorite_categories.includes(categoryId)) {
      await removeFromFavorites(categoryId);
    } else {
      await addToFavorites(categoryId);
    }
  };

  const togglePreferredProducer = async (producerId: string) => {
    if (preferences.preferred_producers.includes(producerId)) {
      await removePreferredProducer(producerId);
    } else {
      await addPreferredProducer(producerId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Préférences utilisateur</h2>
          <p className="text-gray-600">Personnalisez votre expérience sur la plateforme</p>
        </div>
        <Button
          variant="outline"
          onClick={resetPreferences}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">
            <Heart className="h-4 w-4 mr-2" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="h-4 w-4 mr-2" />
            Livraison
          </TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favorite Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Catégories préférées</span>
                </CardTitle>
                <CardDescription>
                  Sélectionnez vos catégories de produits préférées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={preferences.favorite_categories.includes(category.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFavoriteCategory(category.id)}
                      disabled={loading}
                      className="justify-start"
                    >
                      {preferences.favorite_categories.includes(category.id) && (
                        <Heart className="h-4 w-4 mr-2 fill-current" />
                      )}
                      {category.label}
                    </Button>
                  ))}
                </div>

                {preferences.favorite_categories.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vos catégories favorites:</Label>
                    <div className="flex flex-wrap gap-2">
                      {preferences.favorite_categories.map((catId) => {
                        const category = categories.find(c => c.id === catId);
                        return (
                          <Badge key={catId} variant="secondary">
                            {category?.label || catId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferred Producers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Producteurs préférés</span>
                </CardTitle>
                <CardDescription>
                  Suivez vos producteurs favoris
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {mockProducers.map((producer) => (
                    <div key={producer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Star className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{producer.name}</div>
                          <div className="text-sm text-gray-500">{producer.location}</div>
                        </div>
                      </div>
                      <Button
                        variant={preferences.preferred_producers.includes(producer.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePreferredProducer(producer.id)}
                        disabled={loading}
                      >
                        {preferences.preferred_producers.includes(producer.id) ? 'Suivi' : 'Suivre'}
                      </Button>
                    </div>
                  ))}
                </div>

                {preferences.preferred_producers.length > 0 && (
                  <div className="pt-2 border-t">
                    <Label className="text-sm font-medium">Producteurs suivis:</Label>
                    <div className="text-sm text-gray-600 mt-1">
                      {preferences.preferred_producers.length} producteur{preferences.preferred_producers.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Préférences de notification</span>
              </CardTitle>
              <CardDescription>
                Gérez comment et quand vous recevez des notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Email Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <Label className="font-medium">Email</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Activer les emails</Label>
                      <Switch
                        checked={preferences.notification_settings.email}
                        onCheckedChange={(checked) => handleNotificationToggle('email', checked)}
                        disabled={loading}
                      />
                    </div>

                    {preferences.notification_settings.email && (
                      <div className="space-y-2 ml-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Nouvelles offres</Label>
                          <Switch
                            checked={preferences.notification_settings.new_offers}
                            onCheckedChange={(checked) => handleNotificationToggle('new_offers', checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Baisse de prix</Label>
                          <Switch
                            checked={preferences.notification_settings.price_drops}
                            onCheckedChange={(checked) => handleNotificationToggle('price_drops', checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Mises à jour de commande</Label>
                          <Switch
                            checked={preferences.notification_settings.order_updates}
                            onCheckedChange={(checked) => handleNotificationToggle('order_updates', checked)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SMS Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <Label className="font-medium">SMS</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Activer les SMS</Label>
                      <Switch
                        checked={preferences.notification_settings.sms}
                        onCheckedChange={(checked) => handleNotificationToggle('sms', checked)}
                        disabled={loading}
                      />
                    </div>

                    {preferences.notification_settings.sms && (
                      <div className="space-y-2 ml-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Mises à jour de commande</Label>
                          <Switch
                            checked={preferences.notification_settings.order_updates}
                            onCheckedChange={(checked) => handleNotificationToggle('order_updates', checked)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <Label className="font-medium">Notifications push</Label>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Activer les notifications</Label>
                      <Switch
                        checked={preferences.notification_settings.push}
                        onCheckedChange={(checked) => handleNotificationToggle('push', checked)}
                        disabled={loading}
                      />
                    </div>

                    {preferences.notification_settings.push && (
                      <div className="space-y-2 ml-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Nouvelles offres</Label>
                          <Switch
                            checked={preferences.notification_settings.new_offers}
                            onCheckedChange={(checked) => handleNotificationToggle('new_offers', checked)}
                            disabled={loading}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Baisse de prix</Label>
                          <Switch
                            checked={preferences.notification_settings.price_drops}
                            onCheckedChange={(checked) => handleNotificationToggle('price_drops', checked)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Méthode de livraison préférée</span>
                </CardTitle>
                <CardDescription>
                  Choisissez votre méthode de livraison par défaut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={preferences.delivery_preferences.preferred_delivery_method}
                  onValueChange={(value: 'pickup' | 'delivery') => handleDeliveryMethodChange(value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>Retrait sur place</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="delivery">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4" />
                        <span>Livraison à domicile</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {preferences.delivery_preferences.preferred_delivery_method === 'delivery' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="default-address">Adresse par défaut</Label>
                      <Textarea
                        id="default-address"
                        placeholder="Entrez votre adresse de livraison par défaut..."
                        value={defaultAddress || preferences.delivery_preferences.default_address}
                        onChange={(e) => setDefaultAddress(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="delivery-instructions">Instructions de livraison</Label>
                      <Textarea
                        id="delivery-instructions"
                        placeholder="Instructions spéciales pour le livreur..."
                        value={deliveryInstructions || preferences.delivery_preferences.delivery_instructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé des préférences</CardTitle>
                <CardDescription>
                  Vue d'ensemble de vos préférences actuelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Catégories favorites</Label>
                    <div className="text-sm text-gray-600">
                      {preferences.favorite_categories.length} catégorie{preferences.favorite_categories.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Producteurs suivis</Label>
                    <div className="text-sm text-gray-600">
                      {preferences.preferred_producers.length} producteur{preferences.preferred_producers.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Notifications email</Label>
                    <div className="text-sm text-gray-600">
                      {preferences.notification_settings.email ? 'Activées' : 'Désactivées'}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Méthode de livraison</Label>
                    <div className="text-sm text-gray-600">
                      {preferences.delivery_preferences.preferred_delivery_method === 'pickup'
                        ? 'Retrait sur place'
                        : 'Livraison à domicile'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} disabled={isSaving || loading}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les préférences'
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};