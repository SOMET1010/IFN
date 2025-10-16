import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useReview } from '@/contexts/ReviewContext';
import { Star, Search, Flag } from 'lucide-react';
import ReportReviewDialog from '@/components/reviews/ReportReviewDialog';

export default function ReviewsPage() {
  const { reviews } = useReview();
  const [q, setQ] = useState('');
  const [sortByRating, setSortByRating] = useState<'all'|'asc'|'desc'>('all');
  const [sortByDate, setSortByDate] = useState<'desc'|'asc'>('desc');

  const items = useMemo(() => {
    let list = reviews;
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(r => r.user_name.toLowerCase().includes(s) || r.comment.toLowerCase().includes(s) || r.title.toLowerCase().includes(s));
    }
    if (sortByRating !== 'all') {
      list = [...list].sort((a,b)=> sortByRating==='asc' ? a.rating-b.rating : b.rating-a.rating);
    }
    list = [...list].sort((a,b)=> sortByDate==='desc' ? new Date(b.created_at).getTime()-new Date(a.created_at).getTime() : new Date(a.created_at).getTime()-new Date(b.created_at).getTime());
    return list;
  }, [reviews, q, sortByRating, sortByDate]);

  const onReport = (id: string, reason: string) => {
    const reports = JSON.parse(localStorage.getItem('reviewReports') || '[]');
    reports.push({ id, reason, at: new Date().toISOString() });
    localStorage.setItem('reviewReports', JSON.stringify(reports));
  };

  return (
    <DashboardLayout title="Avis et évaluations" subtitle="Consultez les avis des clients sur vos produits et services.">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher des avis" className="pl-10" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <select className="border rounded-md px-3 py-2 text-sm" value={sortByRating} onChange={(e)=>setSortByRating(e.target.value as any)}>
            <option value="all">Note</option>
            <option value="desc">Plus haute</option>
            <option value="asc">Plus basse</option>
          </select>
          <select className="border rounded-md px-3 py-2 text-sm" value={sortByDate} onChange={(e)=>setSortByDate(e.target.value as any)}>
            <option value="desc">Date</option>
            <option value="asc">Plus ancien</option>
          </select>
        </div>

        {items.map(r => (
          <Card key={r.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{r.user_name}</div>
                  <div className="flex items-center gap-1 text-primary mt-1">
                    {Array.from({length: 5}).map((_,i)=> <Star key={i} className={`h-4 w-4 ${i<r.rating ? 'fill-primary' : 'text-muted-foreground'}`} />)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</div>
              </div>
              <p className="mt-3">{r.comment}</p>
              <div className="mt-3 flex items-center gap-2">
                <ReportReviewDialog
                  trigger={<Button variant="ghost" size="sm" className="text-orange-600"><Flag className="h-4 w-4 mr-1"/>Signaler</Button>}
                  onSubmit={(reason)=>onReport(r.id, reason)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

