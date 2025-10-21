
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PriceManagementPage() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Prix</h1>
          <p className="text-muted-foreground">
            Définissez et ajustez vos prix de vente
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes Prix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configurez vos prix de produits</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
