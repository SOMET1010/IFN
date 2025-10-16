import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import MultiChannelPayment from '@/components/merchant/MultiChannelPayment';
import { useMerchantStats } from '@/services/merchant/merchantStatsService';
import { SocialContributionService, type ContributionDue } from '@/services/merchant/socialContributionService';
import { formatCurrency } from '@/lib/utils';
import { Calendar, Shield, HeartPulse, Receipt, Bell } from 'lucide-react';

export default function MerchantSocial() {
  const { stats } = useMerchantStats();
  const service = useMemo(() => SocialContributionService.getInstance(), []);

  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0, 7));
  const [revenueOverride, setRevenueOverride] = useState<string>('');
  const [dues, setDues] = useState<ContributionDue[]>([]);
  const [selectedDueId, setSelectedDueId] = useState<string | null>(null);
  const [reminders, setReminders] = useState({ sms: true, email: true });

  const monthlyRevenue = useMemo(() => {
    const base = stats.data?.totalRevenue || 0;
    const override = Number(revenueOverride || '');
    return override > 0 ? override : base;
  }, [stats.data?.totalRevenue, revenueOverride]);

  const compute = async () => {
    const vals = await service.computeDues(monthlyRevenue, period);
    setDues(vals);
  };

  const selectedDue = dues.find(d => d.id === selectedDueId) || null;

  return (
    <MerchantLayout title="Cotisations sociales" showBackButton={true} backTo="/merchant/dashboard">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs defaultValue="dues" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dues">A payer</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
            <TabsTrigger value="settings">Rappels</TabsTrigger>
          </TabsList>

          <TabsContent value="dues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" /> Calcul des cotisations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Période</div>
                    <Input type="month" value={period} onChange={e => setPeriod(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Revenu du mois (optionnel)</div>
                    <Input type="number" placeholder={String(stats.data?.totalRevenue || 0)} value={revenueOverride} onChange={e => setRevenueOverride(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={compute} className="w-full">Calculer</Button>
                  </div>
                </div>

                {dues.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Type</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Période</TableHead>
                          <TableHead className="whitespace-nowrap hidden md:table-cell">Base</TableHead>
                          <TableHead className="whitespace-nowrap">Montant</TableHead>
                          <TableHead className="whitespace-nowrap hidden lg:table-cell">Échéance</TableHead>
                          <TableHead className="whitespace-nowrap">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dues.map(d => (
                          <TableRow key={d.id}>
                            <TableCell className="font-medium">{d.type}
                              <Badge variant="outline" className="ml-2">{d.period}</Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{d.period}</TableCell>
                            <TableCell className="hidden md:table-cell">{formatCurrency(d.baseAmount)}</TableCell>
                            <TableCell className="text-green-600 font-semibold">{formatCurrency(d.amountDue)}</TableCell>
                            <TableCell className="hidden lg:table-cell flex items-center gap-1"><Calendar className="h-4 w-4" /> {d.dueDate}</TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => setSelectedDueId(d.id)}>Payer</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>Renseignez la période puis lancez le calcul.</AlertDescription>
                  </Alert>
                )}

                {selectedDue && (
                  <div className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Paiement {selectedDue.type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MultiChannelPayment
                          amount={selectedDue.amountDue}
                          customerInfo={{ name: 'Marchand', phone: '+22500000000' }}
                          onPaymentComplete={async (tx) => {
                            if (tx?.status === 'completed') {
                              await service.recordPayment(selectedDue, tx.reference || tx.id);
                              setSelectedDueId(null);
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <PaymentHistory />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Rappels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={reminders.sms} onChange={e => setReminders(v => ({ ...v, sms: e.target.checked }))} />
                  SMS avant échéance
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={reminders.email} onChange={e => setReminders(v => ({ ...v, email: e.target.checked }))} />
                  Email avant échéance
                </label>
                <Alert>
                  <AlertDescription>
                    Les rappels seront simulés côté client dans cette version de démonstration.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </MerchantLayout>
  );
}

function PaymentHistory() {
  const service = useMemo(() => SocialContributionService.getInstance(), []);
  const [payments, setPayments] = useState<any[]>([]);

  useState(() => {
    (async () => {
      setPayments(await service.getPaymentHistory());
    })();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Receipt className="h-5 w-5" /> Historique des paiements</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <Alert>
            <AlertDescription>Aucun paiement enregistré.</AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.type}</TableCell>
                  <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                  <TableCell className="text-green-600 font-semibold">{formatCurrency(p.amount)}</TableCell>
                  <TableCell>{new Date(p.paidAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
