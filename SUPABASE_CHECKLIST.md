# 📋 Checklist de Configuration Supabase

Suivez cette checklist étape par étape pour configurer votre base de données Supabase.

---

## ✅ Phase 1: Préparation (5 minutes)

### Étape 1.1: Accès au Dashboard
- [ ] Ouvrir https://supabase.com/dashboard
- [ ] Se connecter à votre compte Supabase
- [ ] Sélectionner le projet: `qmzubrrxuhgvphhliery`
- [ ] Vérifier que le projet est actif (voyant vert)

### Étape 1.2: Vérifier l'État Actuel
- [ ] Aller dans **SQL Editor** (menu gauche)
- [ ] Créer une nouvelle requête (bouton **New Query**)
- [ ] Copier le contenu de `supabase/QUICK_START_VERIFICATION.sql`
- [ ] Coller dans l'éditeur et cliquer **RUN**
- [ ] Noter le nombre de tables existantes: _______
- [ ] Noter si RLS est activé: Oui ☐ / Non ☐

### Étape 1.3: Sauvegarder (si des données existent)
- [ ] Si total_tables > 0, faire une sauvegarde:
  - Aller dans **Database** > **Backups**
  - Cliquer sur **Create backup**
  - Attendre la confirmation

---

## ✅ Phase 2: Migrations de Base (15 minutes)

### Étape 2.1: Migration 001 - Schéma Initial
- [ ] Ouvrir `supabase/migrations/001_initial_schema.sql`
- [ ] Copier **TOUT** le contenu du fichier
- [ ] Dans SQL Editor, créer une **New Query**
- [ ] Coller le contenu
- [ ] Cliquer **RUN** (en bas à droite)
- [ ] Vérifier qu'il n'y a **PAS D'ERREURS** (texte rouge)
- [ ] Si succès, vous devriez voir: ✅ "Success. No rows returned"

**Vérification:**
```sql
-- Coller et exécuter ceci pour vérifier
SELECT COUNT(*) as tables_created
FROM information_schema.tables
WHERE table_schema = 'public';
-- Devrait retourner un nombre > 20
```

### Étape 2.2: Migration 002 - RLS Policies
- [ ] Ouvrir `supabase/migrations/002_rls_policies.sql`
- [ ] Copier tout le contenu
- [ ] Nouvelle requête SQL
- [ ] Coller et **RUN**
- [ ] Vérifier succès

**Vérification:**
```sql
-- Vérifier que RLS est activé
SELECT COUNT(*) as rls_enabled_tables
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;
-- Devrait retourner un nombre > 20
```

### Étape 2.3: Migration 003 - Functions & Triggers
- [ ] Ouvrir `supabase/migrations/003_functions_and_triggers.sql`
- [ ] Copier tout
- [ ] Nouvelle requête
- [ ] Coller et **RUN**
- [ ] Vérifier succès

### Étape 2.4: Migration 004 - Initial Data
- [ ] Ouvrir `supabase/migrations/004_initial_data_seeds.sql`
- [ ] Copier tout
- [ ] Nouvelle requête
- [ ] Coller et **RUN**
- [ ] Vérifier succès

### Étape 2.5: Migration 005 - Views & Indexes
- [ ] Ouvrir `supabase/migrations/005_views_and_indexes.sql`
- [ ] Copier tout
- [ ] Nouvelle requête
- [ ] Coller et **RUN**
- [ ] Vérifier succès

---

## ✅ Phase 3: Migrations Additionnelles (10 minutes)

### Appliquer chaque migration dans l'ordre:

- [ ] **006** - `006_merchant_cooperative_relations.sql`
- [ ] **007** - `007_test_users_and_relations.sql`
- [ ] **008** - `008_supply_orders_test_data.sql`
- [ ] **009** - `009_verification_queries.sql` (optionnel, pour vérification)
- [ ] **010** - `010_fix_missing_tables.sql`
- [ ] **011** - `011_fix_functions.sql`
- [ ] **013** - `013_producer_features.sql`
- [ ] **014** - `20251017083326_014_merchant_sales_inventory_transactions.sql`
- [ ] **015** - `20251017083658_015_seed_test_data_merchant.sql`
- [ ] **016** - `20251017084629_016_training_system.sql`
- [ ] **017** - `20251017084710_017_training_seed_data.sql`
- [ ] **018** - `20251017093500_018_social_protection_system.sql`
- [ ] **019** - `20251021000000_019_social_auth_enhancement.sql`
- [ ] **020** - `020_make_email_optional.sql`

**Pour chaque migration:**
1. Ouvrir le fichier
2. Copier tout le contenu
3. Nouvelle requête SQL
4. Coller et RUN
5. Vérifier succès (pas d'erreurs rouges)
6. Cocher la case ci-dessus

---

## ✅ Phase 4: Vérification Finale (5 minutes)

### Étape 4.1: Vérification Complète
- [ ] Exécuter à nouveau `QUICK_START_VERIFICATION.sql`
- [ ] Vérifier les résultats:
  - [ ] Total tables >= 40
  - [ ] Total custom types >= 10
  - [ ] Tables with RLS >= 40
  - [ ] Total functions >= 10

### Étape 4.2: Test de Connexion
- [ ] Aller dans **Table Editor** (menu gauche)
- [ ] Vérifier que vous voyez les tables:
  - [ ] users
  - [ ] cooperatives
  - [ ] products
  - [ ] orders
  - [ ] sales
  - [ ] inventory
  - [ ] transactions

### Étape 4.3: Test d'Insertion
```sql
-- Tester l'insertion de données (ne pas exécuter si vous avez déjà des données)
-- Ceci est juste un test, vous pouvez supprimer après

-- Test 1: Insérer un opérateur Mobile Money
INSERT INTO mobile_money_operators (name, code, logo_url, is_active)
VALUES ('Orange Money', 'ORANGE', 'https://example.com/orange.png', true)
ON CONFLICT (code) DO NOTHING;

-- Vérifier
SELECT * FROM mobile_money_operators;
```

- [ ] L'insertion fonctionne sans erreur
- [ ] Les données sont visibles dans Table Editor

---

## ✅ Phase 5: Configuration Auth (5 minutes)

### Étape 5.1: Configurer les Providers
- [ ] Aller dans **Authentication** (menu gauche)
- [ ] Cliquer sur **Providers**
- [ ] Vérifier que **Email** est activé (devrait être par défaut)
- [ ] **Pour développement seulement**: Désactiver la confirmation d'email
  - Aller dans **Authentication** > **Settings**
  - Trouver "Enable email confirmations"
  - Décocher (pour faciliter les tests)

### Étape 5.2: Configurer Anonymous Auth (optionnel)
Si vous voulez supporter Mobile Money sans email:
- [ ] Dans **Providers**, activer **Anonymous Sign-in**
- [ ] Sauvegarder les changements

---

## ✅ Phase 6: Test de l'Application (10 minutes)

### Étape 6.1: Vérifier les Variables d'Environnement
- [ ] Ouvrir le fichier `.env` à la racine du projet
- [ ] Vérifier que ces lignes existent:
```env
VITE_SUPABASE_URL=https://qmzubrrxuhgvphhliery.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- [ ] Les valeurs correspondent à votre projet

### Étape 6.2: Démarrer l'Application
Dans votre terminal:
```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Démarrer le serveur de développement
npm run dev
```

- [ ] Le serveur démarre sans erreur
- [ ] Ouvrir http://localhost:8080
- [ ] La page d'accueil se charge

### Étape 6.3: Test d'Inscription
- [ ] Cliquer sur "S'inscrire" ou "Sign up"
- [ ] Remplir le formulaire:
  - Email: `test@example.com`
  - Mot de passe: `Test123456!`
  - Nom: `Test User`
  - Rôle: Choisir un rôle
- [ ] Soumettre le formulaire
- [ ] L'inscription réussit (pas d'erreur)

### Étape 6.4: Vérifier l'Utilisateur dans Supabase
- [ ] Retourner dans le dashboard Supabase
- [ ] Aller dans **Authentication** > **Users**
- [ ] Voir le nouvel utilisateur créé
- [ ] Aller dans **Table Editor** > **users**
- [ ] Voir l'utilisateur dans la table `users`

### Étape 6.5: Test de Connexion
- [ ] Se déconnecter de l'application
- [ ] Cliquer sur "Se connecter" ou "Login"
- [ ] Utiliser les identifiants de test
- [ ] La connexion réussit
- [ ] Vous êtes redirigé vers le dashboard

---

## ✅ Phase 7: Tests Avancés (optionnel)

### Test des Fonctionnalités Marchands
Si vous avez créé un compte marchand:
- [ ] Accéder au dashboard marchand
- [ ] Créer une vente de test
- [ ] Vérifier que la vente apparaît dans les statistiques
- [ ] Ajouter un article à l'inventaire
- [ ] Vérifier les alertes de stock

### Test des Opérateurs Mobile Money
```sql
-- Dans SQL Editor
SELECT * FROM mobile_money_operators;
-- Devrait montrer 4 opérateurs: Orange, MTN, Wave, Moov
```
- [ ] Les 4 opérateurs sont présents
- [ ] Chaque opérateur a des limites configurées

### Test du Système de Formation
```sql
-- Dans SQL Editor
SELECT COUNT(*) FROM training_modules;
-- Devrait retourner au moins 3 modules
```
- [ ] Les modules de formation sont présents

---

## 🎉 Félicitations!

Si toutes les cases sont cochées, votre base de données Supabase est **entièrement configurée** et **prête pour la production**!

### Prochaines Étapes

1. **Créer un compte administrateur**
   ```sql
   -- Dans SQL Editor, créer un admin
   -- (Remplacer avec votre vrai email)
   UPDATE users SET role = 'admin' WHERE email = 'votre-email@example.com';
   ```

2. **Configurer les intégrations Mobile Money**
   - Obtenir les clés API Orange Money, MTN, Wave, Moov
   - Les ajouter dans les variables d'environnement

3. **Déployer sur Vercel**
   - Push sur GitHub
   - Connecter à Vercel
   - Configurer les variables d'environnement
   - Déployer!

4. **Monitoring et Maintenance**
   - Activer les sauvegardes automatiques
   - Configurer les alertes
   - Monitorer les performances

---

## 🚨 Résolution de Problèmes

### Erreur: "relation does not exist"
→ Une migration a été sautée. Revérifiez l'ordre dans `README_ORDER.md`

### Erreur: "permission denied"
→ RLS est activé mais pas de politiques. Exécutez migration 002

### Erreur: "duplicate key value"
→ Les données existent déjà. Vous pouvez ignorer ou supprimer les duplicatas

### L'application ne se connecte pas
1. Vérifiez les variables d'environnement
2. Vérifiez que le projet Supabase est actif
3. Vérifiez les politiques RLS

### Le build échoue
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

**Date**: 21 Octobre 2025
**Version**: 1.0.0
**Statut**: Production Ready ✅
