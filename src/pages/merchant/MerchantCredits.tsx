import { useEffect, useMemo, useState } from 'react';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import MultiChannelPayment from '@/components/merchant/MultiChannelPayment';
import { MerchantCreditService, type CreditAccount, type CreditInstallment } from '@/services/merchant/merchantCreditService';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Calendar, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import FloatingVoiceNavigator from '@/components/merchant/FloatingVoiceNavigator';

export default function MerchantCredits() {
  const service = useMemo(() => MerchantCreditService.getInstance(), []);
  const [credits, setCredits] = useState<CreditAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ account: CreditAccount; schedule: CreditInstallment[] } | null>(null);
  const [lateCount, setLateCount] = useState(0);

  const refresh = async () => setCredits(await service.list());
  useEffect(() => { refresh(); }, []);
  useEffect(() => { (async () => { if (selectedId) setDetail(await service.get(selectedId)); })(); }, [selectedId]);

  return (
    <MerchantLayout title="Crédits clients" showBackButton={true} backTo="/merchant/dashboard">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">En cours</TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedId}>Détail</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Crédits actifs</CardTitle>
              </CardHeader>
              <CardContent>
                {credits.length === 0 ? (
                  <Alert><AlertDescription>Aucun crédit enregistré pour l’instant.</AlertDescription></Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Client</TableHead>
                          <TableHead className="whitespace-nowrap">Montant</TableHead>
                          <TableHead className="whitespace-nowrap hidden sm:table-cell">Créé le</TableHead>
                          <TableHead className="whitespace-nowrap">Statut</TableHead>
                          <TableHead className="whitespace-nowrap">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {credits.map(c => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.clientName}
                              <Badge variant="outline" className="ml-2">{c.clientPhone}</Badge>
                            </TableCell>
                            <TableCell className="text-green-600 font-semibold">{formatCurrency(c.total)}</TableCell>
                            <TableCell className="flex items-center gap-1 hidden sm:table-cell"><Calendar className="h-4 w-4" /> {new Date(c.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{c.status === 'active' ? <Badge variant="secondary">Actif</Badge> : <Badge>Clôturé</Badge>}</TableCell>
                            <TableCell><Button size="sm" onClick={() => setSelectedId(c.id)}>Voir</Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail">
            {!detail ? (
              <Alert><AlertDescription>Sélectionnez un crédit dans la liste.</AlertDescription></Alert>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> {detail.account.clientName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lateCount > 0 && (
                    <Alert>
                      <AlertDescription className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" /> {lateCount} échéance(s) en retard
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Info label="Principal" value={formatCurrency(detail.account.principal)} />
                    <Info label="Frais" value={formatCurrency(detail.account.fees)} />
                    <Info label="Total" value={formatCurrency(detail.account.total)} />
                    <Info label="Créé le" value={new Date(detail.account.createdAt).toLocaleDateString()} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={async () => {
                      const over = await service.checkOverdues();
                      setLateCount(over.filter(i => i.creditId === detail.account.id).length);
                      setDetail(await service.get(detail.account.id));
                    }}>Vérifier retards</Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
                      const txt = await service.generateReceipt(detail.account.id);
                      const blob = new Blob([txt], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `recu_credit_${detail.account.id}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                    }}>
                      <Download className="h-4 w-4" /> Exporter reçu
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
                      const html = await service.generateReceiptHTML(detail.account.id);
                      const blob = new Blob([html], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `recu_credit_${detail.account.id}.html`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                    }}>
                      <Download className="h-4 w-4" /> Exporter HTML
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">#</TableHead>
                          <TableHead className="whitespace-nowrap">Échéance</TableHead>
                          <TableHead className="whitespace-nowrap">Montant</TableHead>
                          <TableHead className="whitespace-nowrap">Statut</TableHead>
                          <TableHead className="whitespace-nowrap">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.schedule.map((it, idx) => (
                          <TableRow key={it.id}>
                            <TableCell>{idx+1}</TableCell>
                            <TableCell>{it.dueDate}</TableCell>
                            <TableCell className="text-green-600 font-semibold">{formatCurrency(it.amount)}</TableCell>
                            <TableCell>
                              {it.status === 'paid' ? (
                                <Badge className="bg-green-500">Payée</Badge>
                              ) : (
                                <Badge variant="outline">À payer</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {it.status !== 'paid' ? (
                                <InlineCollect amount={it.amount} onDone={async (ref) => {
                                  await service.payInstallment(detail.account.id, it.id, ref);
                                  setDetail(await service.get(detail.account.id));
                                  await refresh();
                                }} />
                              ) : it.reference ? <span className="text-xs font-mono">{it.reference}</span> : null}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </MerchantLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function InlineCollect({ amount, onDone }: { amount: number; onDone: (reference: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <MultiChannelPayment
        amount={amount}
        customerInfo={{ name: 'Client', phone: '+22500000000' }}
        onPaymentComplete={(tx) => {
          if (tx?.status === 'completed') {
            onDone(tx.reference || tx.id);
          }
        }}
      />
    </div>
  );
}
