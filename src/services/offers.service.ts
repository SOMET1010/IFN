import { supabase } from './supabase/supabaseClient';

// Types
export interface GroupedOffer {
  id: string;
  cooperative_id: string;
  title: string;
  description: string;
  product_id: string;
  total_quantity: number;
  quality: 'A' | 'B' | 'C' | 'Mixed';
  unit_price: number;
  total_price: number;
  min_order_quantity: number | null;
  delivery_location: string;
  delivery_deadline: string;
  payment_terms: string;
  certifications: any[];
  status: 'draft' | 'active' | 'negotiating' | 'sold' | 'expired' | 'cancelled';
  views_count: number;
  interests_count: number;
  photos: any[];
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

export interface CreateOfferInput {
  cooperative_id: string;
  title: string;
  description: string;
  product_id: string;
  total_quantity: number;
  quality: 'A' | 'B' | 'C' | 'Mixed';
  unit_price: number;
  delivery_location: string;
  delivery_deadline: string;
  payment_terms: string;
  min_order_quantity?: number;
  certifications?: any[];
}

export interface Negotiation {
  id: string;
  offer_id: string;
  cooperative_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_company: string | null;
  initial_price: number;
  proposed_price: number | null;
  final_price: number | null;
  quantity: number;
  status: 'pending' | 'active' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  unread_messages: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
}

// Service de gestion des offres
export const offersService = {
  // Récupérer toutes les offres actives
  async getAll(): Promise<GroupedOffer[]> {
    const { data, error } = await supabase
      .from('grouped_offers')
      .select('*')
      .in('status', ['active', 'negotiating'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les offres d'une coopérative
  async getByCooperative(cooperativeId: string): Promise<GroupedOffer[]> {
    const { data, error } = await supabase
      .from('grouped_offers')
      .select('*')
      .eq('cooperative_id', cooperativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer une offre par ID
  async getById(id: string): Promise<GroupedOffer | null> {
    const { data, error } = await supabase
      .from('grouped_offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Incrémenter le compteur de vues
    await supabase.rpc('increment_offer_views', { offer_id: id });

    return data;
  },

  // Créer une nouvelle offre
  async create(input: CreateOfferInput): Promise<GroupedOffer> {
    const totalPrice = input.total_quantity * input.unit_price;

    const { data, error } = await supabase
      .from('grouped_offers')
      .insert([{
        ...input,
        total_price: totalPrice,
        status: 'active',
        views_count: 0,
        interests_count: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une offre
  async update(id: string, updates: Partial<CreateOfferInput>): Promise<GroupedOffer> {
    // Recalculer le prix total si nécessaire
    if (updates.total_quantity || updates.unit_price) {
      const { data: offer } = await supabase
        .from('grouped_offers')
        .select('total_quantity, unit_price')
        .eq('id', id)
        .single();

      if (offer) {
        const quantity = updates.total_quantity || offer.total_quantity;
        const price = updates.unit_price || offer.unit_price;
        (updates as any).total_price = quantity * price;
      }
    }

    const { data, error } = await supabase
      .from('grouped_offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Changer le statut d'une offre
  async updateStatus(id: string, status: GroupedOffer['status']): Promise<void> {
    const { error } = await supabase
      .from('grouped_offers')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  },

  // Rechercher des offres
  async search(query: string, filters?: {
    productId?: string;
    minPrice?: number;
    maxPrice?: number;
    quality?: string;
    region?: string;
  }): Promise<GroupedOffer[]> {
    let queryBuilder = supabase
      .from('grouped_offers')
      .select('*')
      .in('status', ['active', 'negotiating']);

    // Recherche textuelle
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Filtres
    if (filters?.productId) {
      queryBuilder = queryBuilder.eq('product_id', filters.productId);
    }
    if (filters?.minPrice) {
      queryBuilder = queryBuilder.gte('unit_price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      queryBuilder = queryBuilder.lte('unit_price', filters.maxPrice);
    }
    if (filters?.quality) {
      queryBuilder = queryBuilder.eq('quality', filters.quality);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  },
};

// Service de gestion des négociations
export const negotiationsService = {
  // Récupérer les négociations d'une coopérative
  async getByCooperative(cooperativeId: string): Promise<Negotiation[]> {
    const { data, error } = await supabase
      .from('negotiations')
      .select('*')
      .eq('cooperative_id', cooperativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Récupérer les négociations d'un acheteur
  async getByBuyer(buyerId: string): Promise<Negotiation[]> {
    const { data, error } = await supabase
      .from('negotiations')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Créer une nouvelle négociation
  async create(input: {
    offer_id: string;
    cooperative_id: string;
    buyer_name: string;
    buyer_company?: string;
    initial_price: number;
    proposed_price?: number;
    quantity: number;
  }): Promise<Negotiation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('negotiations')
      .insert([{
        ...input,
        buyer_id: user.id,
        status: 'active',
        urgency: 'normal',
        unread_messages: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Accepter une négociation
  async accept(id: string, finalPrice: number): Promise<void> {
    const { error } = await supabase
      .from('negotiations')
      .update({
        status: 'accepted',
        final_price: finalPrice,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // Créer automatiquement une commande
    const { data: negotiation } = await supabase
      .from('negotiations')
      .select('*')
      .eq('id', id)
      .single();

    if (negotiation) {
      await supabase.rpc('create_order_from_negotiation', {
        negotiation_id: id,
      });
    }
  },

  // Rejeter une négociation
  async reject(id: string, reason?: string): Promise<void> {
    const { error } = await supabase
      .from('negotiations')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Envoyer un message
  async sendMessage(negotiationId: string, message: string, senderRole: 'cooperative' | 'buyer'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { error } = await supabase
      .from('negotiation_messages')
      .insert([{
        negotiation_id: negotiationId,
        sender_id: user.id,
        sender_role: senderRole,
        message,
      }]);

    if (error) throw error;

    // Incrémenter le compteur de messages non lus
    await supabase.rpc('increment_unread_messages', {
      negotiation_id: negotiationId,
    });
  },

  // Récupérer les messages d'une négociation
  async getMessages(negotiationId: string) {
    const { data, error } = await supabase
      .from('negotiation_messages')
      .select('*')
      .eq('negotiation_id', negotiationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Marquer les messages comme lus
  async markAsRead(negotiationId: string): Promise<void> {
    const { error } = await supabase
      .from('negotiations')
      .update({ unread_messages: 0 })
      .eq('id', negotiationId);

    if (error) throw error;
  },
};

