import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CooperativePayments() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
        <p className="text-muted-foreground">Gestion des paiements</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Historique Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun paiement enregistré</p>
        </CardContent>
      </Card>
    </div>
  );
}
