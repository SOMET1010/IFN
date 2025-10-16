import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { adminSystemService, type SystemBackup } from '@/services/admin/adminSystemService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminBackup() {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const response = await adminSystemService.getBackups();
      if (response.success && response.data) {
        setBackups(response.data);
      }
    } catch (error) {
      console.error('Erreur chargement backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'full' | 'incremental' | 'differential' = 'full') => {
    setCreatingBackup(true);
    try {
      const response = await adminSystemService.createBackup(type);
      if (response.success) {
        await loadBackups();
      }
    } catch (error) {
      console.error('Erreur création backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    try {
      const response = await adminSystemService.deleteBackup(backupId);
      if (response.success) {
        await loadBackups();
      }
    } catch (error) {
      console.error('Erreur suppression backup:', error);
    }
  };

  const restoreBackup = async (backupId: string) => {
    try {
      const response = await adminSystemService.restoreBackup(backupId);
      if (response.success) {
        // Show success message
      }
    } catch (error) {
      console.error('Erreur restauration backup:', error);
    }
  };

  const getBackupStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'running':
        return <Badge variant="secondary">En cours</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Planifié</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBackupTypeBadge = (type: string) => {
    switch (type) {
      case 'full':
        return <Badge variant="default">Complet</Badge>;
      case 'incremental':
        return <Badge variant="secondary">Incrémental</Badge>;
      case 'differential':
        return <Badge variant="outline">Différentiel</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Sauvegardes">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const completedBackups = backups.filter(b => b.status === 'completed');
  const totalSize = completedBackups.reduce((sum, backup) => sum + backup.size, 0);
  const oldestBackup = completedBackups.length > 0 
    ? new Date(Math.min(...completedBackups.map(b => new Date(b.created_at).getTime())))
    : null;

  return (
    <DashboardLayout sidebar={<></>} title="Sauvegardes">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Sauvegardes"
            value={backups.length.toString()}
            description={`${completedBackups.length} terminées`}
            icon={<HardDrive className="h-4 w-4" />}
          />
          <StatsCard
            title="Espace Utilisé"
            value={formatFileSize(totalSize)}
            description="Total des sauvegardes"
            icon={<HardDrive className="h-4 w-4" />}
          />
          <StatsCard
            title="Dernière Sauvegarde"
            value={completedBackups.length > 0 ? 'Oui' : 'Jamais'}
            description={completedBackups.length > 0 
              ? `Il y a ${Math.floor((Date.now() - new Date(completedBackups[0].created_at).getTime()) / (1000 * 60 * 60 * 24))} jours` 
              : 'Aucune sauvegarde'
            }
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatsCard
            title="Rétention"
            value={backups.length > 0 ? `${Math.min(...backups.map(b => b.retention_days))} jours` : 'N/A'}
            description="Période de rétention minimale"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions de Sauvegarde</CardTitle>
            <CardDescription>Créer une nouvelle sauvegarde</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => createBackup('full')} 
                disabled={creatingBackup}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Sauvegarde Complète
              </Button>
              <Button 
                onClick={() => createBackup('incremental')} 
                disabled={creatingBackup}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Sauvegarde Incrémentale
              </Button>
              <Button 
                onClick={() => createBackup('differential')} 
                disabled={creatingBackup}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sauvegarde Différentielle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backups List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste des Sauvegardes</CardTitle>
                <CardDescription>Historique des sauvegardes système</CardDescription>
              </div>
              <Button variant="outline" onClick={loadBackups}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Création</TableHead>
                    <TableHead>Rétention</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Aucune sauvegarde trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          <div className="font-medium">{backup.name}</div>
                        </TableCell>
                        <TableCell>
                          {getBackupTypeBadge(backup.type)}
                        </TableCell>
                        <TableCell>
                          {formatFileSize(backup.size)}
                        </TableCell>
                        <TableCell>
                          {getBackupStatusBadge(backup.status)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(backup.created_at).toLocaleDateString('fr-FR')}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(backup.created_at).toLocaleTimeString('fr-FR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {backup.retention_days} jours
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" disabled={backup.status !== 'completed'}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={backup.status !== 'completed'}
                              onClick={() => restoreBackup(backup.id)}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteBackup(backup.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}