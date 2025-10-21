import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Marketplace() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">Place de marché</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">En développement</p>
        </CardContent>
      </Card>
    </div>
  );
}
