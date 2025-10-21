
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProducerOffers() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Offres</h1>
          <p className="text-muted-foreground">
            Gérez vos offres de produits et services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Offres</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune offre pour le moment</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
