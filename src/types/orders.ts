// Types pour la gestion des commandes

export interface Order {
  id: string;
  orderNumber: string;
  negotiationId: string;
  cooperativeId: string;
  cooperativeName: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  status: "preparation" | "in-transit" | "delivered" | "confirmed" | "cancelled";
  products: OrderProduct[];
  totalAmount: number;
  paymentStatus: "pending" | "partial" | "paid" | "refunded";
  paymentMethod: "cash" | "mobile-money" | "bank-transfer";
  createdAt: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  deliveryInfo?: DeliveryInfo;
  documents: OrderDocument[];
  timeline: OrderEvent[];
}

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  quality: "A" | "B" | "C";
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryInfo {
  transporterId: string;
  transporterName: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  departureTime?: string;
  estimatedArrival: string;
  trackingNumber: string;
}

export interface OrderDocument {
  id: string;
  type: "purchase-order" | "invoice" | "delivery-note" | "receipt" | "other";
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface OrderEvent {
  id: string;
  type: "created" | "payment-received" | "preparation-started" | "shipped" | "delivered" | "confirmed" | "cancelled";
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
}

export interface PreparationTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  photos?: string[];
}

export interface OrderPreparation {
  orderId: string;
  tasks: PreparationTask[];
  photos: string[];
  notes: string;
  preparedBy: string;
  preparedAt?: string;
  deliveryNote?: string;
}

export interface OrderStats {
  total: number;
  inPreparation: number;
  inTransit: number;
  delivered: number;
  confirmed: number;
  totalValue: number;
  onTimeDeliveryRate: number;
  averagePreparationTime: number;
}

