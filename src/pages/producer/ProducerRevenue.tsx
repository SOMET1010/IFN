
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProducerRevenue() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Revenus</h1>
          <p className="text-muted-foreground">
            Suivez vos revenus et paiements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Statistiques de Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucun revenu enregistré</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
