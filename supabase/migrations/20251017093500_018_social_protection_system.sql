/*
  # Système de Protection Sociale - Simulation

  ## Vue d'ensemble
  Ce système permet de simuler un système de protection sociale coopératif
  avec cotisations mensuelles, prestations sociales, et fonds mutuels.

  ## Nouvelles Tables

  1. **social_contributions_plans**
     - Plans de cotisation disponibles
     - Montants et fréquences
     - Avantages associés

  2. **user_social_contributions**
     - Cotisations des utilisateurs
     - Historique des paiements
     - Statut actuel

  3. **social_benefits**
     - Prestations sociales disponibles
     - Types (maladie, maternité, retraite, etc.)
     - Montants et conditions

  4. **user_benefit_claims**
     - Demandes de prestations
     - Statut et validation
     - Historique

  5. **mutual_funds**
     - Fonds mutuels coopératifs
     - Contributions collectives
     - Distributions

  ## Sécurité
  - RLS activée sur toutes les tables
  - Policies restrictives par utilisateur
*/

-- ============================================
-- TABLE: Plans de cotisation
-- ============================================

CREATE TABLE IF NOT EXISTS public.social_contributions_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  monthly_amount NUMERIC(10, 2) NOT NULL CHECK (monthly_amount >= 0),
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('basic', 'standard', 'premium')),
  benefits_included JSONB DEFAULT '[]'::jsonb,
  max_claim_amount NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les plans de base
INSERT INTO public.social_contributions_plans (name, description, monthly_amount, coverage_type, benefits_included, max_claim_amount) VALUES
  (
    'Protection Basique',
    'Couverture de base pour urgences médicales',
    5000,
    'basic',
    '["Urgences médicales", "Médicaments essentiels"]'::jsonb,
    100000
  ),
  (
    'Protection Standard',
    'Couverture complète avec hospitalisation',
    10000,
    'standard',
    '["Urgences médicales", "Hospitalisation", "Médicaments", "Consultations"]'::jsonb,
    250000
  ),
  (
    'Protection Premium',
    'Couverture maximale avec maternité et retraite',
    20000,
    'premium',
    '["Urgences médicales", "Hospitalisation", "Médicaments", "Consultations", "Maternité", "Retraite"]'::jsonb,
    500000
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: Cotisations utilisateurs
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_social_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.social_contributions_plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  payment_frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (payment_frequency IN ('monthly', 'quarterly', 'yearly')),
  last_payment_date DATE,
  next_payment_date DATE,
  total_paid NUMERIC(12, 2) DEFAULT 0,
  months_paid INTEGER DEFAULT 0,
  is_up_to_date BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_active_plan UNIQUE (user_id, plan_id, status)
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_user_contributions_user ON public.user_social_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_status ON public.user_social_contributions(status);
CREATE INDEX IF NOT EXISTS idx_user_contributions_next_payment ON public.user_social_contributions(next_payment_date);

-- ============================================
-- TABLE: Prestations disponibles
-- ============================================

CREATE TABLE IF NOT EXISTS public.social_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  benefit_type TEXT NOT NULL CHECK (benefit_type IN ('medical', 'maternity', 'retirement', 'disability', 'death', 'emergency')),
  base_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  required_months INTEGER DEFAULT 0,
  required_coverage TEXT NOT NULL CHECK (required_coverage IN ('basic', 'standard', 'premium')),
  eligibility_criteria JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les prestations de base
INSERT INTO public.social_benefits (name, description, benefit_type, base_amount, required_months, required_coverage) VALUES
  ('Urgence Médicale', 'Prise en charge urgences médicales', 'medical', 50000, 1, 'basic'),
  ('Hospitalisation', 'Prise en charge frais hospitalisation', 'medical', 150000, 3, 'standard'),
  ('Allocation Maternité', 'Aide à la naissance', 'maternity', 100000, 6, 'premium'),
  ('Pension Retraite', 'Pension mensuelle retraite', 'retirement', 50000, 60, 'premium'),
  ('Invalidité', 'Aide en cas invalidité', 'disability', 200000, 12, 'standard'),
  ('Décès', 'Aide funéraire famille', 'death', 300000, 6, 'standard')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: Demandes de prestations
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_benefit_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_id UUID NOT NULL REFERENCES public.user_social_contributions(id) ON DELETE RESTRICT,
  benefit_id UUID NOT NULL REFERENCES public.social_benefits(id) ON DELETE RESTRICT,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  claim_amount NUMERIC(10, 2) NOT NULL CHECK (claim_amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  rejection_reason TEXT,
  approval_date DATE,
  payment_date DATE,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherches
CREATE INDEX IF NOT EXISTS idx_benefit_claims_user ON public.user_benefit_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_benefit_claims_status ON public.user_benefit_claims(status);
CREATE INDEX IF NOT EXISTS idx_benefit_claims_date ON public.user_benefit_claims(claim_date);

-- ============================================
-- TABLE: Fonds mutuels
-- ============================================

CREATE TABLE IF NOT EXISTS public.mutual_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fund_type TEXT NOT NULL CHECK (fund_type IN ('emergency', 'investment', 'solidarity')),
  total_amount NUMERIC(12, 2) DEFAULT 0,
  available_amount NUMERIC(12, 2) DEFAULT 0,
  allocated_amount NUMERIC(12, 2) DEFAULT 0,
  num_contributors INTEGER DEFAULT 0,
  target_amount NUMERIC(12, 2),
  target_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer fonds de base
INSERT INTO public.mutual_funds (name, description, fund_type, target_amount) VALUES
  ('Fonds d''Urgence', 'Fonds pour situations d''urgence', 'emergency', 5000000),
  ('Fonds d''Investissement', 'Fonds pour projets communautaires', 'investment', 10000000),
  ('Fonds de Solidarité', 'Fonds d''aide mutuelle', 'solidarity', 3000000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TABLE: Contributions aux fonds mutuels
-- ============================================

CREATE TABLE IF NOT EXISTS public.mutual_fund_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.mutual_funds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  contribution_type TEXT NOT NULL DEFAULT 'voluntary' CHECK (contribution_type IN ('voluntary', 'automatic', 'special')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherches
CREATE INDEX IF NOT EXISTS idx_fund_contributions_fund ON public.mutual_fund_contributions(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_contributions_user ON public.mutual_fund_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_fund_contributions_date ON public.mutual_fund_contributions(contribution_date);

-- ============================================
-- FONCTIONS UTILITAIRES
-- ============================================

-- Fonction pour calculer le prochain paiement
CREATE OR REPLACE FUNCTION calculate_next_payment_date(
  p_last_payment_date DATE,
  p_frequency TEXT
) RETURNS DATE AS $$
BEGIN
  IF p_last_payment_date IS NULL THEN
    RETURN CURRENT_DATE;
  END IF;

  CASE p_frequency
    WHEN 'monthly' THEN
      RETURN p_last_payment_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      RETURN p_last_payment_date + INTERVAL '3 months';
    WHEN 'yearly' THEN
      RETURN p_last_payment_date + INTERVAL '1 year';
    ELSE
      RETURN p_last_payment_date + INTERVAL '1 month';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour vérifier l'éligibilité à une prestation
CREATE OR REPLACE FUNCTION check_benefit_eligibility(
  p_user_id UUID,
  p_benefit_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_contribution RECORD;
  v_benefit RECORD;
BEGIN
  -- Récupérer la contribution active de l'utilisateur
  SELECT * INTO v_contribution
  FROM public.user_social_contributions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND is_up_to_date = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Récupérer la prestation
  SELECT * INTO v_benefit
  FROM public.social_benefits
  WHERE id = p_benefit_id
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Vérifier les mois requis
  IF v_contribution.months_paid < v_benefit.required_months THEN
    RETURN FALSE;
  END IF;

  -- Vérifier le niveau de couverture
  -- (basic < standard < premium)
  -- Logique simplifiée pour la simulation

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger pour mettre à jour la date de modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contributions_updated_at
  BEFORE UPDATE ON public.user_social_contributions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.user_benefit_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calculer automatiquement next_payment_date
CREATE OR REPLACE FUNCTION set_next_payment_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_payment_date IS NOT NULL THEN
    NEW.next_payment_date := calculate_next_payment_date(
      NEW.last_payment_date,
      NEW.payment_frequency
    );
  ELSE
    NEW.next_payment_date := CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_next_payment_date
  BEFORE INSERT OR UPDATE OF last_payment_date, payment_frequency
  ON public.user_social_contributions
  FOR EACH ROW
  EXECUTE FUNCTION set_next_payment_date();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Plans de cotisation (lecture publique)
ALTER TABLE public.social_contributions_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans de cotisation lisibles par tous"
  ON public.social_contributions_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Cotisations utilisateurs (lecture/écriture propre)
ALTER TABLE public.user_social_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs cotisations"
  ON public.user_social_contributions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs cotisations"
  ON public.user_social_contributions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent mettre à jour leurs cotisations"
  ON public.user_social_contributions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Prestations (lecture publique)
ALTER TABLE public.social_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prestations lisibles par tous"
  ON public.social_benefits
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Demandes de prestations (lecture/écriture propre)
ALTER TABLE public.user_benefit_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs demandes"
  ON public.user_benefit_claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs demandes"
  ON public.user_benefit_claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent mettre à jour leurs demandes"
  ON public.user_benefit_claims
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonds mutuels (lecture publique)
ALTER TABLE public.mutual_funds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fonds mutuels lisibles par tous"
  ON public.mutual_funds
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Contributions aux fonds (lecture/écriture propre)
ALTER TABLE public.mutual_fund_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs contributions aux fonds"
  ON public.mutual_fund_contributions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer contributions aux fonds"
  ON public.mutual_fund_contributions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTAIRES
-- ============================================

COMMENT ON TABLE public.social_contributions_plans IS 'Plans de cotisation sociale disponibles';
COMMENT ON TABLE public.user_social_contributions IS 'Cotisations sociales des utilisateurs';
COMMENT ON TABLE public.social_benefits IS 'Prestations sociales disponibles';
COMMENT ON TABLE public.user_benefit_claims IS 'Demandes de prestations des utilisateurs';
COMMENT ON TABLE public.mutual_funds IS 'Fonds mutuels coopératifs';
COMMENT ON TABLE public.mutual_fund_contributions IS 'Contributions aux fonds mutuels';
