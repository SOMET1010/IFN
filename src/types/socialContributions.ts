export type ContributionStatus = "up-to-date" | "late" | "not-enrolled";

export type OrganismType = "cnps" | "cmu" | "cnam";

export interface OrganismContribution {
  status: ContributionStatus;
  lastPayment: string;
  amount: number;
  daysLate?: number;
  monthlyRate: number;
}

export interface MemberSocialContributions {
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  cnps: OrganismContribution;
  cmu: OrganismContribution;
  cnam: OrganismContribution;
}

export interface PaymentMethod {
  provider: "orange" | "mtn" | "moov" | "wave";
  phoneNumber: string;
}

export interface PaymentTransaction {
  id: string;
  memberId: string;
  organism: OrganismType | "all";
  amount: number;
  method: PaymentMethod;
  timestamp: string;
  status: "pending" | "completed" | "failed";
  receiptUrl?: string;
}

export interface ContributionStats {
  organism: OrganismType;
  totalMembers: number;
  upToDate: number;
  late: number;
  notEnrolled: number;
  totalCollected: number;
  totalDue: number;
}

export interface PaymentHistoryItem {
  date: string;
  cnpsAmount: number;
  cmuAmount: number;
  cnamAmount: number;
}

