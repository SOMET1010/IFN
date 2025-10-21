import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisputePolicies() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">DisputePolicies</h1>
        <p className="text-muted-foreground">Gestion des litiges</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">En développement</p>
        </CardContent>
      </Card>
    </div>
  );
}
