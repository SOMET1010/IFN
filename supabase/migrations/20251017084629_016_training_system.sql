/*
  # Système de Formation E-Learning
  
  ## Nouvelles Tables
  
  ### 1. training_modules (Modules de formation)
    - `id` (uuid, PK)
    - `title` (text) - Titre du module
    - `description` (text) - Description détaillée
    - `category` (text) - ventes, stocks, paiements, social, marketplace
    - `difficulty` (text) - beginner, intermediate, advanced
    - `duration_minutes` (integer) - Durée totale estimée
    - `thumbnail_url` (text) - Image de couverture
    - `order_index` (integer) - Ordre d'affichage
    - `is_active` (boolean) - Visible ou non
    - `prerequisites` (jsonb) - IDs des modules prérequis
    - `created_at`, `updated_at` (timestamps)
  
  ### 2. training_videos (Vidéos de formation)
    - `id` (uuid, PK)
    - `module_id` (uuid, FK vers training_modules)
    - `title` (text) - Titre de la vidéo
    - `description` (text) - Description
    - `video_url` (text) - URL de la vidéo
    - `subtitle_url` (text) - URL des sous-titres WebVTT
    - `duration_seconds` (integer) - Durée en secondes
    - `order_index` (integer) - Ordre dans le module
    - `thumbnail_url` (text) - Miniature
    - `created_at` (timestamp)
  
  ### 3. user_training_progress (Progression utilisateur)
    - `id` (uuid, PK)
    - `user_id` (uuid, FK vers users)
    - `video_id` (uuid, FK vers training_videos)
    - `completed` (boolean) - Vidéo terminée ou non
    - `progress_percent` (numeric) - Pourcentage de progression
    - `last_position_seconds` (integer) - Position de reprise
    - `watch_time_seconds` (integer) - Temps total regardé
    - `completed_at` (timestamp) - Date de complétion
    - `created_at`, `updated_at` (timestamps)
  
  ### 4. training_certificates (Certificats)
    - `id` (uuid, PK)
    - `user_id` (uuid, FK vers users)
    - `module_id` (uuid, FK vers training_modules)
    - `certificate_number` (text, unique) - Numéro unique du certificat
    - `completion_rate` (numeric) - Taux de complétion
    - `issued_at` (timestamp) - Date d'émission
  
  ### 5. training_badges (Badges)
    - `id` (uuid, PK)
    - `user_id` (uuid, FK vers users)
    - `badge_type` (text) - bronze, silver, gold, expert
    - `module_id` (uuid, FK vers training_modules)
    - `earned_at` (timestamp) - Date d'obtention
  
  ## Sécurité
    - RLS activé sur toutes les tables
    - Les modules et vidéos sont visibles par tous (lecture publique)
    - La progression et certificats sont privés par utilisateur
*/

-- ============================================
-- 1. TABLE TRAINING_MODULES
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('ventes', 'stocks', 'paiements', 'social', 'marketplace', 'general')),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  prerequisites JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_training_modules_category ON public.training_modules(category);
CREATE INDEX IF NOT EXISTS idx_training_modules_active ON public.training_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_training_modules_order ON public.training_modules(order_index);

-- ============================================
-- 2. TABLE TRAINING_VIDEOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  subtitle_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_training_videos_module ON public.training_videos(module_id);
CREATE INDEX IF NOT EXISTS idx_training_videos_order ON public.training_videos(order_index);

-- ============================================
-- 3. TABLE USER_TRAINING_PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.training_videos(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  progress_percent NUMERIC(5, 2) DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_position_seconds INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_training_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_video ON public.user_training_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_training_progress(completed);

-- ============================================
-- 4. TABLE TRAINING_CERTIFICATES
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  completion_rate NUMERIC(5, 2) DEFAULT 100 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.training_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_module ON public.training_certificates(module_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON public.training_certificates(certificate_number);

-- ============================================
-- 5. TABLE TRAINING_BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.training_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('bronze', 'silver', 'gold', 'expert')),
  module_id UUID REFERENCES public.training_modules(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_type, module_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_badges_user ON public.training_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_type ON public.training_badges(badge_type);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour calculer la progression d'un module
CREATE OR REPLACE FUNCTION calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_videos INTEGER;
  completed_videos INTEGER;
  progress NUMERIC;
BEGIN
  -- Compter le total de vidéos du module
  SELECT COUNT(*) INTO total_videos
  FROM public.training_videos
  WHERE module_id = p_module_id;

  -- Si pas de vidéos, retourner 0
  IF total_videos = 0 THEN
    RETURN 0;
  END IF;

  -- Compter les vidéos complétées par l'utilisateur
  SELECT COUNT(*) INTO completed_videos
  FROM public.user_training_progress utp
  JOIN public.training_videos tv ON tv.id = utp.video_id
  WHERE tv.module_id = p_module_id
    AND utp.user_id = p_user_id
    AND utp.completed = true;

  -- Calculer le pourcentage
  progress := (completed_videos::NUMERIC / total_videos::NUMERIC) * 100;

  RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour attribuer automatiquement les badges
CREATE OR REPLACE FUNCTION award_badge_on_progress()
RETURNS TRIGGER AS $$
DECLARE
  module_progress NUMERIC;
  v_module_id UUID;
BEGIN
  -- Récupérer le module_id de la vidéo
  SELECT module_id INTO v_module_id
  FROM public.training_videos
  WHERE id = NEW.video_id;

  -- Calculer la progression du module
  module_progress := calculate_module_progress(NEW.user_id, v_module_id);

  -- Attribuer badge Bronze (25%)
  IF module_progress >= 25 THEN
    INSERT INTO public.training_badges (user_id, badge_type, module_id)
    VALUES (NEW.user_id, 'bronze', v_module_id)
    ON CONFLICT (user_id, badge_type, module_id) DO NOTHING;
  END IF;

  -- Attribuer badge Silver (50%)
  IF module_progress >= 50 THEN
    INSERT INTO public.training_badges (user_id, badge_type, module_id)
    VALUES (NEW.user_id, 'silver', v_module_id)
    ON CONFLICT (user_id, badge_type, module_id) DO NOTHING;
  END IF;

  -- Attribuer badge Gold (100%)
  IF module_progress >= 100 THEN
    INSERT INTO public.training_badges (user_id, badge_type, module_id)
    VALUES (NEW.user_id, 'gold', v_module_id)
    ON CONFLICT (user_id, badge_type, module_id) DO NOTHING;

    -- Générer certificat
    INSERT INTO public.training_certificates (user_id, module_id, certificate_number, completion_rate)
    VALUES (
      NEW.user_id,
      v_module_id,
      'CERT-' || UPPER(SUBSTRING(MD5(NEW.user_id::TEXT || v_module_id::TEXT || NOW()::TEXT), 1, 12)),
      100
    )
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END IF;

  -- Vérifier si tous les modules sont complétés pour badge Expert
  DECLARE
    total_modules INTEGER;
    completed_modules INTEGER;
  BEGIN
    SELECT COUNT(*) INTO total_modules
    FROM public.training_modules
    WHERE is_active = true;

    SELECT COUNT(DISTINCT module_id) INTO completed_modules
    FROM public.training_certificates
    WHERE user_id = NEW.user_id;

    IF completed_modules >= total_modules AND total_modules > 0 THEN
      INSERT INTO public.training_badges (user_id, badge_type, module_id)
      VALUES (NEW.user_id, 'expert', NULL)
      ON CONFLICT (user_id, badge_type, module_id) DO NOTHING;
    END IF;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour attribuer les badges
DROP TRIGGER IF EXISTS trigger_award_badges ON public.user_training_progress;
CREATE TRIGGER trigger_award_badges
  AFTER INSERT OR UPDATE OF completed
  ON public.user_training_progress
  FOR EACH ROW
  WHEN (NEW.completed = true)
  EXECUTE FUNCTION award_badge_on_progress();

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_training_modules_updated_at ON public.training_modules;
CREATE TRIGGER trigger_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_user_progress_updated_at ON public.user_training_progress;
CREATE TRIGGER trigger_user_progress_updated_at
  BEFORE UPDATE ON public.user_training_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Modules - Lecture publique
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active modules"
  ON public.training_modules FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Vidéos - Lecture publique
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view videos"
  ON public.training_videos FOR SELECT
  TO authenticated
  USING (true);

-- Progression - Privée par utilisateur
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON public.user_training_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_training_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_training_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Certificats - Privés par utilisateur
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON public.training_certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Badges - Privés par utilisateur
ALTER TABLE public.training_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON public.training_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);