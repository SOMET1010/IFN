import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CooperativeDistribution() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Distribution</h1>
        <p className="text-muted-foreground">Planification des distributions</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Planning Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune distribution planifiée</p>
        </CardContent>
      </Card>
    </div>
  );
}
