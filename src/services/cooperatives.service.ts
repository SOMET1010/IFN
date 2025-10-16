import { supabase } from './supabase/supabaseClient';

// Types
export interface Cooperative {
  id: string;
  name: string;
  description: string | null;
  slogan: string | null;
  logo_url: string | null;
  banner_url: string | null;
  location: string;
  region: string;
  gps_lat: number | null;
  gps_lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  created_by: string | null;
  status: 'pending' | 'active' | 'suspended';
  total_members: number;
  total_transactions: number;
  total_volume: number;
  satisfaction_rating: number;
  certifications: any[];
  created_at: string;
  updated_at: string;
}

export interface CreateCooperativeInput {
  name: string;
  description?: string;
  slogan?: string;
  location: string;
  region: string;
  phone?: string;
  email?: string;
}

// Service de gestion des coopératives
export const cooperativesService = {
  // Récupérer toutes les coopératives actives
  async getAll(): Promise<Cooperative[]> {
    const { data, error } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer une coopérative par ID
  async getById(id: string): Promise<Cooperative | null> {
    const { data, error } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer les coopératives de l'utilisateur connecté
  async getMyCooperatives(): Promise<Cooperative[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Créer une nouvelle coopérative
  async create(input: CreateCooperativeInput): Promise<Cooperative> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('cooperatives')
      .insert([{
        ...input,
        created_by: user.id,
        status: 'active',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une coopérative
  async update(id: string, updates: Partial<CreateCooperativeInput>): Promise<Cooperative> {
    const { data, error } = await supabase
      .from('cooperatives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Uploader un logo
  async uploadLogo(cooperativeId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${cooperativeId}-logo.${fileExt}`;
    const filePath = `cooperatives/${cooperativeId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Mettre à jour la coopérative avec l'URL du logo
    await supabase
      .from('cooperatives')
      .update({ logo_url: publicUrl })
      .eq('id', cooperativeId);

    return publicUrl;
  },

  // Obtenir les statistiques d'une coopérative
  async getStats(cooperativeId: string) {
    // Récupérer le nombre de membres
    const { count: membersCount } = await supabase
      .from('cooperative_members')
      .select('*', { count: 'exact', head: true })
      .eq('cooperative_id', cooperativeId)
      .eq('status', 'active');

    // Récupérer le nombre d'offres actives
    const { count: offersCount } = await supabase
      .from('grouped_offers')
      .select('*', { count: 'exact', head: true })
      .eq('cooperative_id', cooperativeId)
      .in('status', ['active', 'negotiating']);

    // Récupérer le nombre de négociations
    const { count: negotiationsCount } = await supabase
      .from('negotiations')
      .select('*', { count: 'exact', head: true })
      .eq('cooperative_id', cooperativeId);

    // Récupérer le total des paiements
    const { data: payments } = await supabase
      .from('collective_payments')
      .select('amount')
      .eq('cooperative_id', cooperativeId)
      .eq('status', 'confirmed');

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
      membersCount: membersCount || 0,
      offersCount: offersCount || 0,
      negotiationsCount: negotiationsCount || 0,
      totalRevenue,
    };
  },

  // Rechercher des coopératives
  async search(query: string): Promise<Cooperative[]> {
    const { data, error } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%,region.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },
};

