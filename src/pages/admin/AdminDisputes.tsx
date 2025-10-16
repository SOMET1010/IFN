import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { disputeService, type Dispute, type DisputeStatus, type DisputeType } from '@/services/dispute/disputeService';
import { Link } from 'react-router-dom';

const statusLabel: Record<DisputeStatus, string> = {
  open: 'Ouvert',
  in_review: 'En cours',
  pending: 'En attente',
  resolved: 'Résolu',
  rejected: 'Rejeté',
};

const typeLabel: Record<DisputeType, string> = {
  erreur_transaction: 'Erreur de transaction',
  probleme_paiement: 'Problème de paiement',
  remboursement: 'Litige de remboursement',
  commande_non_reçue: 'Commande non reçue',
  autre: 'Autre',
};

export default function AdminDisputes() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | DisputeStatus>('all');
  const [type, setType] = useState<'all' | DisputeType>('all');
  const [user, setUser] = useState<'all' | string>('all');
  const [items, setItems] = useState<Dispute[]>([]);

  useEffect(() => {
    disputeService.initializeDemoData();
    refresh();
  }, []);

  const refresh = async () => {
    const res = await disputeService.search({ q, status, type, user });
    if (res.success && res.data) setItems(res.data);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, type, user]);

  const users = useMemo(() => Array.from(new Set(items.map(i => i.user_name))), [items]);

  const statusBadge = (s: DisputeStatus) => {
    const map: Record<DisputeStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }>= {
      open: { variant: 'secondary', label: 'Ouvert' },
      in_review: { variant: 'outline', label: 'En cours' },
      pending: { variant: 'outline', label: 'En attente' },
      resolved: { variant: 'default', label: 'Résolu' },
      rejected: { variant: 'destructive', label: 'Rejeté' },
    };
    const b = map[s];
    return <Badge variant={b.variant}>{b.label}</Badge>;
  };

  return (
    <DashboardLayout title="Litiges" subtitle="Gestion des litiges et réclamations">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 gap-3 grid grid-cols-1 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par ID de litige, transaction, utilisateur" className="pl-10" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
              <option value="all">Statut</option>
              {Object.keys(statusLabel).map((k)=> (
                <option key={k} value={k}>{statusLabel[k as DisputeStatus]}</option>
              ))}
            </select>
            <select className="border rounded-md px-3 py-2 text-sm" value={type} onChange={(e)=>setType(e.target.value as any)}>
              <option value="all">Type de litige</option>
              {Object.keys(typeLabel).map((k)=> (
                <option key={k} value={k}>{typeLabel[k as DisputeType]}</option>
              ))}
            </select>
            <select className="border rounded-md px-3 py-2 text-sm" value={user} onChange={(e)=>setUser(e.target.value)}>
              <option value="all">Utilisateur impliqué</option>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="md:col-span-1 flex items-center gap-2">
              <Button variant="outline" className="w-full"><Filter className="h-4 w-4 mr-2" />Filtrer</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des litiges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm font-medium text-muted-foreground pb-2 border-b">
              <span className="col-span-2">ID DE LITIGE</span>
              <span className="col-span-2">ID DE TRANSACTION</span>
              <span className="col-span-2">UTILISATEUR</span>
              <span className="col-span-2">TYPE</span>
              <span className="col-span-1">STATUT</span>
              <span className="col-span-2">DATE DE CRÉATION</span>
              <span className="col-span-1 text-right">ACTIONS</span>
            </div>
            {items.map(d => (
              <div key={d.id} className="grid grid-cols-12 gap-2 py-3 border-b items-center">
                <span className="col-span-2 font-semibold">#{d.id}</span>
                <span className="col-span-2">#{d.transaction_id || '-'}</span>
                <span className="col-span-2">{d.user_name}</span>
                <span className="col-span-2">{typeLabel[d.type]}</span>
                <span className="col-span-1">{statusBadge(d.status)}</span>
                <span className="col-span-2">{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="col-span-1 text-right">
                  <Button asChild variant="link" className="text-orange-600 px-0"> 
                    <Link to={`/admin/disputes/${d.id}`}>Voir</Link>
                  </Button>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

