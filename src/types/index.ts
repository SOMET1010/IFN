export interface User {
  id: string;
  name: string;
  email: string;
  role: 'merchant' | 'producer' | 'cooperative' | 'admin';
  avatar?: string;
  location?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Product {
  id: string;
  name: string;
  category: 'fruits' | 'legumes' | 'volaille' | 'poissons' | 'cereales';
  price: number;
  currency: 'FCFA';
  quantity: number;
  unit: 'kg' | 'piece' | 'tonne';
  producer: string;
  location: string;
  harvest_date?: string;
  expiry_date?: string;
  image?: string;
  description?: string;
  status: 'available' | 'sold' | 'reserved';
}

export interface Order {
  id: string;
  products: Array<{
    product_id: string;
    quantity: number;
    price: number;
    product_name: string;
    product_image?: string;
  }>;
  buyer_id: string;
  buyer_info: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  seller_id: string;
  seller_info: {
    name: string;
    phone: string;
    location: string;
  };
  total_amount: number;
  delivery_fee: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  order_date: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: {
    type: 'mobile_money' | 'credit_card' | 'bank_transfer';
    provider?: string;
    last4?: string;
  };
  delivery_method: 'delivery' | 'pickup';
  delivery_instructions?: string;
  tracking_number?: string;
  updates: Array<{
    status: string;
    message: string;
    timestamp: string;
    location?: string;
  }>;
}

export interface CooperativeMember {
  id: string;
  user_id: string;
  cooperative_id: string;
  name: string;
  role: string;
  contribution_type: 'mensuelle' | 'hebdomadaire' | 'ponctuelle';
  contribution_amount: number;
  status: 'active' | 'inactive' | 'pending';
  joined_date: string;
}

export interface DashboardStats {
  offers?: number;
  harvests?: number;
  sales?: number;
  revenue?: number;
  stocks?: number;
  orders?: number;
  payments?: number;
  members?: number;
  distribution_rate?: number;
  global_performance?: number;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
  added_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'credit_card' | 'bank_transfer';
  provider: 'orange_money' | 'mtn_money' | 'moov_money' | 'visa' | 'mastercard' | 'ecobank';
  phone_number?: string;
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  is_default: boolean;
}

export interface UserPreferences {
  user_id: string;
  favorite_categories: string[];
  preferred_producers: string[];
  notification_settings: {
    email: boolean;
    sms: boolean;
    push: boolean;
    new_offers: boolean;
    price_drops: boolean;
    order_updates: boolean;
  };
  delivery_preferences: {
    preferred_delivery_method: 'pickup' | 'delivery';
    default_address?: string;
    delivery_instructions?: string;
  };
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  helpful_count: number;
  is_helpful?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  reports_count?: number;
  created_at: string;
  updated_at: string;
  response?: {
    comment: string;
    responder_name: string;
    responder_type: 'producer' | 'admin';
    responded_at: string;
  };
}

export interface ProductRating {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ProducerOffer {
  id: string;
  product: string;
  quantity: number;
  unit: 'kg' | 'piece' | 'tonne';
  price: number;
  price_unit: 'FCFA/kg' | 'FCFA/piece' | 'FCFA/tonne';
  description?: string;
  status: 'en_cours' | 'terminee' | 'en_attente' | 'annulee';
  harvest_date?: string;
  expiry_date?: string;
  producer_id: string;
  producer_name: string;
  location?: string;
  quality?: 'Standard' | 'Premium' | 'Bio';
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProducerHarvest {
  id: string;
  product: string;
  variety?: string;
  quantity: number;
  unit: 'kg' | 'piece' | 'tonne' | 'sac';
  date: string;
  location?: string;
  quality: 'Standard' | 'Premium' | 'Bio' | 'AOP' | 'Label Rouge';
  weather_conditions?: string;
  producer_id: string;
  notes?: string;
  photos?: string[];
  voiceNotes?: string[];
  grade?: number;
  created_at: string;
  updated_at: string;
}

export interface ProducerSale {
  id: string;
  product: string;
  quantity: number;
  unit: 'kg' | 'piece' | 'tonne';
  price: number;
  total_price: number;
  currency: 'FCFA';
  buyer: string;
  buyer_type: 'cooperative' | 'merchant' | 'individual';
  buyer_contact?: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  payment_method?: 'mobile_money' | 'bank_transfer' | 'cash';
  payment_status?: 'paid' | 'pending' | 'failed';
  producer_id: string;
  offer_id?: string;
  delivery_method?: 'pickup' | 'delivery';
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
