
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductionManagementPage() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion de Production</h1>
          <p className="text-muted-foreground">
            Planifiez et suivez vos productions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes Productions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Aucune production planifiée</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
