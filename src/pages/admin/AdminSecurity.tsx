import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, AlertTriangle, Eye, RefreshCw, Lock } from 'lucide-react';

const AdminSecurity = () => {
  const securityAlerts = [
    { 
      id: 1,
      type: "warning",
      title: "Tentatives de connexion suspectes",
      description: "5 tentatives de connexion échouées depuis IP: 192.168.1.100",
      timestamp: "2024-03-15 14:30",
      severity: "medium"
    },
    { 
      id: 2,
      type: "info",
      title: "Nouvelle connexion administrateur",
      description: "Connexion depuis nouvel appareil - Admin Système",
      timestamp: "2024-03-15 12:15",
      severity: "low"
    },
    { 
      id: 3,
      type: "critical",
      title: "Accès non autorisé détecté",
      description: "Tentative d'accès aux données financières sans permission",
      timestamp: "2024-03-15 10:45",
      severity: "high"
    },
  ];

  const securitySettings = [
    { name: "Authentification à deux facteurs", enabled: true, description: "Obligation 2FA pour admins" },
    { name: "Chiffrement des données", enabled: true, description: "AES-256 pour données sensibles" },
    { name: "Journalisation avancée", enabled: true, description: "Logs détaillés des actions" },
    { name: "Blocage IP automatique", enabled: false, description: "Blocage après 5 tentatives" },
    { name: "Sessions sécurisées", enabled: true, description: "Expiration automatique 30min" },
    { name: "Audit périodique", enabled: true, description: "Vérifications hebdomadaires" },
  ];

  const securityStats = [
    { title: "Alertes actives", value: "3", icon: AlertTriangle, severity: "high" },
    { title: "Utilisateurs sécurisés", value: "98%", icon: Shield, severity: "low" },
    { title: "Dernière analyse", value: "2h", icon: Eye, severity: "medium" },
    { title: "Certificats SSL", value: "Valides", icon: Lock, severity: "low" },
  ];

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "default",
      medium: "outline",
      high: "destructive"
    } as const;
    
    const labels = {
      low: "Faible",
      medium: "Moyen",
      high: "Élevé"
    };

    return (
      <Badge variant={variants[severity as keyof typeof variants]}>
        {labels[severity as keyof typeof labels]}
      </Badge>
    );
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'info': return <Shield className="h-5 w-5 text-blue-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout title="Sécurité" subtitle="Surveillez et gérez la sécurité du système">
      <div className="space-y-6">
        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {securityStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Alertes de sécurité</CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <span className="font-medium">{alert.title}</span>
                      </div>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Investiguer</Button>
                      <Button variant="ghost" size="sm">Marquer résolu</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {securitySettings.map((setting, index) => (
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="gap-2 h-20 flex-col">
                <Shield className="h-6 w-6" />
                <span>Scan de sécurité</span>
              </Button>
              <Button variant="outline" className="gap-2 h-20 flex-col">
                <Lock className="h-6 w-6" />
                <span>Audit des accès</span>
              </Button>
              <Button variant="outline" className="gap-2 h-20 flex-col">
                <Eye className="h-6 w-6" />
                <span>Rapport sécurité</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSecurity;