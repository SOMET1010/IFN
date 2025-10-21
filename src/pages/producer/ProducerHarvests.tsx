
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProducerHarvests() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Récoltes</h1>
          <p className="text-muted-foreground">
            Enregistrez et suivez vos récoltes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Récoltes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune récolte enregistrée</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
