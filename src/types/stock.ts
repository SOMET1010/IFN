export type ProductQuality = "A" | "B" | "C";
export type StockUnit = "kg" | "tonnes";
export type StockMovementType = "add" | "remove" | "sale" | "adjustment";

export interface StockContribution {
  memberId: string;
  memberName: string;
  quantity: number;
  quality: ProductQuality;
  location: string;
  declaredAt: string;
  photos?: string[];
}

export interface ProductStock {
  productId: string;
  productName: string;
  productImage: string;
  totalQuantity: number;
  unit: StockUnit;
  estimatedValue: number;
  lastUpdate: string;
  contributions: StockContribution[];
}

export interface StockMovement {
  id: string;
  type: StockMovementType;
  productId: string;
  productName: string;
  memberId: string;
  memberName: string;
  quantity: number;
  timestamp: string;
  resultingStock: number;
  notes?: string;
}

export interface StockAlert {
  id: string;
  type: "low-stock" | "no-movement" | "quality-disparity" | "opportunity";
  severity: "critical" | "warning" | "info";
  productId: string;
  productName: string;
  message: string;
  recommendations: string[];
  createdAt: string;
}

export interface QualityDistribution {
  quality: ProductQuality;
  quantity: number;
  percentage: number;
}

