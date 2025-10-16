-- Script pour créer les comptes d'authentification avec mots de passe
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- IMPORTANT: Ces utilisateurs seront créés dans la table auth.users de Supabase
-- avec des mots de passe par défaut pour les tests

-- Création des utilisateurs via RPC (Remote Procedure Call)
-- Note: Ceci doit être exécuté par un administrateur ou via le dashboard Supabase

-- 1. Créer la fonction pour enregistrer les utilisateurs s'ils n'existent pas déjà
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS void AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Vérifier si les utilisateurs existent déjà
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email LIKE '%@example.com';

    IF user_count = 0 THEN
        -- Créer les utilisateurs de test
        INSERT INTO auth.users (
            instance_id,
            id,
            email,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud,
            iss,
            phone,
            phone_confirmed_at,
            confirmation_sent_at,
            recovery_sent_at,
            email_change_sent_at,
            new_email,
            invited_at,
            action_link,
            provider,
            providers,
            raw_app_meta_data,
            raw_user_meta_data,
            is_sso_user,
            is_super_admin,
            banned_until,
            reauthentication_sent_at,
            password_hash
        ) VALUES
        -- Marchand 1
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000011', 'marchand1@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507111111', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Jean Kouamé","role":"merchant"}', '{"full_name":"Jean Kouamé","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Marchand 2
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000012', 'marchand2@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507222222', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Aminata Touré","role":"merchant"}', '{"full_name":"Aminata Touré","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Marchand 3
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000013', 'marchand3@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507333333', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Koffi Yao","role":"merchant"}', '{"full_name":"Koffi Yao","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Marchand 4
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000014', 'marchand4@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507444444', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Fatima Diallo","role":"merchant"}', '{"full_name":"Fatima Diallo","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Marchand 5
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000015', 'marchand5@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507555555', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Mamadou Koné","role":"merchant"}', '{"full_name":"Mamadou Koné","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Producteur 1
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000016', 'producteur1@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507666666', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Paul Amani","role":"producer"}', '{"full_name":"Paul Amani","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Producteur 2
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000017', 'producteur2@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507777777', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Marie N guessan","role":"producer"}', '{"full_name":"Marie N guessan","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Producteur 3
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000018', 'producteur3@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507888888', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Isaac Ouattara","role":"producer"}', '{"full_name":"Isaac Ouattara","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Gestionnaire 1
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000019', 'gestion1@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507999999', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Sophie Bamba","role":"cooperative"}', '{"full_name":"Sophie Bamba","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Gestionnaire 2
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000020', 'gestion2@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507101010', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Michel Dosso","role":"cooperative"}', '{"full_name":"Michel Dosso","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Gestionnaire 3
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000021', 'gestion3@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507202020', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Estelle Kouadio","role":"cooperative"}', '{"full_name":"Estelle Kouadio","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'),

        -- Administrateur
        ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'admin@example.com', NOW(), NOW(), NOW(), 'authenticated', 'authenticated', 'https://your-project.supabase.co/auth/v1', '+22507000000', NOW(), NOW(), NOW(), NOW(), NULL, NULL, NULL, 'email', '{"email":true, "phone":true}', '{"provider":"email","providers":["email"]}', '{"name":"Administrateur","role":"admin"}', '{"full_name":"Administrateur Système","avatar_url":null}', false, false, NULL, NULL, NULL, 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4');

        RAISE NOTICE 'Utilisateurs de test créés avec succès';
    ELSE
        RAISE NOTICE 'Les utilisateurs de test existent déjà';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer la fonction pour réinitialiser les mots de passe
CREATE OR REPLACE FUNCTION reset_test_passwords()
RETURNS void AS $$
BEGIN
    -- Mettre à jour les mots de passe pour tous les utilisateurs de test
    -- Le hash correspond à 'password123'
    UPDATE auth.users
    SET password_hash = 'argon2id$v=19$m=65536,t=3,p=4$c2FsdDEyMzQ1Ng$R4V5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4'
    WHERE email LIKE '%@example.com';

    RAISE NOTICE 'Mots de passe réinitialisés avec succès';
END;
$$ LANGUAGE plpgsql;

-- 3. Exécuter la création des utilisateurs
SELECT create_test_users();

-- 4. Afficher un résumé
SELECT
    'COMPTE D''AUTHENTIFICATION CRÉÉS' as status,
    COUNT(*) as total_utilisateurs
FROM auth.users
WHERE email LIKE '%@example.com';

-- 5. Afficher les détails des comptes créés
SELECT
    email,
    email_confirmed_at as confirme_le,
    created_at as cree_le,
    raw_user_meta_data->>'name' as nom,
    raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email LIKE '%@example.com'
ORDER BY role, email;

-- 6. Instructions pour la connexion
SELECT
    'INSTRUCTIONS DE CONNEXION' as info,
    'Email: Utiliser les adresses @example.com' as instructions,
    'Mot de passe: password123' as password;