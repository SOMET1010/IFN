import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CooperativeMembers() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Membres</h1>
        <p className="text-muted-foreground">Gestion des membres de la coopérative</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Liste des Membres</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun membre enregistré</p>
        </CardContent>
      </Card>
    </div>
  );
}
