import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as UICalendar } from '@/components/ui/calendar';
import {
  Activity,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminAuditService, type AuditLog, type AuditStats, type AuditFilters } from '@/services/admin/adminAuditService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsResponse, statsResponse] = await Promise.all([
        adminAuditService.getAuditLogs(filters),
        adminAuditService.getAuditStats()
      ]);

      if (logsResponse.success && logsResponse.data) {
        setLogs(logsResponse.data);
      }
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement des logs d\'audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await adminAuditService.exportAuditLogs(filters, format);
      if (response.success && response.data) {
        const blob = new Blob([response.data], {
          type: format === 'csv' ? 'text/csv' : 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur export des logs:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Succès</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const filteredLogs = logs.filter(log =>
    Object.values(log).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <DashboardLayout title="Logs d'Audit">
      <div className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatsCard
              title="Total Événements"
              value={stats.total_events.toLocaleString()}
              icon={<Activity className="h-4 w-4" />}
            />
            <StatsCard
              title="Succès"
              value={stats.success_events.toLocaleString()}
              icon={<CheckCircle className="h-4 w-4" />}
              trend={{ value: stats.success_events, isPositive: true }}
            />
            <StatsCard
              title="Échecs"
              value={stats.failed_events.toLocaleString()}
              icon={<XCircle className="h-4 w-4" />}
              trend={{ value: stats.failed_events, isPositive: false }}
            />
            <StatsCard
              title="Avertissements"
              value={stats.warning_events.toLocaleString()}
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            <CardDescription>Filtrer les logs d'audit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Utilisateur</label>
                <Input
                  placeholder="ID utilisateur"
                  value={filters.user_id || ''}
                  onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Action</label>
                <Input
                  placeholder="Rechercher une action"
                  value={filters.action || ''}
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value as 'success' | 'failed' | 'warning' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="failed">Échec</SelectItem>
                    <SelectItem value="warning">Avertissement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type de ressource</label>
                <Input
                  placeholder="Type de ressource"
                  value={filters.resource_type || ''}
                  onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Logs d'Audit</CardTitle>
                <CardDescription>
                  {filteredLogs.length} événements trouvés
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" onClick={() => loadData()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                <Select onValueChange={(value) => handleExport(value as 'csv' | 'json')}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Exporter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Chargement des logs...
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Aucun log trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{log.user_email}</div>
                              <div className="text-sm text-gray-500">{log.user_role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.resource_type}</div>
                            <div className="text-sm text-gray-500">{log.resource_id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {log.ip_address}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
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