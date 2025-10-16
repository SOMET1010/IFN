import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Shield, Bell, Filter } from 'lucide-react';
import { useState } from 'react';

type Severity = 'critical' | 'warning' | 'info';

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  source: string;
  date: string;
  status: 'open' | 'ack' | 'resolved';
}

const ALL_ALERTS: AlertItem[] = [
  { id: 'A-1001', title: 'Tentative de connexion suspecte', description: 'Plusieurs essais échoués sur un compte admin', severity: 'critical', source: 'Sécurité', date: '2024-03-18 10:42', status: 'open' },
  { id: 'A-1002', title: 'Débit API élevé', description: 'Pics de requêtes sur l’endpoint /v1/orders', severity: 'warning', source: 'API', date: '2024-03-18 09:15', status: 'ack' },
  { id: 'A-1003', title: 'Tâches en file d’attente', description: 'Files de traitement supérieures au seuil', severity: 'info', source: 'Système', date: '2024-03-17 17:22', status: 'resolved' },
];

const severityBadge = (s: Severity) => {
  const map: Record<Severity, { label: string; className: string }> = {
    critical: { label: 'Critique', className: 'bg-red-100 text-red-800' },
    warning: { label: 'Avertissement', className: 'bg-yellow-100 text-yellow-800' },
    info: { label: 'Info', className: 'bg-blue-100 text-blue-800' },
  };
  const { label, className } = map[s];
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

export default function AdminAlerts() {
  const [filter, setFilter] = useState<'all' | Severity>('all');

  const alerts = ALL_ALERTS.filter(a => filter === 'all' ? true : a.severity === filter);

  return (
    <DashboardLayout title="Alertes" subtitle="Surveillance et événements de sécurité">
      <div className="space-y-6">
        {/* Header actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Centre d’alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
              <Bell className="h-4 w-4 mr-2" />Toutes
            </Button>
            <Button variant={filter === 'critical' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('critical')}>
              <Shield className="h-4 w-4 mr-2" />Critiques
            </Button>
            <Button variant={filter === 'warning' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('warning')}>
              <AlertTriangle className="h-4 w-4 mr-2" />Avertissements
            </Button>
            <Button variant={filter === 'info' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('info')}>
              <Filter className="h-4 w-4 mr-2" />Infos
            </Button>
          </CardContent>
        </Card>

        {/* Alerts table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{a.description}</div>
                      </TableCell>
                      <TableCell>{severityBadge(a.severity)}</TableCell>
                      <TableCell>{a.source}</TableCell>
                      <TableCell>{a.date}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === 'open' ? 'destructive' : a.status === 'ack' ? 'outline' : 'secondary'}>
                          {a.status === 'open' ? 'Ouverte' : a.status === 'ack' ? 'Confirmée' : 'Résolue'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

