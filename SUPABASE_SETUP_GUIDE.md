# Guide de Configuration Supabase - Plateforme d'Inclusion Numérique

## 🎯 Objectif

Ce guide vous aidera à configurer complètement votre base de données Supabase pour la plateforme d'inclusion numérique. Suivez ces étapes dans l'ordre pour éviter les erreurs.

---

## ⚠️ IMPORTANT - Prérequis

1. **Accès à votre projet Supabase**: https://qmzubrrxuhgvphhliery.supabase.co
2. **Connexion au dashboard**: https://supabase.com/dashboard/project/qmzubrrxuhgvphhliery
3. **Accès à l'éditeur SQL**: Dashboard > SQL Editor

---

## 📋 Étapes d'Installation

### Étape 1: Accéder à l'Éditeur SQL

1. Connectez-vous à votre dashboard Supabase
2. Naviguez vers **SQL Editor** dans le menu de gauche
3. Cliquez sur **New Query** pour créer une nouvelle requête

---

### Étape 2: Appliquer les Migrations dans l'Ordre

Les migrations doivent être appliquées **DANS CET ORDRE EXACT** pour éviter les erreurs de dépendances:

#### Migration 1: Schéma Initial (001_initial_schema.sql)
**Description**: Crée toutes les tables de base, types personnalisés, et indexes
- Tables: users, products, orders, cooperatives, etc.
- Types: user_role, order_status, payment_method, etc.
- Relations et contraintes

**Action**:
1. Ouvrez le fichier `supabase/migrations/001_initial_schema.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL Supabase
4. Cliquez sur **RUN** (en bas à droite)
5. Vérifiez qu'il n'y a pas d'erreurs

---

#### Migration 2: Politiques RLS (002_rls_policies.sql)
**Description**: Active et configure Row Level Security pour toutes les tables
- Active RLS sur toutes les tables
- Crée les politiques d'accès par rôle
- Configure les permissions granulaires

**Action**:
1. Ouvrez le fichier `supabase/migrations/002_rls_policies.sql`
2. Copiez tout le contenu
3. Collez dans une nouvelle requête SQL
4. Cliquez sur **RUN**
5. Vérifiez la confirmation de succès

---

#### Migration 3: Fonctions et Triggers (003_functions_and_triggers.sql)
**Description**: Ajoute les fonctions PostgreSQL et triggers automatiques
- Triggers pour updated_at
- Fonctions de statistiques
- Notifications automatiques
- Gestion automatique des stocks

**Action**:
1. Ouvrez le fichier `supabase/migrations/003_functions_and_triggers.sql`
2. Copiez tout le contenu
3. Collez dans une nouvelle requête SQL
4. Cliquez sur **RUN**

---

#### Migration 4: Données Initiales (004_initial_data_seeds.sql)
**Description**: Insère les données de test et exemples
- Coopératives d'exemple
- Produits de test
- Utilisateurs de démo
- Commandes et paiements d'exemple

**Action**:
1. Ouvrez le fichier `supabase/migrations/004_initial_data_seeds.sql`
2. Copiez tout le contenu
3. Collez dans une nouvelle requête SQL
4. Cliquez sur **RUN**

---

#### Migration 5: Vues et Index (005_views_and_indexes.sql)
**Description**: Optimise les performances avec vues et index
- Vues pour les rapports
- Index supplémentaires
- Fonctions de recherche

**Action**:
1. Ouvrez le fichier `supabase/migrations/005_views_and_indexes.sql`
2. Copiez tout le contenu
3. Collez dans une nouvelle requête SQL
4. Cliquez sur **RUN**

---

#### Migration 6: Relations Merchant-Cooperative (006_merchant_cooperative_relations.sql)
**Action**: Appliquez cette migration de la même manière

---

#### Migration 7: Utilisateurs de Test (007_test_users_and_relations.sql)
**Action**: Appliquez cette migration de la même manière

---

#### Migration 8: Données de Test Commandes (008_supply_orders_test_data.sql)
**Action**: Appliquez cette migration de la même manière

---

#### Migration 9: Requêtes de Vérification (009_verification_queries.sql)
**Action**: Cette migration contient des requêtes SELECT pour vérifier l'état
- Vous pouvez l'exécuter pour voir l'état actuel de la base de données

---

#### Migration 10: Correction Tables Manquantes (010_fix_missing_tables.sql)
**Action**: Appliquez cette migration

---

#### Migration 11: Correction Fonctions (011_fix_functions.sql)
**Action**: Appliquez cette migration

---

#### Migration 13: Fonctionnalités Producteurs (013_producer_features.sql)
**Action**: Appliquez cette migration

---

#### Migration 14: Ventes, Inventaire, Transactions (20251017083326_014_merchant_sales_inventory_transactions.sql)
**Description**: Tables pour les ventes marchands, inventaire, et Mobile Money
- Table sales (ventes)
- Table inventory (inventaire)
- Table stock_movements (mouvements de stock)
- Table transactions (Mobile Money)
- Table mobile_money_operators

**Action**: Appliquez cette migration

---

#### Migration 15: Données Test Marchands (20251017083658_015_seed_test_data_merchant.sql)
**Action**: Appliquez cette migration

---

#### Migration 16: Système de Formation (20251017084629_016_training_system.sql)
**Description**: Tables pour le système de formation
- training_modules
- training_lessons
- training_progress
- training_certificates

**Action**: Appliquez cette migration

---

#### Migration 17: Données Formation (20251017084710_017_training_seed_data.sql)
**Action**: Appliquez cette migration

---

#### Migration 18: Protection Sociale (20251017093500_018_social_protection_system.sql)
**Description**: Tables pour CNPS, CMU, CNAM
- social_contributions
- contribution_payments

**Action**: Appliquez cette migration

---

#### Migration 19: Amélioration Auth Sociale (20251021000000_019_social_auth_enhancement.sql)
**Description**: Support pour Mobile Money et WhatsApp authentication

**Action**: Appliquez cette migration

---

#### Migration 20: Email Optionnel (020_make_email_optional.sql)
**Description**: Rend l'email optionnel pour supporter Mobile Money

**Action**: Appliquez cette migration

---

## ✅ Étape 3: Vérification de l'Installation

Après avoir appliqué toutes les migrations, vérifiez que tout fonctionne:

### 3.1 Vérifier les Tables

Dans l'éditeur SQL, exécutez:

```sql
-- Lister toutes les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir environ 40+ tables.

### 3.2 Vérifier RLS

```sql
-- Vérifier que RLS est activé
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Toutes les tables devraient avoir `rowsecurity = true`.

### 3.3 Vérifier les Fonctions

```sql
-- Lister les fonctions créées
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### 3.4 Vérifier les Données

```sql
-- Vérifier les opérateurs Mobile Money
SELECT * FROM mobile_money_operators;

-- Vérifier les modules de formation
SELECT * FROM training_modules LIMIT 5;

-- Vérifier les types personnalisés
SELECT typname FROM pg_type WHERE typname LIKE '%_role' OR typname LIKE '%_status';
```

---

## 🔐 Étape 4: Configuration de l'Authentification

### 4.1 Activer les Providers

Dans le dashboard Supabase:
1. Allez à **Authentication** > **Providers**
2. Activez **Email** (activé par défaut)
3. Configurez **Anonymous Sign-ins** si nécessaire pour Mobile Money

### 4.2 Désactiver la Confirmation Email (Optionnel pour développement)

Pour faciliter les tests:
1. Allez à **Authentication** > **Settings**
2. Trouvez **Email Confirmations**
3. Désactivez "Enable email confirmations" (pour dev seulement)

---

## 🧪 Étape 5: Tester la Connexion depuis l'Application

### 5.1 Vérifier les Variables d'Environnement

Assurez-vous que votre fichier `.env` contient:

```env
VITE_SUPABASE_URL=https://qmzubrrxuhgvphhliery.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtenVicnJ4dWhndnBoaGxpZXJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDMzMTQsImV4cCI6MjA3NjIxOTMxNH0.8BsOHVmHC_dVCMvYUm5izMgvUd-YhjR4r9wion6D9nU
```

### 5.2 Démarrer l'Application

```bash
npm run dev
```

### 5.3 Tester l'Inscription

1. Allez sur http://localhost:8080
2. Cliquez sur "S'inscrire"
3. Créez un compte de test
4. Vérifiez que l'utilisateur apparaît dans la table `auth.users` et `public.users`

---

## 🚨 Résolution des Problèmes Courants

### Erreur: "relation does not exist"
**Solution**: Vous avez sauté une migration. Revenez en arrière et appliquez les migrations dans l'ordre.

### Erreur: "permission denied"
**Solution**: RLS est activé mais les politiques ne sont pas créées. Appliquez la migration 002.

### Erreur: "function does not exist"
**Solution**: Les triggers/fonctions ne sont pas créés. Appliquez la migration 003.

### Erreur: "duplicate key value"
**Solution**: Les données sont déjà présentes. Vous pouvez ignorer ou supprimer les données existantes.

### L'application ne se connecte pas
**Solution**:
1. Vérifiez les variables d'environnement
2. Vérifiez que le projet Supabase est actif
3. Vérifiez les politiques RLS

---

## 📊 Surveillance et Maintenance

### Tableau de Bord

Utilisez le dashboard Supabase pour:
- **Table Editor**: Voir et modifier les données
- **SQL Editor**: Exécuter des requêtes personnalisées
- **Auth**: Gérer les utilisateurs
- **Storage**: Gérer les fichiers uploadés
- **Database**: Voir les statistiques et performances

### Sauvegardes

Configurez des sauvegardes automatiques:
1. Allez à **Settings** > **Database**
2. Activez **Point in Time Recovery** (recommandé pour production)

---

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs dans l'éditeur SQL Supabase
2. Consultez la documentation Supabase: https://supabase.com/docs
3. Vérifiez les fichiers de migration pour comprendre les erreurs

---

## ✨ Prochaines Étapes

Une fois la base de données configurée:
1. ✅ Créer un compte administrateur
2. ✅ Tester toutes les fonctionnalités principales
3. ✅ Configurer les intégrations Mobile Money (Orange, MTN, Wave, Moov)
4. ✅ Déployer sur Vercel ou autre plateforme
5. ✅ Configurer le monitoring et les alertes

---

**Date de création**: 21 Octobre 2025
**Version de la plateforme**: 1.0.0
**Statut**: Production Ready
