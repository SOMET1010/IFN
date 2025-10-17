import { supabase } from '../supabase/supabaseClient';

// Types pour les récoltes des producteurs
export interface ProducerHarvest {
  id: string;
  producer_id: string;
  product_id: string;
  harvest_date: string;
  quantity: number;
  unit: 'kg' | 'piece' | 'tonne' | 'sac' | 'litre';
  quality_grade: 'A' | 'B' | 'C' | 'premium' | 'standard' | 'economy';
  notes: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface HarvestStats {
  totalHarvests: number;
  totalQuantity: number;
  averageQuality: string;
  byProduct: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    harvests_count: number;
  }>;
  byQuality: Record<string, number>;
  byMonth: Array<{
    month: string;
    quantity: number;
    harvests_count: number;
  }>;
}

export interface HarvestForecast {
  product_id: string;
  product_name: string;
  expected_date: string;
  estimated_quantity: number;
  confidence_level: 'low' | 'medium' | 'high';
}

// Service de gestion des récoltes des producteurs
export const producerHarvestsService = {
  // Récupérer le profil producteur de l'utilisateur connecté
  async getProducerProfile(): Promise<{ id: string } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('producer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer toutes les récoltes d'un producteur
  async getAll(producerId?: string): Promise<ProducerHarvest[]> {
    let query = supabase
      .from('producer_harvests')
      .select(`
        *,
        product:products(id, name, category, unit)
      `)
      .order('harvest_date', { ascending: false });

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      // Si pas de producerId, récupérer pour l'utilisateur connecté
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Récupérer une récolte par ID
  async getById(id: string): Promise<ProducerHarvest | null> {
    const { data, error } = await supabase
      .from('producer_harvests')
      .select(`
        *,
        product:products(id, name, category, unit, image_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle récolte
  async create(input: {
    product_id: string;
    harvest_date: string;
    quantity: number;
    unit: 'kg' | 'piece' | 'tonne' | 'sac' | 'litre';
    quality_grade: 'A' | 'B' | 'C' | 'premium' | 'standard' | 'economy';
    notes?: string;
  }): Promise<ProducerHarvest> {
    const profile = await this.getProducerProfile();
    if (!profile) throw new Error('Profil producteur non trouvé');

    const { data, error } = await supabase
      .from('producer_harvests')
      .insert([{
        ...input,
        producer_id: profile.id,
      }])
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour les statistiques du producteur
    await this.updateProducerStats(profile.id);

    // Créer une notification
    await supabase.from('notifications').insert([{
      user_id: (await supabase.auth.getUser()).data.user?.id,
      type: 'harvest_recorded',
      title: 'Récolte enregistrée',
      message: `Récolte de ${input.quantity} ${input.unit} enregistrée avec succès`,
      metadata: { harvest_id: data.id },
    }]);

    return data;
  },

  // Mettre à jour une récolte
  async update(id: string, updates: Partial<{
    product_id: string;
    harvest_date: string;
    quantity: number;
    unit: string;
    quality_grade: string;
    notes: string;
  }>): Promise<ProducerHarvest> {
    const { data, error } = await supabase
      .from('producer_harvests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour les statistiques
    if (data) {
      await this.updateProducerStats(data.producer_id);
    }

    return data;
  },

  // Supprimer une récolte
  async delete(id: string): Promise<void> {
    // Récupérer le producer_id avant suppression
    const { data: harvest } = await supabase
      .from('producer_harvests')
      .select('producer_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('producer_harvests')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Mettre à jour les statistiques
    if (harvest) {
      await this.updateProducerStats(harvest.producer_id);
    }
  },

  // Filtrer les récoltes par produit
  async getByProduct(productId: string, producerId?: string): Promise<ProducerHarvest[]> {
    let query = supabase
      .from('producer_harvests')
      .select('*')
      .eq('product_id', productId)
      .order('harvest_date', { ascending: false });

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Filtrer les récoltes par période
  async getByDateRange(startDate: string, endDate: string, producerId?: string): Promise<ProducerHarvest[]> {
    let query = supabase
      .from('producer_harvests')
      .select('*')
      .gte('harvest_date', startDate)
      .lte('harvest_date', endDate)
      .order('harvest_date', { ascending: false });

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Filtrer les récoltes par qualité
  async getByQuality(quality: string, producerId?: string): Promise<ProducerHarvest[]> {
    let query = supabase
      .from('producer_harvests')
      .select('*')
      .eq('quality_grade', quality)
      .order('harvest_date', { ascending: false });

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Obtenir les statistiques des récoltes
  async getStats(producerId?: string, startDate?: string, endDate?: string): Promise<HarvestStats> {
    let query = supabase
      .from('producer_harvests')
      .select(`
        *,
        product:products(id, name)
      `);

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    if (startDate) {
      query = query.gte('harvest_date', startDate);
    }
    if (endDate) {
      query = query.lte('harvest_date', endDate);
    }

    const { data: harvests } = await query;

    if (!harvests || harvests.length === 0) {
      return {
        totalHarvests: 0,
        totalQuantity: 0,
        averageQuality: 'N/A',
        byProduct: [],
        byQuality: {},
        byMonth: [],
      };
    }

    // Calculer les statistiques
    const totalHarvests = harvests.length;
    const totalQuantity = harvests.reduce((sum, h) => sum + h.quantity, 0);

    // Par produit
    const byProductMap = new Map();
    harvests.forEach((h: any) => {
      const key = h.product_id;
      if (!byProductMap.has(key)) {
        byProductMap.set(key, {
          product_id: h.product_id,
          product_name: h.product.name,
          quantity: 0,
          harvests_count: 0,
        });
      }
      const stats = byProductMap.get(key);
      stats.quantity += h.quantity;
      stats.harvests_count++;
    });
    const byProduct = Array.from(byProductMap.values());

    // Par qualité
    const byQuality: Record<string, number> = {};
    harvests.forEach(h => {
      byQuality[h.quality_grade] = (byQuality[h.quality_grade] || 0) + h.quantity;
    });

    // Par mois
    const byMonthMap = new Map();
    harvests.forEach(h => {
      const month = h.harvest_date.substring(0, 7); // YYYY-MM
      if (!byMonthMap.has(month)) {
        byMonthMap.set(month, { month, quantity: 0, harvests_count: 0 });
      }
      const stats = byMonthMap.get(month);
      stats.quantity += h.quantity;
      stats.harvests_count++;
    });
    const byMonth = Array.from(byMonthMap.values()).sort((a, b) => a.month.localeCompare(b.month));

    // Qualité moyenne (basée sur la distribution)
    const qualityScores: Record<string, number> = {
      premium: 5,
      A: 4,
      standard: 3,
      B: 2,
      economy: 1,
      C: 1,
    };
    let totalScore = 0;
    let totalItems = 0;
    Object.entries(byQuality).forEach(([grade, qty]) => {
      const score = qualityScores[grade] || 3;
      totalScore += score * qty;
      totalItems += qty;
    });
    const averageScore = totalItems > 0 ? totalScore / totalItems : 0;
    const averageQuality = averageScore >= 4.5 ? 'Premium'
      : averageScore >= 3.5 ? 'A'
      : averageScore >= 2.5 ? 'Standard'
      : averageScore >= 1.5 ? 'B'
      : 'Economy';

    return {
      totalHarvests,
      totalQuantity,
      averageQuality,
      byProduct,
      byQuality,
      byMonth,
    };
  },

  // Prévoir les prochaines récoltes (basé sur l'historique)
  async getForecast(producerId?: string): Promise<HarvestForecast[]> {
    const profile = producerId ? { id: producerId } : await this.getProducerProfile();
    if (!profile) throw new Error('Profil producteur non trouvé');

    // Récupérer l'historique des 12 derniers mois
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);

    const { data: harvests } = await supabase
      .from('producer_harvests')
      .select(`
        *,
        product:products(id, name)
      `)
      .eq('producer_id', profile.id)
      .gte('harvest_date', oneYearAgo.toISOString().split('T')[0])
      .order('harvest_date', { ascending: false });

    if (!harvests || harvests.length === 0) {
      return [];
    }

    // Analyser les patterns par produit
    const productPatterns = new Map();
    harvests.forEach((h: any) => {
      if (!productPatterns.has(h.product_id)) {
        productPatterns.set(h.product_id, {
          product_id: h.product_id,
          product_name: h.product.name,
          harvests: [],
        });
      }
      productPatterns.get(h.product_id).harvests.push(h);
    });

    const forecasts: HarvestForecast[] = [];

    productPatterns.forEach(({ product_id, product_name, harvests: productHarvests }) => {
      if (productHarvests.length < 2) return; // Pas assez de données

      // Calculer l'intervalle moyen entre récoltes
      const intervals: number[] = [];
      for (let i = 0; i < productHarvests.length - 1; i++) {
        const date1 = new Date(productHarvests[i].harvest_date);
        const date2 = new Date(productHarvests[i + 1].harvest_date);
        const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
        intervals.push(diffDays);
      }

      const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
      const avgQuantity = productHarvests.reduce((sum: number, h: any) => sum + h.quantity, 0) / productHarvests.length;

      // Prédire la prochaine récolte
      const lastHarvest = new Date(productHarvests[0].harvest_date);
      const nextHarvest = new Date(lastHarvest);
      nextHarvest.setDate(nextHarvest.getDate() + Math.round(avgInterval));

      // Déterminer le niveau de confiance
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      const confidence = stdDev < avgInterval * 0.2 ? 'high'
        : stdDev < avgInterval * 0.4 ? 'medium'
        : 'low';

      forecasts.push({
        product_id,
        product_name,
        expected_date: nextHarvest.toISOString().split('T')[0],
        estimated_quantity: Math.round(avgQuantity),
        confidence_level: confidence,
      });
    });

    return forecasts.sort((a, b) => a.expected_date.localeCompare(b.expected_date));
  },

  // Mettre à jour les statistiques du producteur (méthode interne)
  async updateProducerStats(producerId: string): Promise<void> {
    const { count } = await supabase
      .from('producer_harvests')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', producerId);

    await supabase
      .from('producer_profiles')
      .update({ total_harvests: count || 0 })
      .eq('id', producerId);
  },

  // Exporter les données en CSV
  async exportData(producerId?: string, startDate?: string, endDate?: string): Promise<string> {
    const harvests = await this.getByDateRange(
      startDate || '2000-01-01',
      endDate || new Date().toISOString().split('T')[0],
      producerId
    );

    const headers = [
      'ID',
      'Date Récolte',
      'Produit',
      'Quantité',
      'Unité',
      'Qualité',
      'Notes',
      'Date Création',
    ];

    const rows = harvests.map((h: any) => [
      h.id,
      h.harvest_date,
      h.product?.name || h.product_id,
      h.quantity.toString(),
      h.unit,
      h.quality_grade,
      h.notes || '',
      h.created_at,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },
};
