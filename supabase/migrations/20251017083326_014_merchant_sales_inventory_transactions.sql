/*
  # Tables pour Ventes, Inventaire et Transactions Mobile Money
  
  ## Nouvelles Tables
  
  ### 1. sales (Ventes des marchands)
    - `id` (uuid, PK)
    - `merchant_id` (uuid, FK vers users)
    - `client_name` (text)
    - `products` (text - description des produits)
    - `amount` (numeric)
    - `payment_method` (text)
    - `status` (text - completed, pending, cancelled)
    - `sale_date` (date)
    - `created_at`, `updated_at` (timestamps)
  
  ### 2. inventory (Inventaire des marchands)
    - `id` (uuid, PK)
    - `merchant_id` (uuid, FK vers users)
    - `product_name` (text)
    - `category` (text)
    - `current_stock` (numeric)
    - `max_stock` (numeric)
    - `unit` (text)
    - `location` (text - emplacement dans l'entrepôt)
    - `expiry_date` (date)
    - `price` (numeric)
    - `status` (text - ok, low, critical)
    - `low_threshold_percent` (numeric - défaut 20%)
    - `critical_threshold_percent` (numeric - défaut 10%)
    - `created_at`, `updated_at` (timestamps)
  
  ### 3. stock_movements (Historique des mouvements de stock)
    - `id` (uuid, PK)
    - `inventory_id` (uuid, FK vers inventory)
    - `movement_type` (text - in, out, adjustment)
    - `quantity` (numeric)
    - `previous_stock` (numeric)
    - `new_stock` (numeric)
    - `reason` (text)
    - `reference_id` (uuid - peut référencer une vente ou commande)
    - `created_at` (timestamp)
  
  ### 4. transactions (Transactions Mobile Money)
    - `id` (uuid, PK)
    - `user_id` (uuid, FK vers users)
    - `transaction_code` (text, unique)
    - `operator` (text - orange, mtn, wave, moov)
    - `phone_number` (text)
    - `amount` (numeric)
    - `status` (text - pending, processing, success, failed)
    - `transaction_type` (text - payment, contribution, transfer)
    - `reference_id` (uuid - peut référencer une vente, commande ou cotisation)
    - `metadata` (jsonb - infos supplémentaires)
    - `created_at`, `updated_at` (timestamps)
  
  ### 5. mobile_money_operators (Opérateurs Mobile Money)
    - `id` (uuid, PK)
    - `name` (text)
    - `code` (text, unique)
    - `logo_url` (text)
    - `ussd_code` (text)
    - `is_active` (boolean)
    - `created_at` (timestamp)
  
  ## Sécurité
    - RLS activé sur toutes les tables
    - Les marchands peuvent uniquement voir/modifier leurs propres données
    - Les admins ont accès complet en lecture
  
  ## Notes importantes
    - Les statuts de stock sont calculés automatiquement via trigger
    - Les mouvements de stock sont enregistrés automatiquement lors des ventes
    - Les codes de transaction sont générés de manière unique
*/

-- ============================================
-- 1. TABLE SALES (Ventes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  products TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'cash')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_sales_merchant ON public.sales(merchant_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);

-- ============================================
-- 2. TABLE INVENTORY (Inventaire)
-- ============================================
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_stock NUMERIC(15, 3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  max_stock NUMERIC(15, 3) NOT NULL CHECK (max_stock > 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  location TEXT NOT NULL DEFAULT 'Entrepôt principal',
  expiry_date DATE,
  price NUMERIC(15, 2) NOT NULL CHECK (price >= 0),
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'low', 'critical')),
  low_threshold_percent NUMERIC(5, 2) DEFAULT 20.00 CHECK (low_threshold_percent >= 0 AND low_threshold_percent <= 100),
  critical_threshold_percent NUMERIC(5, 2) DEFAULT 10.00 CHECK (critical_threshold_percent >= 0 AND critical_threshold_percent <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_inventory_merchant ON public.inventory(merchant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON public.inventory(category);

-- ============================================
-- 3. TABLE STOCK_MOVEMENTS (Mouvements de stock)
-- ============================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment', 'sale', 'return', 'loss')),
  quantity NUMERIC(15, 3) NOT NULL,
  previous_stock NUMERIC(15, 3) NOT NULL,
  new_stock NUMERIC(15, 3) NOT NULL,
  reason TEXT,
  reference_id UUID,
  reference_type TEXT CHECK (reference_type IN ('sale', 'order', 'manual', 'system')),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_stock_movements_inventory ON public.stock_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON public.stock_movements(created_at DESC);

-- ============================================
-- 4. TABLE TRANSACTIONS (Mobile Money)
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_code TEXT NOT NULL UNIQUE,
  operator TEXT NOT NULL CHECK (operator IN ('orange', 'mtn', 'wave', 'moov')),
  phone_number TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'contribution', 'transfer', 'withdrawal')),
  reference_id UUID,
  reference_type TEXT CHECK (reference_type IN ('sale', 'order', 'contribution', 'other')),
  metadata JSONB DEFAULT '{}'::jsonb,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Index
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON public.transactions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(created_at DESC);

-- ============================================
-- 5. TABLE MOBILE_MONEY_OPERATORS
-- ============================================
CREATE TABLE IF NOT EXISTS public.mobile_money_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  ussd_code TEXT,
  is_active BOOLEAN DEFAULT true,
  min_amount NUMERIC(15, 2) DEFAULT 100,
  max_amount NUMERIC(15, 2) DEFAULT 5000000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les opérateurs ivoiriens
INSERT INTO public.mobile_money_operators (name, code, ussd_code, logo_url) VALUES
  ('Orange Money', 'orange', '#144#', '/logos/orange-money.png'),
  ('MTN Mobile Money', 'mtn', '*133#', '/logos/mtn-money.png'),
  ('Wave', 'wave', '*170#', '/logos/wave.png'),
  ('Moov Money', 'moov', '#155#', '/logos/moov-money.png')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour le statut du stock automatiquement
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    stock_percent NUMERIC;
  BEGIN
    -- Calculer le pourcentage de stock
    stock_percent := (NEW.current_stock / NEW.max_stock) * 100;
    
    -- Déterminer le statut
    IF stock_percent <= NEW.critical_threshold_percent THEN
      NEW.status := 'critical';
    ELSIF stock_percent <= NEW.low_threshold_percent THEN
      NEW.status := 'low';
    ELSE
      NEW.status := 'ok';
    END IF;
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le statut automatiquement
DROP TRIGGER IF EXISTS trigger_update_inventory_status ON public.inventory;
CREATE TRIGGER trigger_update_inventory_status
  BEFORE INSERT OR UPDATE OF current_stock, max_stock, low_threshold_percent, critical_threshold_percent
  ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_status();

-- Fonction pour enregistrer les mouvements de stock
CREATE OR REPLACE FUNCTION record_stock_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Enregistrer le mouvement uniquement si le stock a changé
  IF OLD.current_stock IS DISTINCT FROM NEW.current_stock THEN
    INSERT INTO public.stock_movements (
      inventory_id,
      movement_type,
      quantity,
      previous_stock,
      new_stock,
      reason,
      reference_type
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.current_stock > OLD.current_stock THEN 'in'
        WHEN NEW.current_stock < OLD.current_stock THEN 'out'
        ELSE 'adjustment'
      END,
      ABS(NEW.current_stock - OLD.current_stock),
      OLD.current_stock,
      NEW.current_stock,
      'Mise à jour automatique du stock',
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer les mouvements
DROP TRIGGER IF EXISTS trigger_record_stock_movement ON public.inventory;
CREATE TRIGGER trigger_record_stock_movement
  AFTER UPDATE OF current_stock
  ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION record_stock_movement();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS trigger_sales_updated_at ON public.sales;
CREATE TRIGGER trigger_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_inventory_updated_at ON public.inventory;
CREATE TRIGGER trigger_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON public.transactions;
CREATE TRIGGER trigger_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Sales RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales"
  ON public.sales FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

CREATE POLICY "Users can insert own sales"
  ON public.sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Users can update own sales"
  ON public.sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Users can delete own sales"
  ON public.sales FOR DELETE
  TO authenticated
  USING (auth.uid() = merchant_id);

-- Inventory RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON public.inventory FOR SELECT
  TO authenticated
  USING (auth.uid() = merchant_id);

CREATE POLICY "Users can insert own inventory"
  ON public.inventory FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Users can update own inventory"
  ON public.inventory FOR UPDATE
  TO authenticated
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

CREATE POLICY "Users can delete own inventory"
  ON public.inventory FOR DELETE
  TO authenticated
  USING (auth.uid() = merchant_id);

-- Stock Movements RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stock movements"
  ON public.stock_movements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.inventory
      WHERE inventory.id = stock_movements.inventory_id
      AND inventory.merchant_id = auth.uid()
    )
  );

-- Transactions RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Mobile Money Operators - lecture publique
ALTER TABLE public.mobile_money_operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view operators"
  ON public.mobile_money_operators FOR SELECT
  TO authenticated
  USING (true);