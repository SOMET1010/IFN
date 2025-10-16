import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useReview } from '@/contexts/ReviewContext';
import { Star, ThumbsUp, Flag } from 'lucide-react';
import ReportReviewDialog from '@/components/reviews/ReportReviewDialog';

export default function MyReviewsPage() {
  const { user } = useAuth();
  const { getUserReviews, markReviewHelpful } = useReview();
  const items = user ? getUserReviews(user.id) : [];

  return (
    <DashboardLayout title="Mes avis">
      <div className="space-y-4">
        {items.map(r => (
          <Card key={r.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="flex items-center gap-1 text-primary mt-1">
                    {Array.from({length: 5}).map((_,i)=> <Star key={i} className={`h-4 w-4 ${i<r.rating ? 'fill-primary' : 'text-muted-foreground'}`} />)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString('fr-FR', { month:'long', day:'numeric', year:'numeric' })}</div>
              </div>
              <p className="mt-3">{r.comment}</p>
              <div className="mt-3 flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={()=>markReviewHelpful(r.id, !r.is_helpful)}>
                  <ThumbsUp className="h-4 w-4 mr-1"/> {r.helpful_count}
                </Button>
                <ReportReviewDialog trigger={<Button variant="ghost" size="sm" className="text-orange-600"><Flag className="h-4 w-4 mr-1"/>Signaler</Button>} onSubmit={()=>{}} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

