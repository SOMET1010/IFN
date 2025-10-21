
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VocalInterfacePage() {
  return (
    
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interface Vocale</h1>
          <p className="text-muted-foreground">
            Commandez votre application par la voix
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commandes Vocales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Interface vocale en développement</p>
          </CardContent>
        </Card>
      </div>
    
  );
}
