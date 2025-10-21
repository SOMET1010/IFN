import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CooperativeDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coopérative Dashboard</h1>
        <p className="text-muted-foreground">Tableau de bord coopérative</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">En développement</p>
        </CardContent>
      </Card>
    </div>
  );
}
