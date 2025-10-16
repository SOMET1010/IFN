import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle } from 'lucide-react';

export default function MediationArbitrage() {
  const steps = [
    { label: 'Dépôt de la plainte', date: '5 juillet 2024' },
    { label: 'Médiation', date: '12 juillet 2024' },
    { label: 'Arbitrage', date: '29 juillet 2024' },
    { label: 'Résolution', date: '5 août 2024' },
  ];

  return (
    <DashboardLayout title="Médiation et Arbitrage">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Litige en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground mb-4">Litige entre M. Kouassi et Mme. Traoré</div>
            <div className="space-y-4">
              {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full bg-primary/80" />
                    {i < steps.length - 1 && <div className="w-0.5 h-10 bg-primary/20" />}
                  </div>
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-sm text-muted-foreground">{s.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Contrat initial</span>
                <span>Télécharger</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Preuves fournies</span>
                <span>Télécharger</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résolution proposée</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Après examen des preuves et des arguments des deux parties, il est proposé que M. Kouassi rembourse 50% du montant initial à Mme. Traoré dans un délai de 14 jours.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">Refuser</Button>
                <Button><CheckCircle className="h-4 w-4 mr-2" />Accepter</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

