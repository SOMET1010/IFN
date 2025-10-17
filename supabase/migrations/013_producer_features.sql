/*
  # Migration pour les fonctionnalités des producteurs

  ## Nouvelles Tables

  1. **production_plans** - Planification de production
     - Gestion des cycles de production
     - Suivi des dates et quantités prévues
     - Lien avec les récoltes réelles

  2. **production_tasks** - Tâches de production
     - Liste des tâches par plan
     - Suivi de l'avancement
     - Dates d'échéance

  3. **production_expenses** - Dépenses de production
     - Suivi des coûts par catégorie
     - Justificatifs
     - Analyse de rentabilité

  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques d'accès par producteur
  - Protection des données financières
*/

-- 1. Table des plans de production
CREATE TABLE IF NOT EXISTS public.production_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producer_id UUID REFERENCES public.producer_profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    season TEXT CHECK (season IN ('printemps', 'ete', 'automne', 'hiver')) NOT NULL,
    planned_start_date DATE NOT NULL,
    planned_harvest_date DATE NOT NULL CHECK (planned_harvest_date > planned_start_date),
    planned_quantity DECIMAL(10,2) NOT NULL CHECK (planned_quantity > 0),
    unit product_unit NOT NULL,
    land_size DECIMAL(10,2) NOT NULL CHECK (land_size > 0),
    estimated_cost DECIMAL(10,2) NOT NULL CHECK (estimated_cost >= 0),
    status TEXT CHECK (status IN ('planned', 'in_progress', 'harvested', 'cancelled')) NOT NULL DEFAULT 'planned',
    actual_harvest_id UUID REFERENCES public.producer_harvests(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Table des tâches de production
CREATE TABLE IF NOT EXISTS public.production_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_plan_id UUID REFERENCES public.production_plans(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')) NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Table des dépenses de production
CREATE TABLE IF NOT EXISTS public.production_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_plan_id UUID REFERENCES public.production_plans(id) ON DELETE CASCADE NOT NULL,
    category TEXT CHECK (category IN ('seeds', 'fertilizer', 'pesticide', 'labor', 'equipment', 'irrigation', 'other')) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_production_plans_producer ON public.production_plans(producer_id, status);
CREATE INDEX IF NOT EXISTS idx_production_plans_dates ON public.production_plans(planned_start_date, planned_harvest_date);
CREATE INDEX IF NOT EXISTS idx_production_plans_product ON public.production_plans(product_id, season);

CREATE INDEX IF NOT EXISTS idx_production_tasks_plan ON public.production_tasks(production_plan_id, status);
CREATE INDEX IF NOT EXISTS idx_production_tasks_due ON public.production_tasks(due_date, status);

CREATE INDEX IF NOT EXISTS idx_production_expenses_plan ON public.production_expenses(production_plan_id, category);
CREATE INDEX IF NOT EXISTS idx_production_expenses_date ON public.production_expenses(date);

-- Activer RLS sur toutes les tables
ALTER TABLE public.production_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_expenses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour production_plans
CREATE POLICY "Producers can view their plans" ON public.production_plans
    FOR SELECT USING (
        producer_id IN (
            SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Producers can manage their plans" ON public.production_plans
    FOR ALL USING (
        producer_id IN (
            SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Cooperatives can view member plans" ON public.production_plans
    FOR SELECT USING (
        producer_id IN (
            SELECT pp.id FROM public.producer_profiles pp
            JOIN public.cooperative_members cm ON cm.user_id = pp.user_id
            WHERE cm.cooperative_id IN (
                SELECT cooperative_id FROM public.cooperative_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins can manage all plans" ON public.production_plans
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques RLS pour production_tasks
CREATE POLICY "Producers can view their tasks" ON public.production_tasks
    FOR SELECT USING (
        production_plan_id IN (
            SELECT id FROM public.production_plans WHERE producer_id IN (
                SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Producers can manage their tasks" ON public.production_tasks
    FOR ALL USING (
        production_plan_id IN (
            SELECT id FROM public.production_plans WHERE producer_id IN (
                SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Politiques RLS pour production_expenses
CREATE POLICY "Producers can view their expenses" ON public.production_expenses
    FOR SELECT USING (
        production_plan_id IN (
            SELECT id FROM public.production_plans WHERE producer_id IN (
                SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Producers can manage their expenses" ON public.production_expenses
    FOR ALL USING (
        production_plan_id IN (
            SELECT id FROM public.production_plans WHERE producer_id IN (
                SELECT id FROM public.producer_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Triggers pour updated_at
CREATE TRIGGER update_production_plans_updated_at
    BEFORE UPDATE ON public.production_plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contraintes supplémentaires
ALTER TABLE public.production_plans
ADD CONSTRAINT check_harvest_date_after_start CHECK (planned_harvest_date > planned_start_date);

ALTER TABLE public.production_tasks
ADD CONSTRAINT check_completed_status CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
);

-- Vue pour les statistiques de production
CREATE OR REPLACE VIEW public.production_statistics AS
SELECT
    pp.producer_id,
    COUNT(DISTINCT pp.id) as total_plans,
    COUNT(DISTINCT CASE WHEN pp.status = 'in_progress' THEN pp.id END) as active_plans,
    COUNT(DISTINCT CASE WHEN pp.status = 'harvested' THEN pp.id END) as completed_plans,
    SUM(pp.land_size) as total_land_used,
    SUM(pp.planned_quantity) as total_planned_production,
    SUM(CASE WHEN ph.quantity IS NOT NULL THEN ph.quantity ELSE 0 END) as total_actual_production,
    AVG(CASE
        WHEN pp.estimated_cost > 0 AND ph.quantity IS NOT NULL
        THEN (ph.quantity / pp.planned_quantity) * 100
        ELSE NULL
    END) as average_success_rate
FROM public.production_plans pp
LEFT JOIN public.producer_harvests ph ON pp.actual_harvest_id = ph.id
GROUP BY pp.producer_id;

-- Fonction pour calculer la rentabilité d'un plan
CREATE OR REPLACE FUNCTION public.calculate_plan_profitability(plan_id UUID)
RETURNS TABLE (
    total_expenses DECIMAL,
    total_revenue DECIMAL,
    profit DECIMAL,
    roi DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(pe.amount), 0) as total_expenses,
        COALESCE(SUM(ps.total_price), 0) as total_revenue,
        COALESCE(SUM(ps.total_price), 0) - COALESCE(SUM(pe.amount), 0) as profit,
        CASE
            WHEN COALESCE(SUM(pe.amount), 0) > 0
            THEN ((COALESCE(SUM(ps.total_price), 0) - COALESCE(SUM(pe.amount), 0)) / SUM(pe.amount)) * 100
            ELSE 0
        END as roi
    FROM public.production_plans pp
    LEFT JOIN public.production_expenses pe ON pe.production_plan_id = pp.id
    LEFT JOIN public.producer_sales ps ON ps.producer_id = pp.producer_id
        AND ps.product_id = pp.product_id
        AND ps.sale_date >= pp.planned_start_date
        AND ps.sale_date <= pp.planned_harvest_date + INTERVAL '30 days'
    WHERE pp.id = plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les tâches en retard
CREATE OR REPLACE FUNCTION public.get_overdue_tasks(producer_profile_id UUID)
RETURNS TABLE (
    task_id UUID,
    task_title TEXT,
    due_date DATE,
    days_overdue INTEGER,
    plan_id UUID,
    product_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pt.id as task_id,
        pt.title as task_title,
        pt.due_date,
        (CURRENT_DATE - pt.due_date)::INTEGER as days_overdue,
        pp.id as plan_id,
        p.name as product_name
    FROM public.production_tasks pt
    JOIN public.production_plans pp ON pt.production_plan_id = pp.id
    JOIN public.products p ON pp.product_id = p.id
    WHERE pp.producer_id = producer_profile_id
        AND pt.status IN ('pending', 'in_progress')
        AND pt.due_date < CURRENT_DATE
    ORDER BY pt.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Données de test pour la production
INSERT INTO public.production_plans (
    producer_id, product_id, season, planned_start_date, planned_harvest_date,
    planned_quantity, unit, land_size, estimated_cost, status
) VALUES
-- Plans pour Paul Amani (producteur1)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Tomate'), 'printemps', '2024-03-01', '2024-06-15',
 800.00, 'kg', 0.5, 150000, 'in_progress'),

((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur1@example.com')),
 (SELECT id FROM public.products WHERE name = 'Piment'), 'ete', '2024-06-01', '2024-09-30',
 100.00, 'kg', 0.2, 80000, 'planned'),

-- Plans pour Marie N'guessan (producteur2)
((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Mangue'), 'printemps', '2024-02-15', '2024-07-01',
 1200.00, 'kg', 1.0, 200000, 'in_progress'),

((SELECT id FROM public.producer_profiles WHERE user_id = (SELECT id FROM public.users WHERE email = 'producteur2@example.com')),
 (SELECT id FROM public.products WHERE name = 'Ananas'), 'ete', '2024-05-01', '2024-10-15',
 500.00, 'kg', 0.8, 120000, 'planned')
ON CONFLICT DO NOTHING;

-- Tâches par défaut pour un plan (exemple)
DO $$
DECLARE
    first_plan_id UUID;
BEGIN
    SELECT id INTO first_plan_id
    FROM public.production_plans
    LIMIT 1;

    IF first_plan_id IS NOT NULL THEN
        INSERT INTO public.production_tasks (
            production_plan_id, title, description, due_date, status
        ) VALUES
        (first_plan_id, 'Préparation du terrain', 'Labour et préparation du sol', CURRENT_DATE - INTERVAL '30 days', 'completed'),
        (first_plan_id, 'Semis', 'Mise en terre des semences', CURRENT_DATE - INTERVAL '25 days', 'completed'),
        (first_plan_id, 'Fertilisation', 'Application d''engrais', CURRENT_DATE - INTERVAL '15 days', 'completed'),
        (first_plan_id, 'Traitement phytosanitaire', 'Application de pesticides', CURRENT_DATE + INTERVAL '5 days', 'pending'),
        (first_plan_id, 'Récolte', 'Collecte de la production', CURRENT_DATE + INTERVAL '45 days', 'pending')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
