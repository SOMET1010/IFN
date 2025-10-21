import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CooperativeOrders() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commandes Coopérative</h1>
        <p className="text-muted-foreground">Gérez les commandes de la coopérative</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucune commande</p>
        </CardContent>
      </Card>
    </div>
  );
}
