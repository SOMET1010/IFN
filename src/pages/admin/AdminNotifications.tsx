import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Send,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { adminNotificationService, type NotificationTemplate, type NotificationQueue, type NotificationStats } from '@/services/admin/adminNotificationService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [queue, setQueue] = useState<NotificationQueue[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesResponse, queueResponse, statsResponse] = await Promise.all([
        adminNotificationService.getTemplates(),
        adminNotificationService.getNotificationQueue(),
        adminNotificationService.getNotificationStats()
      ]);

      if (templatesResponse.success && templatesResponse.data) {
        setTemplates(templatesResponse.data);
      }
      if (queueResponse.success && queueResponse.data) {
        setQueue(queueResponse.data);
      }
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800">Envoyé</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Délivré</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Smartphone className="h-4 w-4" />;
      case 'push':
        return <MessageSquare className="h-4 w-4" />;
      case 'in_app':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'normal':
        return 'text-blue-600 bg-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Notifications">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<></>} title="Notifications">
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Envoyés"
              value={stats.total_sent.toLocaleString()}
              description={`Taux de livraison: ${stats.delivery_rate.toFixed(1)}%`}
              icon={<Send className="h-4 w-4" />}
              trend={{ value: stats.total_sent, isPositive: true }}
            />
            <StatsCard
              title="Délivrés"
              value={stats.total_delivered.toLocaleString()}
              description="Notifications reçues"
              icon={<CheckCircle className="h-4 w-4" />}
              trend={{ value: stats.total_delivered, isPositive: true }}
            />
            <StatsCard
              title="Échoués"
              value={stats.total_failed.toLocaleString()}
              description="Notifications non envoyées"
              icon={<XCircle className="h-4 w-4" />}
              trend={{ value: stats.total_failed, isPositive: false }}
            />
            <StatsCard
              title="Temps Moyen"
              value={`${stats.average_delivery_time.toFixed(1)}s`}
              description="Temps de livraison moyen"
              icon={<Clock className="h-4 w-4" />}
              trend={{ value: stats.average_delivery_time, isPositive: stats.average_delivery_time < 5 }}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="queue">File d'attente</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Templates de Notification</CardTitle>
                    <CardDescription>Gérez les modèles de notifications</CardDescription>
                  </div>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Nouveau Template
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
                        <TableHead>Sujet</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Aucun template trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        templates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(template.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(template.type)}
                                <span className="capitalize">{template.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {template.subject}
                            </TableCell>
                            <TableCell>
                              <Badge variant={template.enabled ? 'default' : 'secondary'}>
                                {template.enabled ? 'Actif' : 'Inactif'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
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
          </TabsContent>

          <TabsContent value="queue" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>File d'attente</CardTitle>
                    <CardDescription>Notifications en attente d'envoi</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={loadData}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Réessayer échecs
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Destinataire</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queue.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            File d'attente vide
                          </TableCell>
                        </TableRow>
                      ) : (
                        queue.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="font-medium">{item.recipient}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(item.template_id.includes('email') ? 'email' : 'sms')}
                                <span>{item.template_id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(item.status)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{new Date(item.created_at).toLocaleDateString('fr-FR')}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(item.created_at).toLocaleTimeString('fr-FR')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {item.status === 'failed' && (
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
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
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications par Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.notifications_by_type || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications par Statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats?.notifications_by_status || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}