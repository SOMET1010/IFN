import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, BarChart3, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

const AdminReports = () => {
  const reports = [
    { 
      id: 1,
      name: "Rapport d'activité mensuel",
      description: "Synthèse des activités et performances du mois",
      type: "monthly",
      lastGenerated: "2024-03-01",
      size: "2.4 MB",
      downloads: 45
    },
    { 
      id: 2,
      name: "Analyse des utilisateurs",
      description: "Statistiques détaillées des utilisateurs et engagement",
      type: "users",
      lastGenerated: "2024-03-15",
      size: "1.8 MB",
      downloads: 32
    },
    { 
      id: 3,
      name: "Rapport financier",
      description: "État des revenus et transactions de la plateforme",
      type: "financial",
      lastGenerated: "2024-03-14",
      size: "3.2 MB",
      downloads: 28
    },
    { 
      id: 4,
      name: "Analyse de sécurité",
      description: "Audit de sécurité et incidents détectés",
      type: "security",
      lastGenerated: "2024-03-13",
      size: "1.5 MB",
      downloads: 15
    },
  ];

  const kpis = [
    { title: "Utilisateurs actifs", current: 892, target: 1000, percentage: 89 },
    { title: "Transactions", current: 1240, target: 1500, percentage: 83 },
    { title: "Revenus (FCFA)", current: 2400000, target: 3000000, percentage: 80 },
    { title: "Taux satisfaction", current: 94, target: 95, percentage: 99 },
  ];

  const quickStats = [
    { title: "Rapports générés", value: "156", icon: FileText, change: "+12%" },
    { title: "Données analysées", value: "1.2M", icon: BarChart3, change: "+8%" },
    { title: "Téléchargements", value: "420", icon: Download, change: "+15%" },
    { title: "Utilisateurs actifs", value: "892", icon: Users, change: "+5%" },
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'monthly': return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'users': return <Users className="h-5 w-5 text-green-500" />;
      case 'financial': return <DollarSign className="h-5 w-5 text-yellow-500" />;
      case 'security': return <FileText className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      monthly: "Mensuel",
      users: "Utilisateurs",
      financial: "Financier",
      security: "Sécurité"
    };
    return <Badge variant="outline">{labels[type as keyof typeof labels]}</Badge>;
  };

  return (
    <DashboardLayout title="Rapports" subtitle="Générez et consultez les rapports analytiques">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs clés de performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {kpis.map((kpi, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{kpi.title}</span>
                      <span className="text-muted-foreground">
                        {kpi.title.includes('Revenus')
                          ? `${formatCurrency(kpi.current)} / ${formatCurrency(kpi.target)}`
                          : `${kpi.current.toLocaleString()} / ${kpi.target.toLocaleString()}`}
                      </span>
                    </div>
                    <Progress value={kpi.percentage} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {kpi.percentage}% de l'objectif
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Generation */}
          <Card>
            <CardHeader>
              <CardTitle>Génération de rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="gap-2 h-20 flex-col">
                    <BarChart3 className="h-6 w-6" />
                    <span>Rapport mensuel</span>
                  </Button>
                  <Button variant="outline" className="gap-2 h-20 flex-col">
                    <Users className="h-6 w-6" />
                    <span>Analyse utilisateurs</span>
                  </Button>
                  <Button variant="outline" className="gap-2 h-20 flex-col">
                    <DollarSign className="h-6 w-6" />
                    <span>Rapport financier</span>
                  </Button>
                  <Button variant="outline" className="gap-2 h-20 flex-col">
                    <FileText className="h-6 w-6" />
                    <span>Audit sécurité</span>
                  </Button>
                </div>
                <Button variant="ivoire" className="w-full gap-2">
                  <FileText className="h-4 w-4" />
                  Rapport personnalisé
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Rapports disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                <span>RAPPORT</span>
                <span>TYPE</span>
                <span>DERNIÈRE GÉNÉRATION</span>
                <span>TAILLE</span>
                <span>TÉLÉCHARGEMENTS</span>
                <span>ACTIONS</span>
              </div>
              {reports.map((report) => (
                <div key={report.id} className="grid grid-cols-6 gap-4 text-sm py-3 border-b items-center">
                  <div className="flex items-center gap-2">
                    {getReportIcon(report.type)}
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <span>{getTypeBadge(report.type)}</span>
                  <span>{report.lastGenerated}</span>
                  <span className="font-mono text-xs">{report.size}</span>
                  <span>{report.downloads}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
