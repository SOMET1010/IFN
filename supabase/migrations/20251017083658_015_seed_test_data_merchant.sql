/*
  # Données de test pour les marchands
  
  Création de données de test pour faciliter la démonstration:
  - Utilisateurs de test (marchands)
  - Ventes de test
  - Inventaire de test
  - Transactions Mobile Money de test
  
  Note: Ces données sont créées uniquement s'il n'existe pas déjà de données
*/

-- Fonction pour créer un utilisateur marchand de test
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO test_user_id FROM public.users WHERE email = 'merchant.test@inclusionnumerique.ci' LIMIT 1;
  
  -- Si pas d'utilisateur de test, créer des données de test
  IF test_user_id IS NULL THEN
    -- Créer quelques ventes d'exemple
    INSERT INTO public.sales (merchant_id, client_name, products, amount, payment_method, status, sale_date, notes)
    SELECT 
      (SELECT id FROM public.users WHERE role = 'merchant' LIMIT 1),
      'Client ' || n,
      CASE 
        WHEN n % 3 = 0 THEN 'Bananes plantain, Ignames'
        WHEN n % 3 = 1 THEN 'Tomates, Oignons, Piments'
        ELSE 'Poisson frais, Attiéké'
      END,
      (5000 + (n * 2500))::numeric,
      CASE 
        WHEN n % 3 = 0 THEN 'mobile_money'
        WHEN n % 3 = 1 THEN 'cash'
        ELSE 'bank_transfer'
      END,
      CASE 
        WHEN n % 10 = 0 THEN 'pending'
        WHEN n % 10 = 1 THEN 'cancelled'
        ELSE 'completed'
      END,
      CURRENT_DATE - (n || ' days')::interval,
      'Vente de test numéro ' || n
    FROM generate_series(1, 25) AS n
    WHERE EXISTS (SELECT 1 FROM public.users WHERE role = 'merchant' LIMIT 1);

    -- Créer des articles d'inventaire d'exemple
    INSERT INTO public.inventory (
      merchant_id,
      product_name,
      category,
      current_stock,
      max_stock,
      unit,
      location,
      expiry_date,
      price,
      low_threshold_percent,
      critical_threshold_percent
    )
    SELECT 
      (SELECT id FROM public.users WHERE role = 'merchant' LIMIT 1),
      product_data.name,
      product_data.category,
      product_data.stock,
      product_data.max_stock,
      product_data.unit,
      product_data.location,
      CASE 
        WHEN product_data.has_expiry THEN (CURRENT_DATE + (product_data.expiry_days || ' days')::interval)::date
        ELSE NULL
      END,
      product_data.price,
      20,
      10
    FROM (VALUES
      ('Bananes plantain', 'Fruits', 45, 200, 'kg', 'Entrepôt A', true, 90, 2500),
      ('Tomates', 'Légumes', 120, 300, 'kg', 'Entrepôt B', true, 15, 1800),
      ('Oignons', 'Légumes', 8, 150, 'kg', 'Entrepôt B', true, 45, 1200),
      ('Piments', 'Légumes', 15, 100, 'kg', 'Entrepôt B', true, 30, 3000),
      ('Ignames', 'Tubercules', 180, 400, 'kg', 'Entrepôt A', false, 0, 1500),
      ('Manioc', 'Tubercules', 250, 500, 'kg', 'Entrepôt A', false, 0, 800),
      ('Poisson frais', 'Poissons', 5, 80, 'kg', 'Chambre froide', true, 3, 4500),
      ('Attiéké', 'Céréales', 95, 200, 'kg', 'Entrepôt C', true, 60, 1000),
      ('Riz local', 'Céréales', 340, 600, 'kg', 'Entrepôt C', false, 0, 700),
      ('Mangues', 'Fruits', 65, 150, 'kg', 'Entrepôt A', true, 20, 2000),
      ('Ananas', 'Fruits', 12, 100, 'unité', 'Entrepôt A', true, 10, 1500),
      ('Aubergines', 'Légumes', 40, 120, 'kg', 'Entrepôt B', true, 25, 1200)
    ) AS product_data(name, category, stock, max_stock, unit, location, has_expiry, expiry_days, price)
    WHERE EXISTS (SELECT 1 FROM public.users WHERE role = 'merchant' LIMIT 1);

    -- Créer quelques transactions Mobile Money d'exemple
    INSERT INTO public.transactions (
      user_id,
      transaction_code,
      operator,
      phone_number,
      amount,
      status,
      transaction_type,
      reference_type,
      metadata,
      completed_at
    )
    SELECT 
      (SELECT id FROM public.users WHERE role = 'merchant' LIMIT 1),
      'MMO-' || TO_CHAR(CURRENT_DATE - (n || ' days')::interval, 'YYYYMMDD') || '-' || LPAD(n::text, 5, '0'),
      CASE 
        WHEN n % 4 = 0 THEN 'orange'
        WHEN n % 4 = 1 THEN 'mtn'
        WHEN n % 4 = 2 THEN 'wave'
        ELSE 'moov'
      END,
      '07' || LPAD((12345678 + n)::text, 8, '0'),
      (8000 + (n * 1500))::numeric,
      CASE 
        WHEN n % 15 = 0 THEN 'failed'
        WHEN n % 20 = 0 THEN 'pending'
        ELSE 'success'
      END,
      'payment',
      'sale',
      jsonb_build_object(
        'client', 'Client Test ' || n,
        'source', 'Vente marketplace'
      ),
      CASE 
        WHEN n % 15 = 0 OR n % 20 = 0 THEN NULL
        ELSE (CURRENT_TIMESTAMP - (n || ' days')::interval)
      END
    FROM generate_series(1, 30) AS n
    WHERE EXISTS (SELECT 1 FROM public.users WHERE role = 'merchant' LIMIT 1);

    RAISE NOTICE 'Données de test créées avec succès';
  ELSE
    RAISE NOTICE 'Des données existent déjà, aucune donnée de test créée';
  END IF;
END $$;