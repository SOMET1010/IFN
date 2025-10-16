import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Bell, Mail, Shield, Globe, Save } from 'lucide-react';

const AdminSettings = () => {
  const systemSettings = [
    { name: "Maintenance automatique", enabled: true, description: "Maintenance programmée tous les dimanche à 2h00" },
    { name: "Notifications en temps réel", enabled: true, description: "Push notifications pour les événements critiques" },
    { name: "Sauvegarde automatique", enabled: true, description: "Sauvegarde quotidienne à 3h00" },
    { name: "Mode développeur", enabled: false, description: "Outils de débogage et logs détaillés" },
    { name: "Analytiques avancées", enabled: true, description: "Collecte de données pour améliorer les performances" },
    { name: "API externe", enabled: true, description: "Autoriser les intégrations tierces" },
  ];

  const notificationSettings = [
    { name: "Nouvelles inscriptions", enabled: true, description: "Notifier lors de nouveaux comptes" },
    { name: "Alertes de sécurité", enabled: true, description: "Incidents et tentatives d'intrusion" },
    { name: "Rapports automatiques", enabled: false, description: "Envoi automatique des rapports hebdomadaires" },
    { name: "Mises à jour système", enabled: true, description: "Notifications des mises à jour disponibles" },
    { name: "Erreurs critiques", enabled: true, description: "Alertes immédiates pour les erreurs système" },
  ];

  const platformSettings = [
    { label: "Nom de la plateforme", value: "Inclusion Numérique CI", type: "text" },
    { label: "Version système", value: "2.1.4", type: "text", readonly: true },
    { label: "Email administrateur", value: "admin@inclusion.ci", type: "email" },
    { label: "Téléphone support", value: "+225 27 22 33 44", type: "tel" },
    { label: "Adresse", value: "Abidjan, Côte d'Ivoire", type: "text" },
  ];

  return (
    <DashboardLayout title="Paramètres" subtitle="Configurez les paramètres système et plateforme">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>Paramètres système</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {systemSettings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{setting.name}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch checked={setting.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notificationSettings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{setting.name}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch checked={setting.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Configuration de la plateforme</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformSettings.map((setting, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={setting.label}>{setting.label}</Label>
                  <Input
                    id={setting.label}
                    type={setting.type}
                    defaultValue={setting.value}
                    readOnly={setting.readonly}
                    className={setting.readonly ? "bg-muted" : ""}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Templates */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Modèles d'emails</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-email">Email de bienvenue</Label>
                <Textarea
                  id="welcome-email"
                  placeholder="Modèle d'email envoyé aux nouveaux utilisateurs..."
                  className="min-h-[100px]"
                  defaultValue="Bienvenue sur la plateforme Inclusion Numérique ! Nous sommes ravis de vous accueillir..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notification-email">Email de notification</Label>
                <Textarea
                  id="notification-email"
                  placeholder="Modèle pour les notifications importantes..."
                  className="min-h-[100px]"
                  defaultValue="Une nouvelle activité nécessite votre attention sur la plateforme..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Paramètres de sécurité</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout session (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Tentatives de connexion max</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  defaultValue="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-min-length">Longueur mot de passe min</Label>
                <Input
                  id="password-min-length"
                  type="number"
                  defaultValue="8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-rate-limit">Limite API (req/min)</Label>
                <Input
                  id="api-rate-limit"
                  type="number"
                  defaultValue="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="ivoire" className="gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;