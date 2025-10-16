import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  AlertTriangle,
  Shield,
  Download,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Database,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  Archive,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Wifi,
  WifiOff
} from 'lucide-react';
import { accountService, AccountStatus, PendingTransaction, AccountDeletionRequest, AccountSecuritySettings } from '@/services/producer/accountService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/format';

interface AccountManagementProps {
  producerId: string;
}

export function AccountManagement({ producerId }: AccountManagementProps) {
  const { user } = useAuth();
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [securitySettings, setSecuritySettings] = useState<AccountSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteComments, setDeleteComments] = useState('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [tempDeactivation, setTempDeactivation] = useState(true);
  const [deactivationDuration, setDeactivationDuration] = useState(30);

  useEffect(() => {
    loadAccountData();
  }, [producerId]);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const [status, transactions, settings] = await Promise.all([
        accountService.getAccountStatus(producerId),
        accountService.getPendingTransactions(producerId),
        accountService.getSecuritySettings(producerId)
      ]);

      setAccountStatus(status);
      setPendingTransactions(transactions);
      setSecuritySettings(settings);
    } catch (error) {
      console.error('Erreur lors du chargement des données du compte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivateReason) return;

    try {
      const newStatus = await accountService.deactivateAccount(
        producerId,
        deactivateReason,
        tempDeactivation,
        tempDeactivation ? deactivationDuration : undefined
      );
      setAccountStatus(newStatus);
      setShowDeactivateDialog(false);
      setDeactivateReason('');
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    }
  };

  const handleReactivateAccount = async () => {
    try {
      const newStatus = await accountService.reactivateAccount(producerId);
      setAccountStatus(newStatus);
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason) return;

    try {
      const request = await accountService.requestAccountDeletion(
        producerId,
        deleteReason,
        deleteComments
      );
      setDeletionRequest(request);
      setShowDeleteDialog(false);
      setDeleteReason('');
      setDeleteComments('');
    } catch (error) {
      console.error('Erreur lors de la demande de suppression:', error);
    }
  };

  const handleDataExport = async () => {
    try {
      await accountService.createDataExport(producerId, exportFormat);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Erreur lors de la création de l\'export:', error);
    }
  };

  const getStatusBadge = (status: AccountStatus['status']) => {
    const variants = {
      active: 'default',
      deactivated: 'secondary',
      suspended: 'destructive',
      pending_deletion: 'destructive'
    } as const;

    const labels = {
      active: 'Actif',
      deactivated: 'Désactivé',
      suspended: 'Suspendu',
      pending_deletion: 'En attente de suppression'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getTransactionStatusBadge = (status: PendingTransaction['status']) => {
    const variants = {
      pending: 'outline',
      in_progress: 'default',
      disputed: 'destructive'
    } as const;

    const labels = {
      pending: 'En attente',
      in_progress: 'En cours',
      disputed: 'En litige'
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement des informations du compte...</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={60} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Statut du compte
          </CardTitle>
          <CardDescription>
            État actuel et options de gestion de votre compte producteur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Statut</div>
              {accountStatus && getStatusBadge(accountStatus.status)}
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Transactions en cours</div>
              <div className="text-2xl font-bold">{pendingTransactions.length}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Sécurité</div>
              <div className="flex items-center justify-center gap-1">
                {securitySettings?.twoFactorEnabled ? (
                  <Shield className="h-5 w-5 text-green-500" />
                ) : (
                  <Shield className="h-5 w-5 text-yellow-500" />
                )}
                <span className="text-sm">
                  {securitySettings?.twoFactorEnabled ? 'Protégé' : 'Basique'}
                </span>
              </div>
            </div>
          </div>

          {accountStatus?.reason && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Raison:</strong> {accountStatus.reason}
                {accountStatus.effectiveDate && (
                  <span className="block mt-1">
                    <strong>Depuis le:</strong> {formatDate(accountStatus.effectiveDate)}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Account Actions */}
          <div className="flex gap-2 mt-6">
            {accountStatus?.status === 'active' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDeactivateDialog(true)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Désactiver
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </>
            )}
            {accountStatus?.status === 'deactivated' && accountStatus.canReactivate && (
              <Button onClick={handleReactivateAccount}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réactiver
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter les données
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transactions en cours
            </CardTitle>
            <CardDescription>
              Ces transactions doivent être terminées avant de pouvoir désactiver ou supprimer le compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {transaction.type === 'sale' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                      {transaction.type === 'payment' && <Database className="h-5 w-5 text-green-600" />}
                      {transaction.type === 'delivery' && <MapPin className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(transaction.amount)} • {transaction.otherParty?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getTransactionStatusBadge(transaction.status)}
                    {transaction.estimatedCompletion && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Estimé: {formatDate(transaction.estimatedCompletion)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Settings */}
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySettings && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Authentification à deux facteurs</div>
                      <div className="text-sm text-muted-foreground">
                        Ajoutez une couche de sécurité supplémentaire à votre compte
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => {
                        if (securitySettings) {
                          setSecuritySettings({
                            ...securitySettings,
                            twoFactorEnabled: checked
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications de connexion</div>
                      <div className="text-sm text-muted-foreground">
                        Recevez des alertes lors des nouvelles connexions
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.loginNotifications}
                      onCheckedChange={(checked) => {
                        if (securitySettings) {
                          setSecuritySettings({
                            ...securitySettings,
                            loginNotifications: checked
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="sessionTimeout">Durée de session (heures)</Label>
                    <Select
                      value={securitySettings.sessionTimeout.toString()}
                      onValueChange={(value) => {
                        if (securitySettings) {
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: parseInt(value)
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="360">6 heures</SelectItem>
                        <SelectItem value="1440">24 heures</SelectItem>
                        <SelectItem value="10080">1 semaine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {securitySettings && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Visibilité du profil</div>
                      <div className="text-sm text-muted-foreground">
                        Contrôlez qui peut voir votre profil
                      </div>
                    </div>
                    <Select
                      value={securitySettings.privacySettings.profileVisibility}
                      onValueChange={(value) => {
                        if (securitySettings) {
                          setSecuritySettings({
                            ...securitySettings,
                            privacySettings: {
                              ...securitySettings.privacySettings,
                              profileVisibility: value as 'public' | 'private' | 'producers'
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Privé</SelectItem>
                        <SelectItem value="unlisted">Non listé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Afficher les statistiques</div>
                      <div className="text-sm text-muted-foreground">
                        Partager vos statistiques de production
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.privacySettings.showStatistics}
                      onCheckedChange={(checked) => {
                        if (securitySettings) {
                          setSecuritySettings({
                            ...securitySettings,
                            privacySettings: {
                              ...securitySettings.privacySettings,
                              showStatistics: checked
                            }
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Autoriser les demandes de contact</div>
                      <div className="text-sm text-muted-foreground">
                        Permettre aux autres utilisateurs de vous contacter
                      </div>
                    </div>
                    <Switch
                      checked={securitySettings.privacySettings.allowContactRequests}
                      onCheckedChange={(checked) => {
                        if (securitySettings) {
                          setSecuritySettings({
                            ...securitySettings,
                            privacySettings: {
                              ...securitySettings.privacySettings,
                              allowContactRequests: checked
                            }
                          });
                        }
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Dernières actions effectuées sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Connexion réussie</div>
                    <div className="text-sm text-muted-foreground">
                      Il y a 5 minutes • Abidjan, Côte d'Ivoire
                    </div>
                  </div>
                  <Wifi className="h-4 w-4 text-green-500" />
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Création d'une offre</div>
                    <div className="text-sm text-muted-foreground">
                      Il y a 2 heures • Cacao - 500kg
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Download className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Export des données</div>
                    <div className="text-sm text-muted-foreground">
                      Il y a 1 jour • Format JSON
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deactivation Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désactiver votre compte</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de désactiver votre compte producteur. Veuillez confirmer votre choix.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingTransactions.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Vous avez {pendingTransactions.length} transaction(s) en cours. Votre compte ne peut pas être désactivé tant que ces transactions ne sont pas terminées.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="deactivateReason">Raison de la désactivation</Label>
              <Textarea
                id="deactivateReason"
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez désactiver votre compte..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tempDeactivation"
                checked={tempDeactivation}
                onCheckedChange={setTempDeactivation}
              />
              <Label htmlFor="tempDeactivation">Désactivation temporaire</Label>
            </div>

            {tempDeactivation && (
              <div>
                <Label htmlFor="duration">Durée de la désactivation (jours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={deactivationDuration}
                  onChange={(e) => setDeactivationDuration(parseInt(e.target.value) || 30)}
                  min="1"
                  max="365"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleDeactivateAccount}
                disabled={!deactivateReason || pendingTransactions.length > 0}
              >
                Désactiver le compte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Supprimer votre compte définitivement
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données seront supprimées après la période légale de rétention.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingTransactions.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Vous avez {pendingTransactions.length} transaction(s) en cours. La suppression de votre compte sera reportée jusqu'à la fin de ces transactions.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Conséquences de la suppression:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• Suppression de toutes vos offres et produits</li>
                  <li>• Annulation des commandes en cours</li>
                  <li>• Suppression des documents et certificats</li>
                  <li>• Perte définitive de l'accès à la plateforme</li>
                  <li>• Conservation des données légales pendant la durée requise</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="deleteReason">Raison de la suppression *</Label>
              <Textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez supprimer votre compte..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="deleteComments">Commentaires supplémentaires</Label>
              <Textarea
                id="deleteComments"
                value={deleteComments}
                onChange={(e) => setDeleteComments(e.target.value)}
                placeholder="Informations complémentaires (optionnel)..."
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!deleteReason}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter vos données</DialogTitle>
            <DialogDescription>
              Téléchargez une copie de toutes vos données personnelles stockées sur la plateforme.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exportFormat">Format d'export</Label>
              <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'pdf' | 'xml') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Machine-readable)</SelectItem>
                  <SelectItem value="csv">CSV (Excel-compatible)</SelectItem>
                  <SelectItem value="pdf">PDF (Rapport lisible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Inclure dans l'export:</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="personal" defaultChecked />
                  <Label htmlFor="personal">Données personnelles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="financial" defaultChecked />
                  <Label htmlFor="financial">Données financières</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="transactions" defaultChecked />
                  <Label htmlFor="transactions">Historique des transactions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="communications" defaultChecked />
                  <Label htmlFor="communications">Communications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="documents" defaultChecked />
                  <Label htmlFor="documents">Documents et certificats</Label>
                </div>
              </div>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Le fichier d'export sera généré dans quelques minutes et disponible au téléchargement pendant 7 jours.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleDataExport}>
                <Download className="h-4 w-4 mr-2" />
                Générer l'export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}