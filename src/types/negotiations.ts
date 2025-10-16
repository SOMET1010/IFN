// Types pour les négociations collectives avancées

export interface NegotiationExtended {
  id: string;
  offerId: string;
  offerTitle: string;
  offerProducts: string[];
  cooperativeId: string;
  cooperativeName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  buyerRating: number;
  status: "pending" | "in-progress" | "accepted" | "rejected" | "expired" | "counter-offered";
  startedAt: string;
  expiresAt: string;
  lastActivity: string;
  unreadMessages: number;
  currentOffer: {
    price: number;
    quantity: number;
    totalPrice: number;
    conditions: string;
  };
  initialOffer: {
    price: number;
    quantity: number;
    totalPrice: number;
  };
  urgency: "low" | "medium" | "high";
  isBestOffer: boolean;
}

export interface OfferComparison {
  offerId: string;
  offerTitle: string;
  buyers: BuyerOffer[];
  recommendedBuyerId: string;
  comparisonDate: string;
}

export interface BuyerOffer {
  buyerId: string;
  buyerName: string;
  buyerRating: number;
  buyerTransactions: number;
  price: number;
  quantity: number;
  totalPrice: number;
  paymentTerms: {
    method: "cash" | "30-days" | "60-days";
    description: string;
  };
  deliveryTerms: {
    type: "franco" | "ex-works";
    location: string;
    estimatedDays: number;
  };
  score: number;
  breakdown: {
    priceScore: number;
    reputationScore: number;
    conditionsScore: number;
    historyScore: number;
  };
  previousTransactions: number;
  averagePaymentDelay: number;
}

export interface BuyerRating {
  id: string;
  buyerId: string;
  buyerName: string;
  cooperativeId: string;
  cooperativeName: string;
  transactionId: string;
  overallRating: number;
  criteria: {
    payment: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  comment: string;
  proofs: string[];
  createdAt: string;
  helpful: number;
}

export interface BuyerProfile {
  id: string;
  name: string;
  avatar: string;
  companyName: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  overallRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  criteriaAverages: {
    payment: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  badges: BuyerBadge[];
  totalTransactions: number;
  totalVolume: number;
  memberSince: string;
  lastActive: string;
  verifiedIdentity: boolean;
}

export interface BuyerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface NegotiationMetrics {
  totalNegotiations: number;
  activeNegotiations: number;
  conversionRate: number;
  averageDuration: number;
  averageDiscount: number;
  topBuyers: {
    buyerId: string;
    buyerName: string;
    transactions: number;
    totalValue: number;
  }[];
  monthlyTrend: {
    month: string;
    negotiations: number;
    conversions: number;
    revenue: number;
  }[];
  byProduct: {
    productName: string;
    negotiations: number;
    conversionRate: number;
    averagePrice: number;
  }[];
}

export interface NegotiationInsight {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
  metric?: string;
  comparison?: string;
  recommendation?: string;
  createdAt: string;
}

