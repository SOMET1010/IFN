import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReview } from '@/contexts/ReviewContext';
import { Search } from 'lucide-react';

export default function AdminReviews() {
  const { reviews, updateReview } = useReview();
  const [q, setQ] = useState('');
  const [state, setState] = useState<'all'|'approved'|'pending'|'rejected'>('all');

  const items = useMemo(()=>{
    let list = reviews;
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(r => r.user_name.toLowerCase().includes(s) || r.comment.toLowerCase().includes(s));
    }
    if (state !== 'all') list = list.filter(r => (r.status || 'approved') === state);
    return list.sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [reviews, q, state]);

  const setStatus = (id: string, status: 'approved'|'pending'|'rejected') => updateReview(id, { status });

  const statusBadge = (status?: string) => {
    const s = status || 'approved';
    const map: Record<string, {label:string;variant: 'default'|'secondary'|'outline'|'destructive'}> = {
      approved: { label:'Approuvé', variant:'default' },
      pending: { label:'En attente', variant:'outline' },
      rejected: { label:'Rejeté', variant:'destructive' },
    };
    const conf = map[s];
    return <Badge variant={conf.variant}>{conf.label}</Badge>;
  };

  return (
    <DashboardLayout title="Avis" subtitle="Gérez les avis des utilisateurs sur la plateforme.">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher des avis" className="pl-10" value={q} onChange={(e)=>setQ(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2 text-sm" value={state} onChange={(e)=>setState(e.target.value as any)}>
              <option value="all">Filtrer par état</option>
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liste des avis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm font-medium text-muted-foreground pb-2 border-b">
              <span className="col-span-3">UTILISATEUR</span>
              <span className="col-span-5">AVIS</span>
              <span className="col-span-2">ÉTAT</span>
              <span className="col-span-1">DATE</span>
              <span className="col-span-1 text-right">ACTIONS</span>
            </div>
            {items.map(r => (
              <div key={r.id} className="grid grid-cols-12 gap-2 py-3 border-b items-center">
                <span className="col-span-3 font-medium">{r.user_name}</span>
                <span className="col-span-5 truncate">{r.comment}</span>
                <span className="col-span-2">{statusBadge(r.status)}</span>
                <span className="col-span-1">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="col-span-1 text-right flex gap-1 justify-end">
                  <Button variant="ghost" size="sm" onClick={()=>setStatus(r.id, 'approved')}>Approuver</Button>
                  <Button variant="ghost" size="sm" onClick={()=>setStatus(r.id, 'pending')}>Mettre en attente</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={()=>setStatus(r.id, 'rejected')}>Rejeter</Button>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

