import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  Lock,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Calendar,
  Clock,
  Activity,
  LogOut,
  UserX,
  Archive,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import MerchantLayout from '@/components/merchant/MerchantLayout';

interface AccountSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    lowStock: boolean;
    paymentReminders: boolean;
    promotional: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showContactInfo: boolean;
    showStats: boolean;
    allowReviews: boolean;
    dataSharing: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
  preferences: {
    language: string;
    timezone: string;
    currency: string;
    dateFormat: string;
    theme: 'light' | 'dark' | 'auto';
    autoSave: boolean;
  };
  dataManagement: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    dataRetention: number;
    exportFormat: 'csv' | 'excel' | 'json';
  };
}

interface PendingTransaction {
  id: string;
  type: 'sale' | 'purchase' | 'payment';
  amount: number;
  status: 'pending' | 'processing' | 'completed';
  date: string;
  description: string;
}

const MerchantSettings = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState<AccountSettings>({
    notifications: {
      email: true,
      sms: true,
      push: true,
      orderUpdates: true,
      lowStock: true,
      paymentReminders: true,
      promotional: false
    },
    privacy: {
      profileVisibility: 'public',
      showContactInfo: true,
      showStats: true,
      allowReviews: true,
      dataSharing: false
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    preferences: {
      language: 'fr',
      timezone: 'Africa/Abidjan',
      currency: 'XOF',
      dateFormat: 'DD/MM/YYYY',
      theme: 'light',
      autoSave: true
    },
    dataManagement: {
      autoBackup: true,
      backupFrequency: 'weekly',
      dataRetention: 365,
      exportFormat: 'csv'
    }
  });

  useEffect(() => {
    loadPendingTransactions();
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Simuler le chargement des paramètres depuis le service
    const savedSettings = localStorage.getItem('merchantSettings');
    if (savedSettings) {
      setSettings({ ...settings, ...JSON.parse(savedSettings) });
    }
  };

  const loadPendingTransactions = () => {
    // Simuler le chargement des transactions en cours
    const mockTransactions: PendingTransaction[] = [
      {
        id: 'TX001',
        type: 'sale',
        amount: 25000,
        status: 'pending',
        date: new Date().toISOString(),
        description: 'Vente de fruits et légumes'
      },
      {
        id: 'TX002',
        type: 'payment',
        amount: 15000,
        status: 'processing',
        date: new Date(Date.now() - 3600000).toISOString(),
        description: 'Paiement fournisseur'
      }
    ];
    setPendingTransactions(mockTransactions);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('merchantSettings', JSON.stringify(settings));
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver votre compte ? Cette action est réversible.')) {
      return;
    }

    if (pendingTransactions.length > 0) {
      if (!window.confirm(
        `Vous avez ${pendingTransactions.length} transaction(s) en cours. La désactivation sera reportée jusqu'à leur finalisation. Continuer ?`
      )) {
        return;
      }
    }

    setLoading(true);
    try {
      // Simuler la désactivation
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (pendingTransactions.length === 0) {
        logout();
        alert('Votre compte a été désactivé avec succès.');
      } else {
        alert('Votre compte sera désactivé une fois toutes les transactions finalisées.');
      }
    } catch (error) {
      alert('Erreur lors de la désactivation du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ ATTENTION : Cette action est irréversible ! Toutes vos données seront définitivement supprimées. Continuer ?')) {
      return;
    }

    if (pendingTransactions.length > 0) {
      alert('Impossible de supprimer le compte : des transactions sont en cours.');
      return;
    }

    if (!window.confirm('Dernière confirmation : Voulez-vous vraiment supprimer définitivement votre compte et toutes vos données ?')) {
      return;
    }

    setDeletingAccount(true);
    try {
      // Simuler la suppression
      await new Promise(resolve => setTimeout(resolve, 3000));
      logout();
      alert('Votre compte a été définitivement supprimé.');
    } catch (error) {
      alert('Erreur lors de la suppression du compte');
    } finally {
      setDeletingAccount(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        profile: {
          businessName: 'Boutique Agricole Fresh',
          // ... autres données du profil
        },
        transactions: pendingTransactions,
        settings: settings,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merchant_data_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert('Données exportées avec succès !');
    } catch (error) {
      alert('Erreur lors de l\'export des données');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'outline'
    } as const;

    const labels = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTransactionTypeIcon = (type: string) => {
    const icons = {
      sale: '💰',
      purchase: '🛒',
      payment: '💳'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  return (
    <MerchantLayout 
      title="Paramètres du compte" 
      showBackButton={true} 
      backTo="/merchant/dashboard"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Alertes pour transactions en cours */}
        {pendingTransactions.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Vous avez {pendingTransactions.length} transaction(s) en cours. La désactivation ou suppression de votre compte sera reportée jusqu'à leur finalisation.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Paramètres du compte
          </h1>
          <p className="text-muted-foreground">
            Gérez vos préférences, sécurité et options de compte
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="data">Données</TabsTrigger>
          </TabsList>

          {/* Général */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Préférences régionales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={settings.preferences.language} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, language: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select value={settings.preferences.timezone} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, timezone: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Abidjan">Afrique/Abidjan (GMT)</SelectItem>
                        <SelectItem value="Africa/Dakar">Afrique/Dakar (GMT)</SelectItem>
                        <SelectItem value="Africa/Lagos">Afrique/Lagos (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select value={settings.preferences.currency} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, currency: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="USD">Dollar US (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Format de date</Label>
                    <Select value={settings.preferences.dateFormat} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, dateFormat: value }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5" />
                    Affichage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Thème</Label>
                      <p className="text-sm text-muted-foreground">Choisissez l'apparence</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={settings.preferences.theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: 'light' }
                        }))}
                      >
                        <Sun className="h-4 w-4 mr-1" />
                        Clair
                      </Button>
                      <Button
                        variant={settings.preferences.theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: 'dark' }
                        }))}
                      >
                        <Moon className="h-4 w-4 mr-1" />
                        Sombre
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde automatique</Label>
                      <p className="text-sm text-muted-foreground">Sauvegarde automatique des modifications</p>
                    </div>
                    <Switch
                      checked={settings.preferences.autoSave}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, autoSave: checked }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Préférences de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Canaux de notification</h4>
                    {Object.entries(settings.notifications).filter(([key]) =>
                      ['email', 'sms', 'push'].includes(key)
                    ).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {key === 'email' && <Mail className="h-4 w-4" />}
                          {key === 'sms' && <Smartphone className="h-4 w-4" />}
                          {key === 'push' && <Bell className="h-4 w-4" />}
                          <div>
                            <div className="font-medium">
                              {key === 'email' && 'Email'}
                              {key === 'sms' && 'SMS'}
                              {key === 'push' && 'Notifications push'}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, [key]: checked }
                          }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Types de notifications</h4>
                    {Object.entries(settings.notifications).filter(([key]) =>
                      ['orderUpdates', 'lowStock', 'paymentReminders', 'promotional'].includes(key)
                    ).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {key === 'orderUpdates' && 'Mises à jour des commandes'}
                            {key === 'lowStock' && 'Alertes de stock bas'}
                            {key === 'paymentReminders' && 'Rappels de paiement'}
                            {key === 'promotional' && 'Offres promotionnelles'}
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, [key]: checked }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Confidentialité et partage de données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Visibilité du profil</Label>
                      <p className="text-sm text-muted-foreground">Qui peut voir votre profil</p>
                    </div>
                    <Select value={settings.privacy.profileVisibility} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        privacy: { ...prev.privacy, profileVisibility: value as 'public' | 'private' | 'contacts' }
                      }))
                    }>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                        <SelectItem value="contacts">Contacts uniquement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries(settings.privacy).filter(([key]) =>
                    ['showContactInfo', 'showStats', 'allowReviews', 'dataSharing'].includes(key)
                  ).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {key === 'showContactInfo' && 'Afficher les coordonnées'}
                          {key === 'showStats' && 'Afficher les statistiques'}
                          {key === 'allowReviews' && 'Autoriser les avis'}
                          {key === 'dataSharing' && 'Partage de données anonymes'}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {key === 'showContactInfo' && 'Afficher téléphone et email'}
                          {key === 'showStats' && 'Partager vos statistiques de vente'}
                          {key === 'allowReviews' && 'Permettre aux clients de laisser des avis'}
                          {key === 'dataSharing' && "Partager des données anonymes pour l'amélioration du service"}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => setSettings(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, [key]: checked }
                        }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">Ajoutez une couche de sécurité</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, twoFactorAuth: checked }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Alertes de connexion</Label>
                      <p className="text-sm text-muted-foreground">Notifiez-moi des nouvelles connexions</p>
                    </div>
                    <Switch
                      checked={settings.security.loginAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, loginAlerts: checked }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Délai d'inactivité (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                      }))}
                      min="5"
                      max="240"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Expiration du mot de passe (jours)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, passwordExpiry: parseInt(e.target.value) }
                      }))}
                      min="30"
                      max="365"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Transactions en cours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {pendingTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getTransactionTypeIcon(transaction.type)}</span>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p>Aucune transaction en cours</p>
                      <p className="text-sm">Vous pouvez désactiver ou supprimer votre compte en toute sécurité</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gestion des données */}
          <TabsContent value="data">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Sauvegarde et exportation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde automatique</Label>
                      <p className="text-sm text-muted-foreground">Sauvegarde régulière de vos données</p>
                    </div>
                    <Switch
                      checked={settings.dataManagement.autoBackup}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        dataManagement: { ...prev.dataManagement, autoBackup: checked }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                    <Select value={settings.dataManagement.backupFrequency} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        dataManagement: { ...prev.dataManagement, backupFrequency: value as 'daily' | 'weekly' | 'monthly' }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exportFormat">Format d'export</Label>
                    <Select value={settings.dataManagement.exportFormat} onValueChange={(value) =>
                      setSettings(prev => ({
                        ...prev,
                        dataManagement: { ...prev.dataManagement, exportFormat: value as 'csv' | 'excel' | 'json' }
                      }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Rétention des données (jours)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataManagement.dataRetention}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        dataManagement: { ...prev.dataManagement, dataRetention: parseInt(e.target.value) }
                      }))}
                      min="30"
                      max="1825"
                    />
                  </div>
                  <Button onClick={exportData} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter mes données
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserX className="h-5 w-5" />
                    Gestion du compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Ces actions sont irréversibles. Assurez-vous d'avoir exporté vos données avant de continuer.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          <Archive className="h-4 w-4 mr-2" />
                          Désactiver temporairement le compte
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Désactivation du compte</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>
                            La désactivation de votre compte le rendra temporairement inaccessible.
                            Vous pourrez le réactiver ultérieurement en contactant le support.
                          </p>
                          {pendingTransactions.length > 0 && (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Vous avez {pendingTransactions.length} transaction(s) en cours.
                                La désactivation sera automatique une fois toutes les transactions finalisées.
                              </AlertDescription>
                            </Alert>
                          )}
                          <Button
                            onClick={handleDeactivateAccount}
                            disabled={loading || pendingTransactions.length > 0}
                            className="w-full"
                          >
                            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                            Confirmer la désactivation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer définitivement le compte
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Suppression définitive du compte</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              ⚠️ Cette action est irréversible et supprimera toutes vos données définitivement.
                            </AlertDescription>
                          </Alert>

                          {pendingTransactions.length > 0 ? (
                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Impossible de supprimer le compte : vous avez {pendingTransactions.length} transaction(s) en cours.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <p>
                              Toutes vos données, historique, transactions et paramètres seront définitivement supprimés.
                              Cette action ne peut pas être annulée.
                            </p>
                          )}

                          <Button
                            onClick={handleDeleteAccount}
                            disabled={deletingAccount || pendingTransactions.length > 0}
                            variant="destructive"
                            className="w-full"
                          >
                            {deletingAccount && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                            Supprimer définitivement mon compte
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Bouton de sauvegarde général */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            Sauvegarder les paramètres
          </Button>
        </div>
      </main>
    </MerchantLayout>
  );
};

export default MerchantSettings;
