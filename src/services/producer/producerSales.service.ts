import { supabase } from '../supabase/supabaseClient';

// Types pour les ventes des producteurs
export interface ProducerSale {
  id: string;
  producer_id: string;
  product_id: string;
  order_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_date: string;
  quality_grade: 'A' | 'B' | 'C' | 'premium' | 'standard' | 'economy' | null;
  notes: string | null;
  metadata: any;
  created_at: string;
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalQuantitySold: number;
  byProduct: Array<{
    product_id: string;
    product_name: string;
    quantity_sold: number;
    revenue: number;
    sales_count: number;
  }>;
  byMonth: Array<{
    month: string;
    revenue: number;
    sales_count: number;
  }>;
  byQuality: Record<string, { quantity: number; revenue: number }>;
  topBuyers: Array<{
    buyer_id: string;
    buyer_name: string;
    total_spent: number;
    orders_count: number;
  }>;
}

export interface RevenueProjection {
  month: string;
  projected_revenue: number;
  confidence_level: 'low' | 'medium' | 'high';
  based_on_months: number;
}

// Service de gestion des ventes producteurs
export const producerSalesService = {
  // Obtenir le profil producteur
  async getProducerProfile(): Promise<{ id: string; user_id: string } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data, error } = await supabase
      .from('producer_profiles')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer toutes les ventes
  async getAll(producerId?: string, filters?: {
    startDate?: string;
    endDate?: string;
    productId?: string;
  }): Promise<ProducerSale[]> {
    let query = supabase
      .from('producer_sales')
      .select(`
        *,
        product:products(id, name, category, unit, image_url),
        order:orders(id, order_number, buyer_id, status)
      `)
      .order('sale_date', { ascending: false });

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    if (filters?.startDate) {
      query = query.gte('sale_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('sale_date', filters.endDate);
    }
    if (filters?.productId) {
      query = query.eq('product_id', filters.productId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Récupérer une vente par ID
  async getById(id: string): Promise<ProducerSale | null> {
    const { data, error } = await supabase
      .from('producer_sales')
      .select(`
        *,
        product:products(*),
        order:orders(*, buyer:users(id, name, email, phone))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une nouvelle vente
  async create(input: {
    product_id: string;
    order_id: string;
    quantity: number;
    unit_price: number;
    sale_date: string;
    quality_grade?: 'A' | 'B' | 'C' | 'premium' | 'standard' | 'economy';
    notes?: string;
  }): Promise<ProducerSale> {
    const profile = await this.getProducerProfile();
    if (!profile) throw new Error('Profil producteur non trouvé');

    const { data, error } = await supabase
      .from('producer_sales')
      .insert([{
        ...input,
        producer_id: profile.id,
        total_price: input.quantity * input.unit_price,
      }])
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour les statistiques du producteur
    await this.updateProducerStats(profile.id);

    return data;
  },

  // Mettre à jour une vente
  async update(id: string, updates: Partial<{
    quantity: number;
    unit_price: number;
    sale_date: string;
    quality_grade: string;
    notes: string;
  }>): Promise<ProducerSale> {
    // Recalculer le prix total si nécessaire
    if (updates.quantity || updates.unit_price) {
      const { data: sale } = await supabase
        .from('producer_sales')
        .select('quantity, unit_price')
        .eq('id', id)
        .single();

      if (sale) {
        const quantity = updates.quantity || sale.quantity;
        const price = updates.unit_price || sale.unit_price;
        (updates as any).total_price = quantity * price;
      }
    }

    const { data, error } = await supabase
      .from('producer_sales')
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

  // Supprimer une vente
  async delete(id: string): Promise<void> {
    // Récupérer le producer_id avant suppression
    const { data: sale } = await supabase
      .from('producer_sales')
      .select('producer_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('producer_sales')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Mettre à jour les statistiques
    if (sale) {
      await this.updateProducerStats(sale.producer_id);
    }
  },

  // Récupérer les ventes par produit
  async getByProduct(productId: string, producerId?: string): Promise<ProducerSale[]> {
    return this.getAll(producerId, { productId });
  },

  // Récupérer les ventes par période
  async getByPeriod(startDate: string, endDate: string, producerId?: string): Promise<ProducerSale[]> {
    return this.getAll(producerId, { startDate, endDate });
  },

  // Récupérer les ventes récentes
  async getRecent(limit: number = 10, producerId?: string): Promise<ProducerSale[]> {
    let query = supabase
      .from('producer_sales')
      .select(`
        *,
        product:products(id, name, category),
        order:orders(order_number, buyer:users(name))
      `)
      .order('sale_date', { ascending: false })
      .limit(limit);

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

  // STATISTIQUES

  // Obtenir les statistiques de vente
  async getStats(producerId?: string, startDate?: string, endDate?: string): Promise<SalesStats> {
    const sales = await this.getByPeriod(
      startDate || '2000-01-01',
      endDate || new Date().toISOString().split('T')[0],
      producerId
    );

    if (sales.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalQuantitySold: 0,
        byProduct: [],
        byMonth: [],
        byQuality: {},
        topBuyers: [],
      };
    }

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total_price, 0);
    const averageOrderValue = totalRevenue / totalSales;
    const totalQuantitySold = sales.reduce((sum, s) => sum + s.quantity, 0);

    // Par produit
    const byProductMap = new Map();
    sales.forEach((s: any) => {
      if (!byProductMap.has(s.product_id)) {
        byProductMap.set(s.product_id, {
          product_id: s.product_id,
          product_name: s.product.name,
          quantity_sold: 0,
          revenue: 0,
          sales_count: 0,
        });
      }
      const stats = byProductMap.get(s.product_id);
      stats.quantity_sold += s.quantity;
      stats.revenue += s.total_price;
      stats.sales_count++;
    });
    const byProduct = Array.from(byProductMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    // Par mois
    const byMonthMap = new Map();
    sales.forEach(s => {
      const month = s.sale_date.substring(0, 7); // YYYY-MM
      if (!byMonthMap.has(month)) {
        byMonthMap.set(month, { month, revenue: 0, sales_count: 0 });
      }
      const stats = byMonthMap.get(month);
      stats.revenue += s.total_price;
      stats.sales_count++;
    });
    const byMonth = Array.from(byMonthMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    // Par qualité
    const byQuality: Record<string, { quantity: number; revenue: number }> = {};
    sales.forEach(s => {
      const quality = s.quality_grade || 'non_specifie';
      if (!byQuality[quality]) {
        byQuality[quality] = { quantity: 0, revenue: 0 };
      }
      byQuality[quality].quantity += s.quantity;
      byQuality[quality].revenue += s.total_price;
    });

    // Top acheteurs
    const buyerMap = new Map();
    sales.forEach((s: any) => {
      const buyerId = s.order?.buyer_id;
      if (!buyerId) return;

      if (!buyerMap.has(buyerId)) {
        buyerMap.set(buyerId, {
          buyer_id: buyerId,
          buyer_name: s.order.buyer?.name || 'Inconnu',
          total_spent: 0,
          orders_count: 0,
        });
      }
      const buyer = buyerMap.get(buyerId);
      buyer.total_spent += s.total_price;
      buyer.orders_count++;
    });
    const topBuyers = Array.from(buyerMap.values())
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 5);

    return {
      totalSales,
      totalRevenue,
      averageOrderValue,
      totalQuantitySold,
      byProduct,
      byMonth,
      byQuality,
      topBuyers,
    };
  },

  // Calculer le revenu moyen par mois
  async getAverageMonthlyRevenue(producerId?: string, months: number = 6): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const sales = await this.getByPeriod(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      producerId
    );

    const totalRevenue = sales.reduce((sum, s) => sum + s.total_price, 0);
    return totalRevenue / months;
  },

  // Projeter les revenus futurs
  async getRevenueProjection(producerId?: string, months: number = 3): Promise<RevenueProjection[]> {
    // Analyser les 12 derniers mois
    const historicalMonths = 12;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historicalMonths);

    const sales = await this.getByPeriod(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      producerId
    );

    if (sales.length < 3) {
      // Pas assez de données
      return [];
    }

    // Calculer les revenus par mois
    const monthlyRevenue = new Map();
    sales.forEach(s => {
      const month = s.sale_date.substring(0, 7);
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + s.total_price);
    });

    // Calculer la moyenne et la tendance
    const revenues = Array.from(monthlyRevenue.values());
    const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;

    // Calcul simple de la tendance (régression linéaire simplifiée)
    let trend = 0;
    if (revenues.length > 1) {
      const recent = revenues.slice(-3).reduce((sum, r) => sum + r, 0) / 3;
      const older = revenues.slice(0, 3).reduce((sum, r) => sum + r, 0) / 3;
      trend = (recent - older) / historicalMonths;
    }

    // Calculer l'écart-type pour la confiance
    const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgRevenue > 0 ? stdDev / avgRevenue : 1;

    const confidence = coefficientOfVariation < 0.2 ? 'high'
      : coefficientOfVariation < 0.4 ? 'medium'
      : 'low';

    // Projeter les prochains mois
    const projections: RevenueProjection[] = [];
    const currentDate = new Date();

    for (let i = 1; i <= months; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      const month = currentDate.toISOString().substring(0, 7);
      const projected_revenue = Math.max(0, avgRevenue + trend * i);

      projections.push({
        month,
        projected_revenue: Math.round(projected_revenue),
        confidence_level: confidence,
        based_on_months: revenues.length,
      });
    }

    return projections;
  },

  // Comparer avec la période précédente
  async compareWithPreviousPeriod(startDate: string, endDate: string, producerId?: string): Promise<{
    currentPeriod: { revenue: number; sales_count: number };
    previousPeriod: { revenue: number; sales_count: number };
    growth: { revenue_percentage: number; sales_percentage: number };
  }> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end.getTime() - start.getTime();

    // Période précédente
    const previousEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000); // 1 jour avant
    const previousStart = new Date(previousEnd.getTime() - durationMs);

    const [currentSales, previousSales] = await Promise.all([
      this.getByPeriod(startDate, endDate, producerId),
      this.getByPeriod(
        previousStart.toISOString().split('T')[0],
        previousEnd.toISOString().split('T')[0],
        producerId
      ),
    ]);

    const currentRevenue = currentSales.reduce((sum, s) => sum + s.total_price, 0);
    const previousRevenue = previousSales.reduce((sum, s) => sum + s.total_price, 0);

    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const salesGrowth = previousSales.length > 0
      ? ((currentSales.length - previousSales.length) / previousSales.length) * 100
      : 0;

    return {
      currentPeriod: {
        revenue: currentRevenue,
        sales_count: currentSales.length,
      },
      previousPeriod: {
        revenue: previousRevenue,
        sales_count: previousSales.length,
      },
      growth: {
        revenue_percentage: revenueGrowth,
        sales_percentage: salesGrowth,
      },
    };
  },

  // Mettre à jour les statistiques du producteur (méthode interne)
  async updateProducerStats(producerId: string): Promise<void> {
    const { data: sales } = await supabase
      .from('producer_sales')
      .select('total_price')
      .eq('producer_id', producerId);

    const totalSales = sales?.length || 0;
    const totalRevenue = sales?.reduce((sum, s) => sum + s.total_price, 0) || 0;

    await supabase
      .from('producer_profiles')
      .update({
        total_sales: totalSales,
        total_revenue: totalRevenue,
      })
      .eq('id', producerId);
  },

  // Exporter les données
  async exportData(producerId?: string, startDate?: string, endDate?: string): Promise<string> {
    const sales = await this.getByPeriod(
      startDate || '2000-01-01',
      endDate || new Date().toISOString().split('T')[0],
      producerId
    );

    const headers = [
      'ID',
      'Date Vente',
      'Produit',
      'Quantité',
      'Prix Unitaire',
      'Prix Total',
      'Qualité',
      'N° Commande',
      'Notes',
    ];

    const rows = sales.map((s: any) => [
      s.id,
      s.sale_date,
      s.product?.name || s.product_id,
      s.quantity.toString(),
      s.unit_price.toString(),
      s.total_price.toString(),
      s.quality_grade || '',
      s.order?.order_number || '',
      s.notes || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },
};
