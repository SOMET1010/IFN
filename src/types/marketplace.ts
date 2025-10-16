// Types pour la marketplace étendue

export interface MarketplaceFilters {
  products: string[];
  qualities: ("A" | "B" | "C" | "mixed")[];
  priceRange: [number, number];
  quantityRange: [number, number];
  locations: string[];
  deliveryDays: ("0-3" | "3-7" | "7-14" | "14+")[];
  paymentTerms: ("cash" | "30-days" | "60-days")[];
  cooperativeRating: [number, number];
  certifications: ("bio" | "igp" | "fair-trade")[];
  searchQuery: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: Partial<MarketplaceFilters>;
  createdAt: string;
  lastUsed: string;
}

export interface OfferDetailed {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  cooperativeLogo: string;
  cooperativeRating: number;
  cooperativeTransactions: number;
  title: string;
  description: string;
  products: {
    productId: string;
    productName: string;
    quantity: number;
    quality: "A" | "B" | "C";
    unitPrice: number;
  }[];
  totalQuantity: number;
  totalPrice: number;
  unitPrice: number;
  negotiationMargin: number;
  photos: string[];
  certifications: ("bio" | "igp" | "fair-trade")[];
  status: "active" | "sold" | "expired";
  createdAt: string;
  expiresAt: string;
  views: number;
  interests: number;
  activeNegotiations: number;
  paymentTerms: {
    method: "cash" | "30-days" | "60-days";
    description: string;
  };
  deliveryTerms: {
    type: "franco" | "ex-works";
    location: string;
    coordinates?: [number, number];
    estimatedDays: number;
    description: string;
  };
  minimumOrder: number;
  availableStock: number;
  harvestDate?: string;
  storageConditions?: string;
}

export interface CooperativeProfile {
  id: string;
  name: string;
  logo: string;
  banner: string;
  slogan: string;
  description: string;
  foundedYear: number;
  location: string;
  coordinates: [number, number];
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  members: number;
  mainProducts: string[];
  certifications: {
    type: "bio" | "igp" | "fair-trade";
    name: string;
    issuedBy: string;
    validUntil: string;
  }[];
  photos: string[];
  overallRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  stats: {
    totalTransactions: number;
    totalVolume: number;
    satisfactionRate: number;
    averageDeliveryDays: number;
    responseTime: number;
  };
  activeOffers: number;
  recentReviews: CooperativeReview[];
  achievements: {
    icon: string;
    title: string;
    description: string;
    earnedAt: string;
  }[];
}

export interface CooperativeReview {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  rating: number;
  comment: string;
  productsPurchased: string[];
  transactionDate: string;
  createdAt: string;
  helpful: number;
}

export interface WatchlistItem {
  id: string;
  offerId: string;
  offerTitle: string;
  offerPreview: {
    cooperativeName: string;
    products: string[];
    price: number;
    quantity: number;
    expiresAt: string;
  };
  addedAt: string;
  tags: string[];
  notes: string;
  alerts: {
    priceChange: boolean;
    expirationWarning: boolean;
    similarOffers: boolean;
  };
}

export interface WatchlistAlert {
  id: string;
  watchlistItemId: string;
  type: "price-drop" | "price-increase" | "expiring-soon" | "similar-offer" | "back-in-stock";
  title: string;
  message: string;
  oldValue?: any;
  newValue?: any;
  createdAt: string;
  read: boolean;
}

export interface SimilarOffer {
  offerId: string;
  title: string;
  cooperativeName: string;
  price: number;
  quantity: number;
  similarity: number;
  reason: string;
}

export interface MarketplaceStats {
  totalOffers: number;
  activeOffers: number;
  totalCooperatives: number;
  totalVolume: number;
  averagePrice: number;
  popularProducts: {
    productName: string;
    offers: number;
    volume: number;
  }[];
  topCooperatives: {
    cooperativeId: string;
    cooperativeName: string;
    rating: number;
    offers: number;
  }[];
}

export interface LocationMarker {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  coordinates: [number, number];
  activeOffers: number;
  rating: number;
  preview: {
    logo: string;
    products: string[];
    lowestPrice: number;
  };
}

