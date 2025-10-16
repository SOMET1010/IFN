import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ReviewSystem } from '@/components/ui/review-system';

export default function ProductReviewsPage() {
  const { id } = useParams();
  const productId = id || '1';
  return (
    <DashboardLayout title="Évaluations du Produit" subtitle="Aperçu consolidé des évaluations.">
      <ReviewSystem productId={productId} productName={`Produit #${productId}`} />
    </DashboardLayout>
  );
}

