// Types pour le suivi de livraison et gestion des litiges

export interface DeliveryTracking {
  orderId: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  route: RoutePoint[];
  status: "on-time" | "delayed" | "blocked";
  estimatedArrival: string;
  distanceRemaining: number;
  timeRemaining: number;
  lastUpdate: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  type: "start" | "waypoint" | "destination";
  estimatedTime: string;
  actualTime?: string;
  status: "pending" | "reached" | "skipped";
}

export interface DeliveryConfirmation {
  orderId: string;
  deliveredAt: string;
  deliveredBy: string;
  receivedBy: string;
  photos: DeliveryPhoto[];
  signature: string;
  quantityDelivered: number;
  quantityOrdered: number;
  condition: "perfect" | "good" | "damaged" | "refused";
  notes: string;
  processVerbal?: string;
}

export interface DeliveryPhoto {
  id: string;
  type: "products" | "signature" | "delivery-note" | "other";
  url: string;
  caption?: string;
  takenAt: string;
}

export interface Dispute {
  id: string;
  disputeNumber: string;
  orderId: string;
  orderNumber: string;
  type: "delay" | "quantity" | "quality" | "damage" | "incomplete";
  status: "open" | "in-progress" | "resolved" | "escalated" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  reportedBy: string;
  reportedByRole: "cooperative" | "buyer";
  reportedAt: string;
  description: string;
  evidence: DisputeEvidence[];
  timeline: DisputeEvent[];
  proposedSolutions: DisputeSolution[];
  resolution?: DisputeResolution;
}

export interface DisputeEvidence {
  id: string;
  type: "photo" | "video" | "document" | "screenshot";
  url: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DisputeEvent {
  id: string;
  type: "created" | "message" | "solution-proposed" | "solution-accepted" | "solution-rejected" | "escalated" | "resolved";
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: "cooperative" | "buyer" | "admin";
}

export interface DisputeSolution {
  id: string;
  type: "partial-refund" | "full-refund" | "replacement" | "discount" | "compensation";
  description: string;
  amount?: number;
  proposedBy: string;
  proposedAt: string;
  status: "pending" | "accepted" | "rejected";
  respondedAt?: string;
}

export interface DisputeResolution {
  resolvedAt: string;
  resolvedBy: string;
  solution: DisputeSolution;
  cooperativeSatisfaction?: number;
  buyerSatisfaction?: number;
  notes: string;
}

export interface DeliveryPerformance {
  totalDeliveries: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  averageDeliveryTime: number;
  totalDisputes: number;
  disputeRate: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
  byRegion: RegionPerformance[];
  byTransporter: TransporterPerformance[];
  monthlyTrend: MonthlyDeliveryData[];
}

export interface RegionPerformance {
  region: string;
  deliveries: number;
  averageTime: number;
  onTimeRate: number;
  disputes: number;
}

export interface TransporterPerformance {
  transporterId: string;
  transporterName: string;
  deliveries: number;
  onTimeRate: number;
  rating: number;
  disputes: number;
}

export interface MonthlyDeliveryData {
  month: string;
  deliveries: number;
  onTime: number;
  delayed: number;
  disputes: number;
}

