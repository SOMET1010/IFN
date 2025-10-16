// Enums for better type safety
export enum InventoryStatus {
  OK = 'ok',
  LOW = 'low',
  CRITICAL = 'critical'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed'
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash'
}

export enum SaleStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

// Status variants mapping for UI components
export const InventoryStatusVariants = {
  [InventoryStatus.OK]: 'default' as const,
  [InventoryStatus.LOW]: 'outline' as const,
  [InventoryStatus.CRITICAL]: 'destructive' as const
};

export const InventoryStatusLabels = {
  [InventoryStatus.OK]: 'Stock OK',
  [InventoryStatus.LOW]: 'Stock faible',
  [InventoryStatus.CRITICAL]: 'Stock critique'
};

export const OrderStatusVariants = {
  [OrderStatus.PENDING]: 'outline' as const,
  [OrderStatus.CONFIRMED]: 'default' as const,
  [OrderStatus.DELIVERED]: 'secondary' as const,
  [OrderStatus.CANCELLED]: 'destructive' as const
};

export const OrderStatusLabels = {
  [OrderStatus.PENDING]: 'En attente',
  [OrderStatus.CONFIRMED]: 'Confirmée',
  [OrderStatus.DELIVERED]: 'Livrée',
  [OrderStatus.CANCELLED]: 'Annulée'
};

export const PaymentStatusVariants = {
  [PaymentStatus.COMPLETED]: 'default' as const,
  [PaymentStatus.PENDING]: 'outline' as const,
  [PaymentStatus.FAILED]: 'destructive' as const
};

export const PaymentStatusLabels = {
  [PaymentStatus.COMPLETED]: 'Reçu',
  [PaymentStatus.PENDING]: 'En attente',
  [PaymentStatus.FAILED]: 'Échoué'
};

export const PaymentMethodLabels = {
  [PaymentMethod.MOBILE_MONEY]: 'Mobile Money',
  [PaymentMethod.BANK_TRANSFER]: 'Virement bancaire',
  [PaymentMethod.CASH]: 'Espèces'
};

export const SaleStatusVariants = {
  [SaleStatus.COMPLETED]: 'default' as const,
  [SaleStatus.PENDING]: 'outline' as const,
  [SaleStatus.CANCELLED]: 'destructive' as const
};

export const SaleStatusLabels = {
  [SaleStatus.COMPLETED]: 'Terminée',
  [SaleStatus.PENDING]: 'En cours',
  [SaleStatus.CANCELLED]: 'Annulée'
};

// Type guard functions
export const isInventoryStatus = (value: string): value is InventoryStatus => {
  return Object.values(InventoryStatus).includes(value as InventoryStatus);
};

export const isOrderStatus = (value: string): value is OrderStatus => {
  return Object.values(OrderStatus).includes(value as OrderStatus);
};

export const isPaymentStatus = (value: string): value is PaymentStatus => {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
};

export const isPaymentMethod = (value: string): value is PaymentMethod => {
  return Object.values(PaymentMethod).includes(value as PaymentMethod);
};

export const isSaleStatus = (value: string): value is SaleStatus => {
  return Object.values(SaleStatus).includes(value as SaleStatus);
};

export interface MerchantClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  preferences: string[];
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisit: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface ClientPurchaseHistory {
  id: string;
  clientId: string;
  products: PurchasedProduct[];
  totalAmount: number;
  paymentMethod: string;
  purchaseDate: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface PurchasedProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface ProductRecommendation {
  productId: string;
  productName: string;
  score: number;
  reason: string;
  category: string;
  price: number;
  stock: number;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y';
  value: number;
  conditions: PromotionCondition[];
  applicableProducts: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface PromotionCondition {
  type: 'min_quantity' | 'min_amount' | 'customer_loyalty' | 'time_restricted';
  value: number;
  operator: 'gte' | 'lte' | 'eq';
}

export interface BarcodeScan {
  barcode: string;
  productId?: string;
  timestamp: Date;
  isValid: boolean;
}

export interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  entities: Record<string, unknown>;
  confidence: number;
  timestamp: Date;
  status: 'pending' | 'processed' | 'failed';
}

export interface DigitalReceipt {
  id: string;
  saleId: string;
  receiptNumber: string;
  clientInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  transactionDate: Date;
  status: 'generated' | 'sent' | 'failed';
}

export interface ReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'cash' | 'credit';
  provider?: string;
  icon: string;
  fees: number;
  isActive: boolean;
  currency: string;
  minAmount: number;
  maxAmount: number;
  processingTime: number;
  isAvailable: boolean;
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  methodId: string;
  methodName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  fees: number;
  totalAmount: number;
  metadata: Record<string, unknown>;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  isDefault: boolean;
  format: 'text' | 'html' | 'pdf';
  variables: string[];
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'cash' | 'credit';
  provider?: string;
  icon: string;
  isActive: boolean;
  fees: number;
  currency: string;
  minAmount: number;
  maxAmount: number;
  processingTime: number;
  isAvailable: boolean;
  requiresConfirmation: boolean;
  supportedCountries: string[];
}

export interface PaymentProcessingResult {
  success: boolean;
  transaction?: PaymentTransaction;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationCode?: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  expiryDate?: string;
  supplier?: string;
  weight?: number;
  dimensions?: {length: number, width: number, height: number};
}

export interface ScanResult {
  success: boolean;
  product?: ProductInfo;
  error?: string;
  confidence: number;
  scanTime: number;
}

export interface VoiceCommandResult {
  success: boolean;
  command?: VoiceCommand;
  error?: string;
  alternatives?: VoiceCommand[];
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  clientId?: string;
  transactionId: string;
  discountAmount: number;
  usageDate: Date;
}

export interface PromotionAnalytics {
  promotionId: string;
  totalUsage: number;
  totalDiscount: number;
  averageDiscount: number;
  usageByDay: Record<string, number>;
  topProducts: Array<{productId: string, usage: number}>;
}

export interface CampaignMetrics {
  campaignId: string;
  totalPromotions: number;
  activePromotions: number;
  totalDiscounts: number;
  redemptionRate: number;
  startDate: Date;
  endDate: Date;
}

export interface ClientSearchFilters {
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  loyaltyLevel?: string;
  isActive?: boolean;
  minSpent?: number;
  maxSpent?: number;
  visitCount?: number;
}

export interface ClientSegment {
  id: string;
  name: string;
  description: string;
  criteria: ClientSearchFilters;
  clientCount: number;
  totalSpent: number;
  averageSpent: number;
  createdAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  levels: Array<{
    name: string;
    minPoints: number;
    benefits: string[];
    discountRate: number;
  }>;
  isActive: boolean;
}

export interface CommunicationLog {
  id: string;
  clientId: string;
  type: 'email' | 'sms' | 'notification';
  channel: string;
  message: string;
  sentDate: Date;
  status: 'sent' | 'failed' | 'pending';
  metadata?: Record<string, unknown>;
}

// Types pour l'enrôlement des marchands
export enum MerchantEnrollmentStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FEE_PENDING = 'fee_pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum MarketType {
  TRADITIONAL = 'traditional',
  MODERN = 'modern',
  STREET = 'street',
  MARKET_HALL = 'market_hall'
}

export interface MerchantEnrollment {
  id: string;
  // Informations de base
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  
  // Coordonnées
  phone: string;
  email?: string;
  address: string;
  commune: string;
  market: string;
  marketType: MarketType;
  
  // Documents d'identité
  cniNumber: string;
  cniExpiryDate?: string;
  cmuNumber?: string;
  rstiNumber?: string;
  
  // Informations professionnelles
  businessName: string;
  businessType: string;
  registrationDate?: string;
  taxNumber?: string;
  
  // Informations de la coopérative
  cooperativeId?: string;
  cooperativeName?: string;
  
  // Statut et métadonnées
  status: MerchantEnrollmentStatus;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  activatedAt?: string;
  updatedAt?: string;
  
  // Documents
  documents: EnrollmentDocument[];
  
  // Notes
  notes?: string;
  rejectionReason?: string;
}

export interface EnrollmentDocument {
  id: string;
  type: 'cni' | 'cmu' | 'rsti' | 'business_license' | 'tax_certificate' | 'other';
  filename: string;
  url?: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface MerchantEnrollmentFormData {
  // Informations de base
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  
  // Coordonnées
  phone: string;
  email?: string;
  address: string;
  commune: string;
  market: string;
  marketType: MarketType;
  
  // Documents d'identité
  cniNumber: string;
  cniExpiryDate?: string;
  cmuNumber?: string;
  rstiNumber?: string;
  
  // Informations professionnelles
  businessName: string;
  businessType: string;
  registrationDate?: string;
  taxNumber?: string;
  
  // Documents
  documents: Array<{
    type: EnrollmentDocument['type'];
    file: File;
    filename: string;
  }>;
}

export interface MerchantEnrollmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MerchantEnrollmentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  active: number;
  averageProcessingTime: number; // en jours
}

// Type guards
export const isMerchantEnrollmentStatus = (value: string): value is MerchantEnrollmentStatus => {
  return Object.values(MerchantEnrollmentStatus).includes(value as MerchantEnrollmentStatus);
};

export const isMarketType = (value: string): value is MarketType => {
  return Object.values(MarketType).includes(value as MarketType);
};
