import * as React from 'react';
import { ProductReview, ProductRating } from '@/types';

interface ReviewContextType {
  reviews: ProductReview[];
  ratings: ProductRating[];
  getProductReviews: (productId: string) => ProductReview[];
  getProductRating: (productId: string) => ProductRating | undefined;
  addReview: (review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<ProductReview>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  markReviewHelpful: (reviewId: string, isHelpful: boolean) => Promise<void>;
  addProducerResponse: (reviewId: string, response: Omit<ProductReview['response'], 'responded_at'>) => Promise<void>;
  getUserReviews: (userId: string) => ProductReview[];
  isLoading: boolean;
}

const ReviewContext = React.createContext<ReviewContextType | undefined>(undefined);

export const useReview = () => {
  const context = React.useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = React.useState<ProductReview[]>([]);
  const [ratings, setRatings] = React.useState<ProductRating[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Load reviews and ratings from localStorage on mount
  React.useEffect(() => {
    const savedReviews = localStorage.getItem('productReviews');
    const savedRatings = localStorage.getItem('productRatings');

    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Initialize with mock reviews
      setReviews(generateMockReviews());
    }

    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    } else {
      // Initialize with mock ratings
      setRatings(generateMockRatings());
    }
  }, []);

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    localStorage.setItem('productReviews', JSON.stringify(reviews));
  }, [reviews]);

  React.useEffect(() => {
    localStorage.setItem('productRatings', JSON.stringify(ratings));
  }, [ratings]);

  const generateMockReviews = (): ProductReview[] => {
    return [
      {
        id: '1',
        product_id: '1',
        user_id: 'user1',
        user_name: 'Marie Konan',
        rating: 5,
        title: 'Excellent qualité!',
        comment: 'Les mangues sont vraiment délicieuses et bien mûres. Livraison rapide et emballage soigné. Je recommande vivement!',
        helpful_count: 12,
        is_helpful: false,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        response: {
          comment: 'Merci beaucoup pour votre avis! Nous sommes ravis que vous ayez apprécié nos mangues.',
          responder_name: 'Kouadio Amani',
          responder_type: 'producer',
          responded_at: '2024-01-15T14:20:00Z'
        }
      },
      {
        id: '2',
        product_id: '1',
        user_id: 'user2',
        user_name: 'Jean Kouassi',
        rating: 4,
        title: 'Très bon produit',
        comment: 'Bonne qualité, prix raisonnable. Juste un petit délai de livraison mais rien de grave.',
        helpful_count: 8,
        is_helpful: true,
        created_at: '2024-01-10T15:45:00Z',
        updated_at: '2024-01-10T15:45:00Z'
      },
      {
        id: '3',
        product_id: '4',
        user_id: 'user3',
        user_name: 'Fatou Traoré',
        rating: 5,
        title: 'Tomates parfaites',
        comment: 'Des tomates fraîches et juteuses, parfaites pour mes salades. Je vais en commander régulièrement.',
        helpful_count: 15,
        is_helpful: true,
        created_at: '2024-01-12T09:20:00Z',
        updated_at: '2024-01-12T09:20:00Z'
      },
      {
        id: '4',
        product_id: '7',
        user_id: 'user4',
        user_name: 'Yao N\'Guessan',
        rating: 4,
        title: 'Poulets de qualité',
        comment: 'Les poulets sont bien en chair et ont bon goût. Le seul petit point négatif est le prix un peu élevé.',
        helpful_count: 6,
        is_helpful: false,
        created_at: '2024-01-08T16:30:00Z',
        updated_at: '2024-01-08T16:30:00Z',
        response: {
          comment: 'Merci pour votre retour. Nous travaillons à maintenir un bon rapport qualité/prix pour nos clients.',
          responder_name: 'Fatou Traoré',
          responder_type: 'producer',
          responded_at: '2024-01-09T11:15:00Z'
        }
      }
    ];
  };

  const generateMockRatings = (): ProductRating[] => {
    return [
      {
        product_id: '1',
        average_rating: 4.5,
        total_reviews: 24,
        rating_distribution: { 5: 18, 4: 4, 3: 1, 2: 1, 1: 0 }
      },
      {
        product_id: '2',
        average_rating: 4.2,
        total_reviews: 18,
        rating_distribution: { 5: 12, 4: 4, 3: 2, 2: 0, 1: 0 }
      },
      {
        product_id: '3',
        average_rating: 4.0,
        total_reviews: 15,
        rating_distribution: { 5: 8, 4: 5, 3: 2, 2: 0, 1: 0 }
      },
      {
        product_id: '4',
        average_rating: 4.7,
        total_reviews: 31,
        rating_distribution: { 5: 25, 4: 4, 3: 2, 2: 0, 1: 0 }
      },
      {
        product_id: '5',
        average_rating: 4.3,
        total_reviews: 22,
        rating_distribution: { 5: 15, 4: 5, 3: 2, 2: 0, 1: 0 }
      },
      {
        product_id: '6',
        average_rating: 4.1,
        total_reviews: 19,
        rating_distribution: { 5: 12, 4: 5, 3: 2, 2: 0, 1: 0 }
      },
      {
        product_id: '7',
        average_rating: 4.4,
        total_reviews: 28,
        rating_distribution: { 5: 20, 4: 6, 3: 2, 2: 0, 1: 0 }
      },
      {
        product_id: '8',
        average_rating: 4.6,
        total_reviews: 35,
        rating_distribution: { 5: 28, 4: 5, 3: 2, 2: 0, 1: 0 }
      }
    ];
  };

  const getProductReviews = (productId: string) => {
    return reviews
      .filter(review => review.product_id === productId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const getProductRating = (productId: string) => {
    return ratings.find(rating => rating.product_id === productId);
  };

  const calculateRating = (productId: string): ProductRating => {
    const productReviews = reviews.filter(review => review.product_id === productId);

    if (productReviews.length === 0) {
      return {
        product_id: productId,
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productReviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      product_id: productId,
      average_rating: Number(averageRating.toFixed(1)),
      total_reviews: productReviews.length,
      rating_distribution: distribution
    };
  };

  const addReview = async (reviewData: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newReview: ProductReview = {
      ...reviewData,
      id: 'review-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setReviews(prev => [newReview, ...prev]);

    // Update rating
    const newRating = calculateRating(reviewData.product_id);
    setRatings(prev => {
      const existing = prev.find(r => r.product_id === reviewData.product_id);
      if (existing) {
        return prev.map(r => r.product_id === reviewData.product_id ? newRating : r);
      }
      return [...prev, newRating];
    });

    setIsLoading(false);
  };

  const updateReview = async (reviewId: string, updates: Partial<ProductReview>) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, ...updates, updated_at: new Date().toISOString() }
        : review
    ));

    // Update rating if rating was changed
    if (updates.rating) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        const newRating = calculateRating(review.product_id);
        setRatings(prev => prev.map(r => r.product_id === review.product_id ? newRating : r));
      }
    }

    setIsLoading(false);
  };

  const deleteReview = async (reviewId: string) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      setReviews(prev => prev.filter(r => r.id !== reviewId));

      // Update rating
      const newRating = calculateRating(review.product_id);
      setRatings(prev => prev.map(r => r.product_id === review.product_id ? newRating : r));
    }

    setIsLoading(false);
  };

  const markReviewHelpful = async (reviewId: string, isHelpful: boolean) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? {
            ...review,
            helpful_count: isHelpful
              ? review.helpful_count + 1
              : Math.max(0, review.helpful_count - 1),
            is_helpful: isHelpful
          }
        : review
    ));
  };

  const addProducerResponse = async (
    reviewId: string,
    responseData: Omit<ProductReview['response'], 'responded_at'>
  ) => {
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? {
            ...review,
            response: {
              ...responseData,
              responded_at: new Date().toISOString()
            }
          }
        : review
    ));
  };

  const getUserReviews = (userId: string) => {
    return reviews
      .filter(review => review.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      ratings,
      getProductReviews,
      getProductRating,
      addReview,
      updateReview,
      deleteReview,
      markReviewHelpful,
      addProducerResponse,
      getUserReviews,
      isLoading
    }}>
      {children}
    </ReviewContext.Provider>
  );
};