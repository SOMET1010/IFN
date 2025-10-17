import { supabase } from '../supabase/supabaseClient';

// Types pour la planification de production
export interface ProductionPlan {
  id: string;
  producer_id: string;
  product_id: string;
  season: 'printemps' | 'ete' | 'automne' | 'hiver';
  planned_start_date: string;
  planned_harvest_date: string;
  planned_quantity: number;
  unit: 'kg' | 'piece' | 'tonne' | 'sac' | 'litre';
  land_size: number; // en hectares
  estimated_cost: number;
  status: 'planned' | 'in_progress' | 'harvested' | 'cancelled';
  actual_harvest_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductionTask {
  id: string;
  production_plan_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  created_at: string;
}

export interface ProductionExpense {
  id: string;
  production_plan_id: string;
  category: 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'equipment' | 'irrigation' | 'other';
  description: string;
  amount: number;
  date: string;
  receipt_url: string | null;
  created_at: string;
}

export interface ProductionStats {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalLandUsed: number;
  totalEstimatedProduction: number;
  totalActualProduction: number;
  successRate: number;
  byProduct: Array<{
    product_id: string;
    product_name: string;
    plans_count: number;
    total_quantity: number;
  }>;
  bySeason: Record<string, number>;
}

// Service de gestion de la production
export const producerProductionService = {
  // Obtenir le profil producteur
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

  // Récupérer tous les plans de production
  async getAll(producerId?: string, filters?: {
    status?: string;
    season?: string;
    year?: number;
  }): Promise<ProductionPlan[]> {
    let query = supabase
      .from('production_plans')
      .select(`
        *,
        product:products(id, name, category, unit),
        actual_harvest:producer_harvests(id, quantity, harvest_date)
      `)
      .order('planned_start_date', { ascending: false });

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.season) {
      query = query.eq('season', filters.season);
    }
    if (filters?.year) {
      const startDate = `${filters.year}-01-01`;
      const endDate = `${filters.year}-12-31`;
      query = query.gte('planned_start_date', startDate).lte('planned_start_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Récupérer un plan par ID
  async getById(id: string): Promise<ProductionPlan | null> {
    const { data, error } = await supabase
      .from('production_plans')
      .select(`
        *,
        product:products(*),
        actual_harvest:producer_harvests(*),
        tasks:production_tasks(*),
        expenses:production_expenses(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouveau plan de production
  async create(input: {
    product_id: string;
    season: 'printemps' | 'ete' | 'automne' | 'hiver';
    planned_start_date: string;
    planned_harvest_date: string;
    planned_quantity: number;
    unit: 'kg' | 'piece' | 'tonne' | 'sac' | 'litre';
    land_size: number;
    estimated_cost: number;
    notes?: string;
  }): Promise<ProductionPlan> {
    const profile = await this.getProducerProfile();
    if (!profile) throw new Error('Profil producteur non trouvé');

    const { data, error } = await supabase
      .from('production_plans')
      .insert([{
        ...input,
        producer_id: profile.id,
        status: 'planned',
      }])
      .select()
      .single();

    if (error) throw error;

    // Créer des tâches par défaut
    await this.createDefaultTasks(data.id, input.planned_start_date, input.planned_harvest_date);

    return data;
  },

  // Mettre à jour un plan
  async update(id: string, updates: Partial<ProductionPlan>): Promise<ProductionPlan> {
    const { data, error } = await supabase
      .from('production_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Démarrer la production
  async startProduction(planId: string): Promise<void> {
    await this.update(planId, { status: 'in_progress' });

    // Créer une notification
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('notifications').insert([{
      user_id: user?.id,
      type: 'production_started',
      title: 'Production démarrée',
      message: 'Votre plan de production a été lancé',
      metadata: { plan_id: planId },
    }]);
  },

  // Lier une récolte à un plan
  async linkHarvest(planId: string, harvestId: string): Promise<void> {
    await this.update(planId, {
      status: 'harvested',
      actual_harvest_id: harvestId,
    });
  },

  // Annuler un plan
  async cancel(planId: string, reason: string): Promise<void> {
    await this.update(planId, {
      status: 'cancelled',
      notes: reason,
    });
  },

  // GESTION DES TÂCHES

  // Créer des tâches par défaut pour un plan
  async createDefaultTasks(planId: string, startDate: string, harvestDate: string): Promise<void> {
    const start = new Date(startDate);
    const harvest = new Date(harvestDate);
    const duration = (harvest.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const tasks = [
      {
        production_plan_id: planId,
        title: 'Préparation du terrain',
        description: 'Labour et préparation du sol',
        due_date: new Date(start.getTime()).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        production_plan_id: planId,
        title: 'Semis / Plantation',
        description: 'Mise en terre des semences ou plants',
        due_date: new Date(start.getTime() + duration * 0.1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        production_plan_id: planId,
        title: 'Premier arrosage',
        description: 'Irrigation initiale',
        due_date: new Date(start.getTime() + duration * 0.15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        production_plan_id: planId,
        title: 'Fertilisation',
        description: 'Application d\'engrais',
        due_date: new Date(start.getTime() + duration * 0.3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        production_plan_id: planId,
        title: 'Traitement phytosanitaire',
        description: 'Application de pesticides si nécessaire',
        due_date: new Date(start.getTime() + duration * 0.5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
      },
      {
        production_plan_id: planId,
        title: 'Récolte',
        description: 'Collecte de la production',
        due_date: harvestDate,
        status: 'pending',
      },
    ];

    const { error } = await supabase
      .from('production_tasks')
      .insert(tasks);

    if (error) throw error;
  },

  // Récupérer les tâches d'un plan
  async getTasks(planId: string): Promise<ProductionTask[]> {
    const { data, error } = await supabase
      .from('production_tasks')
      .select('*')
      .eq('production_plan_id', planId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Créer une tâche personnalisée
  async createTask(input: {
    production_plan_id: string;
    title: string;
    description?: string;
    due_date: string;
  }): Promise<ProductionTask> {
    const { data, error } = await supabase
      .from('production_tasks')
      .insert([{
        ...input,
        status: 'pending',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour une tâche
  async updateTask(taskId: string, updates: Partial<ProductionTask>): Promise<ProductionTask> {
    const { data, error } = await supabase
      .from('production_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Marquer une tâche comme terminée
  async completeTask(taskId: string): Promise<void> {
    await this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },

  // GESTION DES DÉPENSES

  // Récupérer les dépenses d'un plan
  async getExpenses(planId: string): Promise<ProductionExpense[]> {
    const { data, error } = await supabase
      .from('production_expenses')
      .select('*')
      .eq('production_plan_id', planId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Ajouter une dépense
  async addExpense(input: {
    production_plan_id: string;
    category: 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'equipment' | 'irrigation' | 'other';
    description: string;
    amount: number;
    date: string;
    receipt_url?: string;
  }): Promise<ProductionExpense> {
    const { data, error } = await supabase
      .from('production_expenses')
      .insert([input])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Calculer le total des dépenses
  async getTotalExpenses(planId: string): Promise<number> {
    const { data } = await supabase
      .from('production_expenses')
      .select('amount')
      .eq('production_plan_id', planId);

    return data?.reduce((sum, e) => sum + e.amount, 0) || 0;
  },

  // STATISTIQUES

  // Obtenir les statistiques de production
  async getStats(producerId?: string, startDate?: string, endDate?: string): Promise<ProductionStats> {
    let query = supabase
      .from('production_plans')
      .select(`
        *,
        product:products(id, name),
        actual_harvest:producer_harvests(quantity)
      `);

    if (producerId) {
      query = query.eq('producer_id', producerId);
    } else {
      const profile = await this.getProducerProfile();
      if (!profile) throw new Error('Profil producteur non trouvé');
      query = query.eq('producer_id', profile.id);
    }

    if (startDate) {
      query = query.gte('planned_start_date', startDate);
    }
    if (endDate) {
      query = query.lte('planned_start_date', endDate);
    }

    const { data: plans } = await query;

    if (!plans || plans.length === 0) {
      return {
        totalPlans: 0,
        activePlans: 0,
        completedPlans: 0,
        totalLandUsed: 0,
        totalEstimatedProduction: 0,
        totalActualProduction: 0,
        successRate: 0,
        byProduct: [],
        bySeason: {},
      };
    }

    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.status === 'in_progress').length;
    const completedPlans = plans.filter(p => p.status === 'harvested').length;
    const totalLandUsed = plans.reduce((sum, p) => sum + p.land_size, 0);
    const totalEstimatedProduction = plans.reduce((sum, p) => sum + p.planned_quantity, 0);
    const totalActualProduction = plans
      .filter(p => p.actual_harvest)
      .reduce((sum: number, p: any) => sum + (p.actual_harvest?.quantity || 0), 0);
    const successRate = completedPlans > 0 ? (totalActualProduction / totalEstimatedProduction) * 100 : 0;

    // Par produit
    const byProductMap = new Map();
    plans.forEach((p: any) => {
      if (!byProductMap.has(p.product_id)) {
        byProductMap.set(p.product_id, {
          product_id: p.product_id,
          product_name: p.product.name,
          plans_count: 0,
          total_quantity: 0,
        });
      }
      const stats = byProductMap.get(p.product_id);
      stats.plans_count++;
      stats.total_quantity += p.planned_quantity;
    });
    const byProduct = Array.from(byProductMap.values());

    // Par saison
    const bySeason: Record<string, number> = {};
    plans.forEach(p => {
      bySeason[p.season] = (bySeason[p.season] || 0) + 1;
    });

    return {
      totalPlans,
      activePlans,
      completedPlans,
      totalLandUsed,
      totalEstimatedProduction,
      totalActualProduction,
      successRate,
      byProduct,
      bySeason,
    };
  },

  // Calculer la rentabilité d'un plan
  async getProfitability(planId: string): Promise<{
    totalExpenses: number;
    totalRevenue: number;
    profit: number;
    roi: number;
  }> {
    const totalExpenses = await this.getTotalExpenses(planId);

    // Récupérer les ventes liées à ce plan
    const { data: plan } = await supabase
      .from('production_plans')
      .select('actual_harvest_id')
      .eq('id', planId)
      .single();

    let totalRevenue = 0;

    if (plan?.actual_harvest_id) {
      const { data: sales } = await supabase
        .from('producer_sales')
        .select('total_price')
        .eq('producer_id', plan.actual_harvest_id);

      totalRevenue = sales?.reduce((sum, s) => sum + s.total_price, 0) || 0;
    }

    const profit = totalRevenue - totalExpenses;
    const roi = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;

    return {
      totalExpenses,
      totalRevenue,
      profit,
      roi,
    };
  },

  // Exporter les données
  async exportData(producerId?: string): Promise<string> {
    const plans = await this.getAll(producerId);

    const headers = [
      'ID',
      'Produit',
      'Saison',
      'Date Début',
      'Date Récolte',
      'Quantité Prévue',
      'Unité',
      'Surface (ha)',
      'Coût Estimé',
      'Statut',
      'Date Création',
    ];

    const rows = plans.map((p: any) => [
      p.id,
      p.product?.name || p.product_id,
      p.season,
      p.planned_start_date,
      p.planned_harvest_date,
      p.planned_quantity.toString(),
      p.unit,
      p.land_size.toString(),
      p.estimated_cost.toString(),
      p.status,
      p.created_at,
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },
};
