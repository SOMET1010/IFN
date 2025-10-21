/*
  # Amélioration Authentification Sociale

  1. Contexte
    - La majorité des utilisateurs en Côte d'Ivoire n'ont pas d'email
    - Ils utilisent WhatsApp, comptes Google (Android), et Mobile Money
    - Cette migration ajoute le support complet pour ces méthodes

  2. Nouvelles Colonnes
    - `whatsapp_phone` - Numéro WhatsApp de l'utilisateur
    - `whatsapp_name` - Nom d'affichage WhatsApp
    - `whatsapp_verified` - Vérification du numéro WhatsApp
    - `google_email` - Email Google (même sans OAuth configuré)
    - `google_name` - Nom du compte Google
    - `primary_auth_method` - Méthode d'authentification principale
    - `last_auth_method` - Dernière méthode utilisée pour se connecter
    - `auth_methods_used` - Tableau de toutes les méthodes utilisées

  3. Table Sessions Temporaires
    - Stockage sécurisé des sessions OTP
    - Expiration automatique après 5 minutes
    - Support de tous les opérateurs

  4. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour protéger les données personnelles
    - Hash des OTP (pas de stockage en clair)

  5. Notes Importantes
    - Compatible avec l'existant (pas de données perdues)
    - Permet connexion multiple (Mobile Money + WhatsApp)
    - Prépare l'intégration future de WhatsApp Business API
*/

-- Ajouter colonnes pour WhatsApp et authentification sociale
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS google_email TEXT,
ADD COLUMN IF NOT EXISTS google_name TEXT,
ADD COLUMN IF NOT EXISTS primary_auth_method TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS last_auth_method TEXT,
ADD COLUMN IF NOT EXISTS auth_methods_used TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_whatsapp_phone ON user_profiles(whatsapp_phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_email ON user_profiles(google_email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_auth ON user_profiles(primary_auth_method);

-- Contrainte unique pour WhatsApp (un numéro = un compte)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_whatsapp_unique
ON user_profiles(whatsapp_phone)
WHERE whatsapp_phone IS NOT NULL;

-- Table pour gérer les sessions OTP de manière sécurisée
CREATE TABLE IF NOT EXISTS auth_otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('orange', 'mtn', 'moov', 'whatsapp')),
  otp_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  ip_address TEXT,
  user_agent TEXT
);

-- Index pour recherche rapide et nettoyage
CREATE INDEX IF NOT EXISTS idx_otp_sessions_phone ON auth_otp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_expires ON auth_otp_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_created ON auth_otp_sessions(created_at);

-- RLS sur la table OTP (sécurité maximale)
ALTER TABLE auth_otp_sessions ENABLE ROW LEVEL SECURITY;

-- Seul le service backend peut accéder aux sessions OTP
CREATE POLICY "Service role only access"
  ON auth_otp_sessions
  FOR ALL
  TO authenticated
  USING (FALSE);

-- Fonction pour nettoyer les sessions expirées (à exécuter périodiquement)
CREATE OR REPLACE FUNCTION cleanup_expired_otp_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM auth_otp_sessions
  WHERE expires_at < NOW()
  OR (created_at < NOW() - INTERVAL '1 hour' AND NOT verified);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour enregistrer une méthode d'authentification utilisée
CREATE OR REPLACE FUNCTION record_auth_method(
  user_id UUID,
  auth_method TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET
    last_auth_method = auth_method,
    auth_methods_used = ARRAY(
      SELECT DISTINCT unnest(
        COALESCE(auth_methods_used, ARRAY[]::TEXT[]) || ARRAY[auth_method]
      )
    ),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un numéro WhatsApp existe déjà
CREATE OR REPLACE FUNCTION check_whatsapp_exists(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE whatsapp_phone = phone
    AND whatsapp_verified = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques d'authentification
CREATE OR REPLACE FUNCTION get_auth_stats()
RETURNS TABLE (
  auth_method TEXT,
  user_count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH total_users AS (
    SELECT COUNT(*) as total FROM user_profiles
  ),
  method_counts AS (
    SELECT
      unnest(auth_methods_used) as method,
      COUNT(*) as count
    FROM user_profiles
    WHERE auth_methods_used IS NOT NULL
    GROUP BY unnest(auth_methods_used)
  )
  SELECT
    mc.method,
    mc.count,
    ROUND((mc.count::NUMERIC / tu.total * 100), 2) as pct
  FROM method_counts mc, total_users tu
  ORDER BY mc.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour les profils existants avec des valeurs par défaut intelligentes
UPDATE user_profiles
SET
  primary_auth_method = CASE
    WHEN mobile_money_operator IS NOT NULL THEN 'mobile_money'
    WHEN email LIKE '%@mobilemoney.local' THEN 'mobile_money'
    ELSE 'email'
  END,
  auth_methods_used = ARRAY[
    CASE
      WHEN mobile_money_operator IS NOT NULL THEN 'mobile_money'
      WHEN email LIKE '%@mobilemoney.local' THEN 'mobile_money'
      ELSE 'email'
    END
  ]
WHERE primary_auth_method = 'email'
AND (mobile_money_operator IS NOT NULL OR email LIKE '%@mobilemoney.local');

-- Vue pour les administrateurs : aperçu des méthodes d'authentification
CREATE OR REPLACE VIEW auth_methods_overview AS
SELECT
  primary_auth_method,
  COUNT(*) as user_count,
  ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM user_profiles) * 100, 2) as percentage,
  COUNT(*) FILTER (WHERE whatsapp_verified = TRUE) as whatsapp_users,
  COUNT(*) FILTER (WHERE mobile_money_verified = TRUE) as mobile_money_users,
  COUNT(*) FILTER (WHERE email NOT LIKE '%@mobilemoney.local') as email_users
FROM user_profiles
GROUP BY primary_auth_method
ORDER BY user_count DESC;

-- Commentaires pour documentation
COMMENT ON COLUMN user_profiles.whatsapp_phone IS 'Numéro WhatsApp de l''utilisateur (même format que phone)';
COMMENT ON COLUMN user_profiles.whatsapp_verified IS 'TRUE si le numéro WhatsApp a été vérifié par OTP';
COMMENT ON COLUMN user_profiles.primary_auth_method IS 'Méthode principale : mobile_money, whatsapp, email, google';
COMMENT ON COLUMN user_profiles.auth_methods_used IS 'Historique de toutes les méthodes utilisées';
COMMENT ON TABLE auth_otp_sessions IS 'Sessions OTP temporaires pour authentification par téléphone';
COMMENT ON FUNCTION cleanup_expired_otp_sessions() IS 'Nettoie les sessions OTP expirées (à exécuter via cron)';
COMMENT ON VIEW auth_methods_overview IS 'Statistiques des méthodes d''authentification utilisées';
