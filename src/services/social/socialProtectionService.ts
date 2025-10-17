import { supabase } from '../supabase/supabaseClient';

export interface ContributionPlan {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  coverage_type: 'basic' | 'standard' | 'premium';
  benefits_included: string[];
  max_claim_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface UserContribution {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'suspended' | 'cancelled';
  payment_frequency: 'monthly' | 'quarterly' | 'yearly';
  last_payment_date?: string;
  next_payment_date?: string;
  total_paid: number;
  months_paid: number;
  is_up_to_date: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  plan?: ContributionPlan;
}

export interface SocialBenefit {
  id: string;
  name: string;
  description: string;
  benefit_type: 'medical' | 'maternity' | 'retirement' | 'disability' | 'death' | 'emergency';
  base_amount: number;
  required_months: number;
  required_coverage: 'basic' | 'standard' | 'premium';
  eligibility_criteria: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface BenefitClaim {
  id: string;
  user_id: string;
  contribution_id: string;
  benefit_id: string;
  claim_date: string;
  claim_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  rejection_reason?: string;
  approval_date?: string;
  payment_date?: string;
  supporting_documents?: any[];
  notes?: string;
  created_at: string;
  benefit?: SocialBenefit;
}

export interface MutualFund {
  id: string;
  name: string;
  description: string;
  fund_type: 'emergency' | 'investment' | 'solidarity';
  total_amount: number;
  available_amount: number;
  allocated_amount: number;
  num_contributors: number;
  target_amount?: number;
  target_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface FundContribution {
  id: string;
  fund_id: string;
  user_id: string;
  amount: number;
  contribution_date: string;
  contribution_type: 'voluntary' | 'automatic' | 'special';
  notes?: string;
  created_at: string;
  fund?: MutualFund;
}

class SocialProtectionService {
  async getContributionPlans(): Promise<ContributionPlan[]> {
    const { data, error } = await supabase
      .from('social_contributions_plans')
      .select('*')
      .eq('is_active', true)
      .order('monthly_amount');

    if (error) throw error;
    return data || [];
  }

  async getUserContributions(userId: string): Promise<UserContribution[]> {
    const { data, error } = await supabase
      .from('user_social_contributions')
      .select(`
        *,
        plan:social_contributions_plans(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getActiveContribution(userId: string): Promise<UserContribution | null> {
    const { data, error } = await supabase
      .from('user_social_contributions')
      .select(`
        *,
        plan:social_contributions_plans(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async subscribeToplan(
    userId: string,
    planId: string,
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<UserContribution> {
    const { data, error } = await supabase
      .from('user_social_contributions')
      .insert({
        user_id: userId,
        plan_id: planId,
        payment_frequency: paymentFrequency,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active',
        is_up_to_date: true,
        total_paid: 0,
        months_paid: 0
      })
      .select(`
        *,
        plan:social_contributions_plans(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async recordPayment(
    contributionId: string,
    amount: number
  ): Promise<UserContribution> {
    const contribution = await this.getContributionById(contributionId);
    if (!contribution) throw new Error('Contribution not found');

    const { data, error } = await supabase
      .from('user_social_contributions')
      .update({
        last_payment_date: new Date().toISOString().split('T')[0],
        total_paid: (contribution.total_paid || 0) + amount,
        months_paid: (contribution.months_paid || 0) + 1,
        is_up_to_date: true
      })
      .eq('id', contributionId)
      .select(`
        *,
        plan:social_contributions_plans(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getContributionById(contributionId: string): Promise<UserContribution | null> {
    const { data, error } = await supabase
      .from('user_social_contributions')
      .select(`
        *,
        plan:social_contributions_plans(*)
      `)
      .eq('id', contributionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async cancelContribution(contributionId: string): Promise<void> {
    const { error } = await supabase
      .from('user_social_contributions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', contributionId);

    if (error) throw error;
  }

  async getAvailableBenefits(): Promise<SocialBenefit[]> {
    const { data, error } = await supabase
      .from('social_benefits')
      .select('*')
      .eq('is_active', true)
      .order('benefit_type');

    if (error) throw error;
    return data || [];
  }

  async getUserClaims(userId: string): Promise<BenefitClaim[]> {
    const { data, error } = await supabase
      .from('user_benefit_claims')
      .select(`
        *,
        benefit:social_benefits(*)
      `)
      .eq('user_id', userId)
      .order('claim_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createClaim(
    userId: string,
    contributionId: string,
    benefitId: string,
    claimAmount: number,
    notes?: string
  ): Promise<BenefitClaim> {
    const { data, error } = await supabase
      .from('user_benefit_claims')
      .insert({
        user_id: userId,
        contribution_id: contributionId,
        benefit_id: benefitId,
        claim_amount: claimAmount,
        claim_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes
      })
      .select(`
        *,
        benefit:social_benefits(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getMutualFunds(): Promise<MutualFund[]> {
    const { data, error } = await supabase
      .from('mutual_funds')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async getUserFundContributions(userId: string): Promise<FundContribution[]> {
    const { data, error } = await supabase
      .from('mutual_fund_contributions')
      .select(`
        *,
        fund:mutual_funds(*)
      `)
      .eq('user_id', userId)
      .order('contribution_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async contributeToFund(
    userId: string,
    fundId: string,
    amount: number,
    contributionType: 'voluntary' | 'automatic' | 'special' = 'voluntary',
    notes?: string
  ): Promise<FundContribution> {
    const { data, error } = await supabase
      .from('mutual_fund_contributions')
      .insert({
        user_id: userId,
        fund_id: fundId,
        amount,
        contribution_date: new Date().toISOString().split('T')[0],
        contribution_type: contributionType,
        notes
      })
      .select(`
        *,
        fund:mutual_funds(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async checkEligibility(userId: string, benefitId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('check_benefit_eligibility', {
        p_user_id: userId,
        p_benefit_id: benefitId
      });

    if (error) {
      console.error('Error checking eligibility:', error);
      return false;
    }

    return data === true;
  }

  async getContributionStats(userId: string) {
    const contributions = await this.getUserContributions(userId);
    const claims = await this.getUserClaims(userId);
    const fundContributions = await this.getUserFundContributions(userId);

    const activeContribution = contributions.find(c => c.status === 'active');
    const totalPaid = contributions.reduce((sum, c) => sum + (c.total_paid || 0), 0);
    const totalMonths = contributions.reduce((sum, c) => sum + (c.months_paid || 0), 0);
    const totalClaimed = claims
      .filter(c => c.status === 'approved' || c.status === 'paid')
      .reduce((sum, c) => sum + c.claim_amount, 0);
    const totalFundContributions = fundContributions.reduce((sum, c) => sum + c.amount, 0);
    const pendingClaims = claims.filter(c => c.status === 'pending').length;
    const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'paid').length;

    return {
      hasActiveContribution: !!activeContribution,
      activeContribution,
      totalContributions: contributions.length,
      totalPaid,
      totalMonths,
      totalClaimed,
      totalFundContributions,
      pendingClaims,
      approvedClaims,
      netBalance: totalPaid - totalClaimed
    };
  }
}

export const socialProtectionService = new SocialProtectionService();
