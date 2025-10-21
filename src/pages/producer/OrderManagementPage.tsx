
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderManagementPage() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            Suivez et gérez vos commandes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune commande en cours</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
