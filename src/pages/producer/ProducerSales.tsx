
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProducerSales() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Ventes</h1>
          <p className="text-muted-foreground">
            Historique et statistiques de vos ventes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune vente enregistrée</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
