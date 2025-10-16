export type PaymentStatus = "pending" | "received" | "redistributed" | "failed";
export type PaymentMethod = "mobile-money" | "bank-transfer" | "cash";
export type DistributionStatus = "pending" | "processing" | "completed" | "failed";

export interface CollectivePayment {
  id: string;
  cooperativeId: string;
  cooperativeName: string;
  amount: number;
  currency: "XOF"; // Franc CFA
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receivedAt?: string;
  redistributedAt?: string;
  saleId: string;
  products: PaymentProduct[];
  buyer: {
    id: string;
    name: string;
    contact: string;
  };
  invoiceNumber?: string;
}

export interface PaymentProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface MemberDistribution {
  memberId: string;
  memberName: string;
  memberPhone: string;
  contribution: {
    productId: string;
    quantity: number;
    percentage: number;
  };
  amount: number;
  fees: number;
  netAmount: number;
  status: DistributionStatus;
  paidAt?: string;
  receiptUrl?: string;
}

export interface DistributionData {
  paymentId: string;
  totalAmount: number;
  distributions: MemberDistribution[];
  paymentMethod: PaymentMethod;
  totalFees: number;
  netTotal: number;
}

export interface MemberEarnings {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  totalEarnings: number;
  earningsThisMonth: number;
  numberOfSales: number;
  topProduct: string;
  earningsHistory: EarningsHistoryItem[];
}

export interface EarningsHistoryItem {
  date: string;
  amount: number;
  productName: string;
  quantity: number;
  paymentId: string;
  status: DistributionStatus;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  cooperative: {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
  };
  client: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // 18% en CI
  taxAmount: number;
  total: number;
  paymentTerms: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface PaymentStats {
  totalRevenue: number;
  pendingPayments: number;
  membersPaid: number;
  redistributionRate: number;
  revenueByProduct: RevenueByProduct[];
  revenueHistory: RevenueHistoryItem[];
}

export interface RevenueByProduct {
  productName: string;
  revenue: number;
  quantity: number;
}

export interface RevenueHistoryItem {
  month: string;
  revenue: number;
}

