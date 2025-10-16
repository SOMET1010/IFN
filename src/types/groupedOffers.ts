import type { ProductQuality, StockContribution } from "./stock";

export type OfferStatus = "draft" | "active" | "sold" | "expired" | "cancelled";
export type OfferQuality = "A" | "B" | "C" | "mixed";
export type NegotiationStatus = "pending" | "in-progress" | "accepted" | "rejected" | "expired";

export interface GroupedOffer {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  cooperativeLogo?: string;
  title: string;
  description: string;
  products: OfferProduct[];
  totalQuantity: number;
  quality: OfferQuality;
  unitPrice: number; // FCFA/kg
  totalPrice: number;
  negotiationMargin: number; // Pourcentage (0-15%)
  photos: string[];
  status: OfferStatus;
  createdAt: string;
  expiresAt: string;
  views: number;
  interests: number;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  minimumOrder?: number;
  bulkDiscount?: BulkDiscount;
}

export interface OfferProduct {
  productId: string;
  productName: string;
  quantity: number;
  quality: ProductQuality;
  contributions: StockContribution[];
}

export interface PaymentTerms {
  method: "cash" | "30-days" | "60-days";
  advancePayment?: number; // Pourcentage d'acompte
}

export interface DeliveryTerms {
  type: "franco" | "ex-works"; // Franco = livré, Ex-works = départ coopérative
  location: string;
  estimatedDays: number;
}

export interface BulkDiscount {
  threshold: number; // Quantité minimale
  discountPercentage: number;
}

export interface Negotiation {
  id: string;
  offerId: string;
  merchantId: string;
  merchantName: string;
  merchantAvatar?: string;
  status: NegotiationStatus;
  startedAt: string;
  expiresAt: string;
  messages: NegotiationMessage[];
  offers: NegotiationOffer[];
}

export interface NegotiationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: "cooperative" | "merchant";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface NegotiationOffer {
  id: string;
  type: "initial" | "counter";
  proposedBy: "cooperative" | "merchant";
  price: number;
  quantity: number;
  conditions?: string;
  timestamp: string;
  status: "pending" | "accepted" | "rejected";
}

export interface GroupedOfferData {
  title: string;
  description: string;
  selectedProducts: string[]; // Product IDs
  quality: OfferQuality;
  unitPrice: number;
  negotiationMargin: number;
  photos: File[];
  expiresAt: string;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  minimumOrder?: number;
  bulkDiscount?: BulkDiscount;
}

export interface CounterOffer {
  price: number;
  quantity: number;
  conditions?: string;
}

export interface OfferStats {
  activeOffers: number;
  soldThisMonth: number;
  totalRevenue: number;
  conversionRate: number;
}

