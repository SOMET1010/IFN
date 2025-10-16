# Migrations Supabase - Plateforme d'Inclusion Numérique

Ce dossier contient les migrations SQL pour configurer la base de données Supabase pour la plateforme d'inclusion numérique.

## Structure des Migrations

### 📁 Fichiers de Migration

1. **001_initial_schema.sql** - Schéma de base
   - Tables principales (users, products, orders, etc.)
   - Types personnalisés
   - Indexes de base
   - Fonctions utilitaires

2. **002_rls_policies.sql** - Politiques de sécurité
   - Row Level Security (RLS)
   - Politiques d'accès par rôle
   - Permissions granulaires

3. **003_functions_and_triggers.sql** - Fonctions avancées
   - Triggers automatiques
   - Fonctions de statistiques
   - Notifications automatiques
   - Gestion des stocks

4. **004_initial_data_seeds.sql** - Données initiales
   - Exemples de coopératives
   - Produits et offres
   - Utilisateurs de test
   - Commandes et paiements

5. **005_views_and_indexes.sql** - Optimisation
   - Vues pour les rapports
   - Index supplémentaires
   - Fonctions de recherche
   - Recommandations

## 🚀 Installation

### Prérequis

- Compte Supabase actif
- CLI Supabase installée
- Projet Supabase initialisé

### Étapes d'installation

1. **Initialiser le projet Supabase**
   ```bash
   supabase init
   ```

2. **Lier le projet**
   ```bash
   supabase link --project-ref VOTRE_PROJECT_REF
   ```

3. **Appliquer les migrations**
   ```bash
   # Appliquer dans l'ordre
   supabase db push
   ```

4. **Vérifier l'installation**
   ```bash
   supabase status
   ```

## 📊 Schéma de la Base de Données

### Tables Principales

#### 🏢 Users & Profiles
- `users` - Utilisateurs (lié à auth.users)
- `merchant_profiles` - Profils des marchands
- `producer_profiles` - Profils des producteurs
- `cooperatives` - Coopératives
- `cooperative_members` - Membres des coopératives

#### 🛍️ Marketplace
- `products` - Produits
- `producer_offers` - Offres des producteurs
- `orders` - Commandes
- `order_items` - Éléments de commande
- `carts` - Paniers
- `cart_items` - Éléments du panier

#### 💳 Paiements & Transactions
- `payments` - Paiements
- `reviews` - Avis et révisions

#### 📋 Enrôlement & Administration
- `merchant_enrollments` - Enrôlements des marchands
- `enrollment_documents` - Documents d'enrôlement
- `notifications` - Notifications

### Types Personnalisés

#### Rôles Utilisateurs
- `merchant` - Marchand
- `producer` - Producteur
- `cooperative` - Coopérative
- `admin` - Administrateur

#### Catégories de Produits
- `fruits` - Fruits
- `legumes` - Légumes
- `volaille` - Volaille
- `poissons` - Poissons
- `cereales` - Céréales

#### Statuts
- Commande: pending, confirmed, preparing, shipped, delivered, cancelled
- Paiement: pending, paid, failed, refunded
- Utilisateur: active, inactive, pending, suspended

## 🔒 Sécurité

### Row Level Security (RLS)

Le schéma utilise RLS pour garantir la sécurité des données :

- **Utilisateurs** ne peuvent voir que leurs propres données
- **Marchands** gèrent leurs produits et commandes
- **Producteurs** contrôlent leurs offres et récoltes
- **Administrateurs** ont accès complet pour la gestion

### Politiques d'Accès

- Chaque table a des politiques RLS spécifiques
- Accès basé sur les rôles et l'appartenance
- Protection contre les accès non autorisés

## ⚡ Performance

### Indexes Optimisés

- Index composites pour les requêtes fréquentes
- Index de recherche textuelle
- Index géographiques pour la localisation
- Index temporels pour les analyses

### Vues Matérialisées

- Statistiques de ventes mensuelles
- Produits populaires
- Performances des vendeurs
- Alertes d'inventaire

## 🔄 Fonctions Automatiques

### Triggers

1. **Mise à jour des timestamps** - `updated_at` automatique
2. **Génération des numéros de commande** - Format standardisé
3. **Mise à jour des notations** - Calcul automatique des moyennes
4. **Gestion des stocks** - Mise à jour après commandes
5. **Notifications** - Envoi automatique d'alertes
6. **Création de profils** - Après approbation d'enrôlement

### Fonctions Utilitaires

- `get_dashboard_stats()` - Statistiques par rôle
- `update_product_stock_after_order()` - Gestion des stocks
- `send_order_notification()` - Notifications de commande
- `check_low_stock()` - Alertes de stock faible
- `search_products()` - Recherche全文
- `get_market_trends()` - Tendances du marché
- `get_product_recommendations()` - Recommandations personnalisées

## 📈 Vues d'Analyse

### Vues Disponibles

- `monthly_sales_stats` - Statistiques mensuelles
- `popular_products` - Produits populaires
- `seller_performance` - Performance des vendeurs
- `inventory_alerts` - Alertes d'inventaire
- `recent_activities` - Activités récentes
- `pending_payments` - Paiements en attente

## 🧪 Données de Test

### Utilisateurs de Démo

- **Admin**: `admin@inclusionnumerique.ci`
- **Marchand**: `merchant@example.com`
- **Producteur**: `producer@example.com`
- **Coopérative**: `cooperative@example.com`

### Produits Exemples

- 15 produits couvrant toutes les catégories
- Prix en FCFA (Franc CFA)
- Stocks et seuils d'alerte configurés
- Images et tags pour la recherche

## 🔧 Maintenance

### Tâches Planifiées

```sql
-- Nettoyage des anciennes notifications
SELECT archive_old_notifications();

-- Vérification des stocks faibles
SELECT check_low_stock();

-- Validation et nettoyage des données
SELECT validate_and_clean_data();
```

### Sauvegardes

- Configuration des sauvegardes automatiques via l'interface Supabase
- Période recommandée : quotidienne
- Rétention : 30 jours minimum

## 📝 Notes

- Toutes les tables utilisent des UUID comme clés primaires
- Les timestamps sont en UTC
- Les montants sont stockés en FCFA (Franc CFA)
- La recherche est optimisée pour le français
- Les coordonnées géographiques utilisent le type POINT

## 🚨 Sécurité Supplémentaire

- Tous les mots de passe sont gérés par Supabase Auth
- Les tokens JWT sont utilisés pour l'authentification
- Les données sensibles sont chiffrées au repos
- Les accès sont journalisés pour l'audit

---

**Note**: Ces migrations sont conçues pour un déploiement sur Supabase. Assurez-vous de tester dans un environnement de développement avant de déployer en production.