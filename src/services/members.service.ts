import { supabase } from './supabase/supabaseClient';

// Types
export interface CooperativeMember {
  id: string;
  cooperative_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  id_number: string | null;
  id_type: 'cni' | 'passport' | 'attestation' | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  location: string;
  region: string;
  activity: string;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  join_date: string;
  cnps_number: string | null;
  cmu_number: string | null;
  cnam_number: string | null;
  cnps_status: 'not_enrolled' | 'up_to_date' | 'late';
  cmu_status: 'not_enrolled' | 'up_to_date' | 'late';
  cnam_status: 'not_enrolled' | 'up_to_date' | 'late';
  total_contributions: number;
  documents: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateMemberInput {
  cooperative_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  location: string;
  region: string;
  activity: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
}

// Service de gestion des membres
export const membersService = {
  // Récupérer tous les membres d'une coopérative
  async getByCooperative(cooperativeId: string): Promise<CooperativeMember[]> {
    const { data, error } = await supabase
      .from('cooperative_members')
      .select('*')
      .eq('cooperative_id', cooperativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer un membre par ID
  async getById(id: string): Promise<CooperativeMember | null> {
    const { data, error } = await supabase
      .from('cooperative_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau membre
  async create(input: CreateMemberInput): Promise<CooperativeMember> {
    const { data, error } = await supabase
      .from('cooperative_members')
      .insert([{
        ...input,
        status: 'active',
        join_date: new Date().toISOString().split('T')[0],
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour un membre
  async update(id: string, updates: Partial<CreateMemberInput>): Promise<CooperativeMember> {
    const { data, error } = await supabase
      .from('cooperative_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Supprimer un membre
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('cooperative_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des membres
  async search(cooperativeId: string, query: string): Promise<CooperativeMember[]> {
    const { data, error } = await supabase
      .from('cooperative_members')
      .select('*')
      .eq('cooperative_id', cooperativeId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  // Filtrer les membres par statut
  async filterByStatus(cooperativeId: string, status: string): Promise<CooperativeMember[]> {
    const { data, error } = await supabase
      .from('cooperative_members')
      .select('*')
      .eq('cooperative_id', cooperativeId)
      .eq('status', status)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  },

  // Mettre à jour le statut de cotisation sociale
  async updateSocialStatus(
    id: string,
    organism: 'cnps' | 'cmu' | 'cnam',
    status: 'not_enrolled' | 'up_to_date' | 'late'
  ): Promise<void> {
    const updateField = `${organism}_status`;
    const { error } = await supabase
      .from('cooperative_members')
      .update({ [updateField]: status })
      .eq('id', id);

    if (error) throw error;
  },

  // Obtenir les statistiques des membres
  async getStats(cooperativeId: string) {
    const { data: members } = await supabase
      .from('cooperative_members')
      .select('status, cnps_status, cmu_status, cnam_status')
      .eq('cooperative_id', cooperativeId);

    if (!members) return null;

    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const pending = members.filter(m => m.status === 'pending').length;
    const inactive = members.filter(m => m.status === 'inactive').length;

    const cnpsUpToDate = members.filter(m => m.cnps_status === 'up_to_date').length;
    const cmuUpToDate = members.filter(m => m.cmu_status === 'up_to_date').length;
    const cnamUpToDate = members.filter(m => m.cnam_status === 'up_to_date').length;

    return {
      total,
      active,
      pending,
      inactive,
      socialCoverage: {
        cnps: { upToDate: cnpsUpToDate, percentage: (cnpsUpToDate / total) * 100 },
        cmu: { upToDate: cmuUpToDate, percentage: (cmuUpToDate / total) * 100 },
        cnam: { upToDate: cnamUpToDate, percentage: (cnamUpToDate / total) * 100 },
      },
    };
  },
};

