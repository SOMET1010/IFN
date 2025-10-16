import { useState } from 'react';
import { useReview } from '@/contexts/ReviewContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  Image as ImageIcon,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ReviewSystemProps {
  productId: string;
  productName: string;
  showWriteReview?: boolean;
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  productId,
  productName,
  showWriteReview = true
}) => {
  const { user } = useAuth();
  const {
    getProductReviews,
    getProductRating,
    addReview,
    markReviewHelpful,
    isLoading
  } = useReview();

  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  const reviews = getProductReviews(productId);
  const rating = getProductRating(productId);

  const handleSubmitReview = async () => {
    if (!user || !newReview.title.trim() || !newReview.comment.trim()) return;

    setIsSubmitting(true);

    try {
      await addReview({
        product_id: productId,
        user_id: user.id,
        user_name: user.name,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        helpful_count: 0
      });

      setNewReview({ rating: 5, title: '', comment: '' });
      setIsWriteReviewOpen(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, readonly = false }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'hover:text-yellow-400'
          }`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const RatingSummary = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Rating */}
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900">
          {rating?.average_rating || 0}
        </div>
        <div className="flex items-center justify-center mt-1">
          <StarRating rating={rating?.average_rating || 0} readonly />
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {rating?.total_reviews || 0} avis
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = rating?.rating_distribution[star as keyof typeof rating.rating_distribution] || 0;
          const percentage = rating?.total_reviews ? (count / rating.total_reviews) * 100 : 0;

          return (
            <div key={star} className="flex items-center space-x-2">
              <span className="text-sm w-4">{star}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ReviewItem = ({ review }: { review: { id: string; rating: number; comment: string; reviewer: string; date: string; helpful: number } }) => {
    const [helpfulLoading, setHelpfulLoading] = useState(false);

    const handleHelpful = async (isHelpful: boolean) => {
      setHelpfulLoading(true);
      await markReviewHelpful(review.id, isHelpful);
      setHelpfulLoading(false);
    };

    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <div className="font-medium">{review.user_name}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <StarRating rating={review.rating} readonly />
                <span>•</span>
                <span>{formatDate(review.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-medium mb-2">{review.title}</h4>
          <p className="text-gray-700">{review.comment}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleHelpful(!review.is_helpful)}
              disabled={helpfulLoading}
              className={`text-sm ${
                review.is_helpful ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 mr-1 ${review.is_helpful ? 'fill-current' : ''}`} />
              Utile ({review.helpful_count})
            </Button>
          </div>

          {review.response && (
            <Badge variant="secondary" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Réponse du producteur
            </Badge>
          )}
        </div>

        {review.response && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                {review.response.responder_name} ({review.response.responder_type})
              </span>
            </div>
            <p className="text-blue-800 text-sm">{review.response.comment}</p>
            <div className="text-xs text-blue-600 mt-1">
              {formatDate(review.response.responded_at)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const WriteReviewDialog = () => (
    <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
      <DialogTrigger asChild>
        {showWriteReview && user && (
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Écrire un avis
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Écrire un avis pour {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Note</Label>
            <div className="mt-2">
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="review-title">Titre de l'avis</Label>
            <Input
              id="review-title"
              value={newReview.title}
              onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Résumez votre expérience..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="review-comment">Votre avis</Label>
            <Textarea
              id="review-comment"
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Partagez votre expérience avec ce produit..."
              className="mt-1"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsWriteReviewOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting || !newReview.title.trim() || !newReview.comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publication...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publier l'avis
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Avis clients</h3>
          <p className="text-gray-500">
            {rating?.total_reviews || 0} avis pour {productName}
          </p>
        </div>
        <WriteReviewDialog />
      </div>

      {/* Rating Summary */}
      {rating && (
        <Card>
          <CardContent className="p-6">
            <RatingSummary />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun avis pour le moment
              </h3>
              <p className="text-gray-500 mb-4">
                Soyez le premier à partager votre expérience avec ce produit!
              </p>
              {showWriteReview && user && <WriteReviewDialog />}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Load More */}
      {reviews.length > 5 && (
        <div className="text-center">
          <Button variant="outline">
            Voir plus d'avis
          </Button>
        </div>
      )}
    </div>
  );
};