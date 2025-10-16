import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from '@/components/ui/notification-item';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Trash2,
  Settings,
  Filter,
  Search,
  Clock,
  ShoppingCart,
  Star,
  TrendingDown,
  MessageSquare,
  CreditCard,
  Truck,
  Info
} from 'lucide-react';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    loading
  } = useNotification();
  const { preferences, updateNotificationSettings } = useUserPreferences();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connectez-vous pour accéder à vos notifications
            </h3>
            <p className="text-gray-500 mb-4">
              Gérez vos notifications et préférences d'alerte.
            </p>
            <Button asChild>
              <a href="/login">Se connecter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSearch = !searchQuery.trim() ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesReadStatus = !showUnreadOnly || !notification.is_read;

    return matchesType && matchesSearch && matchesReadStatus;
  });

  const unreadNotifications = getUnreadNotifications();
  const orderNotifications = getNotificationsByType('order_update');
  const offerNotifications = getNotificationsByType('new_offer');
  const priceNotifications = getNotificationsByType('price_drop');
  const reviewNotifications = getNotificationsByType('review_response');

  const notificationTypes = [
    { id: 'all', label: 'Toutes', count: notifications.length, icon: Bell },
    { id: 'order_update', label: 'Commandes', count: orderNotifications.length, icon: ShoppingCart },
    { id: 'new_offer', label: 'Nouvelles offres', count: offerNotifications.length, icon: BellRing },
    { id: 'price_drop', label: 'Baisses de prix', count: priceNotifications.length, icon: TrendingDown },
    { id: 'review_response', label: 'Réponses avis', count: reviewNotifications.length, icon: MessageSquare },
    { id: 'payment_status', label: 'Paiements', count: getNotificationsByType('payment_status').length, icon: CreditCard },
    { id: 'delivery_update', label: 'Livraisons', count: getNotificationsByType('delivery_update').length, icon: Truck },
    { id: 'system', label: 'Système', count: getNotificationsByType('system').length, icon: Info }
  ];

  const handleNotificationSettingChange = async (setting: string, value: boolean) => {
    await updateNotificationSettings({ [setting]: value });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Notifications</h1>
          <p className="text-gray-600">
            Gérez vos notifications et personnalisez vos préférences d'alerte.
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher des notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                {/* Filter */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Unread Filter */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="unread-only"
                    checked={showUnreadOnly}
                    onCheckedChange={setShowUnreadOnly}
                  />
                  <Label htmlFor="unread-only">Non lues seulement</Label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={markAllAsRead}
                    disabled={loading}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllNotifications}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Tout effacer
                  </Button>
                )}
              </div>
            </div>

            {/* Notification Types Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {notificationTypes.slice(1).map(type => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    filterType === type.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setFilterType(type.id)}
                >
                  <CardContent className="p-3 text-center">
                    <type.icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                    <div className="text-sm font-medium">{type.label}</div>
                    <Badge variant="secondary" className="mt-1">
                      {type.count}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {filterType === 'all' ? 'Toutes les notifications' : notificationTypes.find(t => t.id === filterType)?.label}
                </h3>
                <Badge variant="outline">
                  {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {filterType === 'all' ? 'Aucune notification' : `Aucune notification de type ${notificationTypes.find(t => t.id === filterType)?.label?.toLowerCase()}`}
                    </h3>
                    <p className="text-gray-500">
                      Vous serez notifié des mises à jour importantes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                  <CardDescription>
                    Choisissez comment et quand vous souhaitez recevoir des notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Email</h4>
                          <p className="text-sm text-gray-500">Notifications par email</p>
                        </div>
                      </div>

                      <div className="space-y-3 ml-12">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Activer les emails</Label>
                          <Switch
                            checked={preferences?.notification_settings.email}
                            onCheckedChange={(checked) => handleNotificationSettingChange('email', checked)}
                          />
                        </div>
                        {preferences?.notification_settings.email && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Nouvelles offres</Label>
                              <Switch
                                checked={preferences.notification_settings.new_offers}
                                onCheckedChange={(checked) => handleNotificationSettingChange('new_offers', checked)}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Baisses de prix</Label>
                              <Switch
                                checked={preferences.notification_settings.price_drops}
                                onCheckedChange={(checked) => handleNotificationSettingChange('price_drops', checked)}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Mises à jour de commande</Label>
                              <Switch
                                checked={preferences.notification_settings.order_updates}
                                onCheckedChange={(checked) => handleNotificationSettingChange('order_updates', checked)}
                                size="sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">SMS</h4>
                          <p className="text-sm text-gray-500">Notifications par SMS</p>
                        </div>
                      </div>

                      <div className="space-y-3 ml-12">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Activer les SMS</Label>
                          <Switch
                            checked={preferences?.notification_settings.sms}
                            onCheckedChange={(checked) => handleNotificationSettingChange('sms', checked)}
                          />
                        </div>
                        {preferences?.notification_settings.sms && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Mises à jour de commande</Label>
                              <Switch
                                checked={preferences.notification_settings.order_updates}
                                onCheckedChange={(checked) => handleNotificationSettingChange('order_updates', checked)}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Livraisons</Label>
                              <Switch
                                checked={preferences.notification_settings.order_updates}
                                onCheckedChange={(checked) => handleNotificationSettingChange('order_updates', checked)}
                                size="sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Push</h4>
                          <p className="text-sm text-gray-500">Notifications push</p>
                        </div>
                      </div>

                      <div className="space-y-3 ml-12">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Activer les notifications</Label>
                          <Switch
                            checked={preferences?.notification_settings.push}
                            onCheckedChange={(checked) => handleNotificationSettingChange('push', checked)}
                          />
                        </div>
                        {preferences?.notification_settings.push && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Nouvelles offres</Label>
                              <Switch
                                checked={preferences.notification_settings.new_offers}
                                onCheckedChange={(checked) => handleNotificationSettingChange('new_offers', checked)}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Baisses de prix</Label>
                              <Switch
                                checked={preferences.notification_settings.price_drops}
                                onCheckedChange={(checked) => handleNotificationSettingChange('price_drops', checked)}
                                size="sm"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Mises à jour de commande</Label>
                              <Switch
                                checked={preferences.notification_settings.order_updates}
                                onCheckedChange={(checked) => handleNotificationSettingChange('order_updates', checked)}
                                size="sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Heures de notification</CardTitle>
                  <CardDescription>
                    Définissez les heures pendant lesquelles vous souhaitez recevoir des notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Heures de début</Label>
                      <Select defaultValue="09:00">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="06:00">06:00</SelectItem>
                          <SelectItem value="07:00">07:00</SelectItem>
                          <SelectItem value="08:00">08:00</SelectItem>
                          <SelectItem value="09:00">09:00</SelectItem>
                          <SelectItem value="10:00">10:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Heures de fin</Label>
                      <Select defaultValue="20:00">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18:00">18:00</SelectItem>
                          <SelectItem value="19:00">19:00</SelectItem>
                          <SelectItem value="20:00">20:00</SelectItem>
                          <SelectItem value="21:00">21:00</SelectItem>
                          <SelectItem value="22:00">22:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};