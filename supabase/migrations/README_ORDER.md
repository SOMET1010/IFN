# Ordre d'Exécution des Migrations

Les migrations doivent être exécutées dans cet ordre spécifique pour garantir la cohérence des données :

## 📋 Ordre d'Exécution

### 1. `001_initial_schema.sql`
**Pourquoi en premier ?**
- Crée les tables de base
- Définit les types personnalisés
- Met en place la structure fondamentale
- Prérequis pour toutes les autres migrations

### 2. `002_rls_policies.sql`
**Pourquoi en deuxième ?**
- Dépend des tables créées dans `001`
- Configure la sécurité avant d'insérer des données
- Protège les données dès le début

### 3. `003_functions_and_triggers.sql`
**Pourquoi en troisième ?**
- Dépend des tables et types de `001`
- Utilise les politiques RLS de `002`
- Doit être en place avant les données

### 4. `004_initial_data_seeds.sql`
**Pourquoi en quatrième ?**
- Nécessite toutes les tables existantes
- Les triggers et fonctions doivent être actifs
- Les politiques RLS doivent configurer l'accès

### 5. `005_views_and_indexes.sql`
**Pourquoi en dernier ?**
- Dépend de toutes les tables et données
- Les indexes sont optimisés pour les données existantes
- Les vues nécessitent des données à analyser

## ⚠️ Risques si l'ordre n'est pas respecté

### Exécution de `002` avant `001`
- Erreurs de tables inexistantes
- Échec de la création des politiques RLS

### Exécution de `003` avant `001`
- Erreurs de référence à des tables inexistantes
- Échec des fonctions qui dépendent des tables

### Exécution de `004` avant `003`
- Données insérées sans validation automatique
- Triggers non actifs pour la mise à jour des statistiques
- Incohérence dans les données calculées

### Exécution de `005` avant `004`
- Vues vides ou incorrectes
- Index sur des tables vides
- Performances sous-optimales

## 🔧 Vérification après chaque migration

### Après `001_initial_schema.sql`
```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Vérifier les types
SELECT t.typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public';
```

### Après `002_rls_policies.sql`
```sql
-- Vérifier les politiques RLS
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public';
```

### Après `003_functions_and_triggers.sql`
```sql
-- Vérifier les fonctions
SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_schema = 'public';

-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public';
```

### Après `004_initial_data_seeds.sql`
```sql
-- Vérifier les données
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
```

### Après `005_views_and_indexes.sql`
```sql
-- Vérifier les vues
SELECT viewname, viewowner FROM pg_views WHERE schemaname = 'public';

-- Vérifier les index
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```

## 🚨 Commandes d'Annulation

Si une migration échoue, vous pouvez l'annuler avec :

```bash
# Annuler la dernière migration
supabase db reset

# Ou annuler spécifiquement
supabase db push --dry-run  # Pour vérifier d'abord
```

## 📝 Notes importantes

- Toutes les migrations sont conçues pour être idempotentes
- Les UUID sont utilisés comme clés primaires pour la cohérence
- Les timestamps sont en UTC
- Les noms de tables et colonnes sont en snake_case
- Les contraintes de clé étrangère sont explicites

## 🔍 Dépannage

### Erreurs courantes
1. **Tables inexistantes**: Vérifiez l'ordre des migrations
2. **Types inconnus**: Assurez-vous que `001` a été exécuté
3. **Permission refusée**: Vérifiez les politiques RLS dans `002`
4. **Fonctions manquantes**: Exécutez `003` avant les données

### Solutions
1. Utilisez `supabase db push --dry-run` pour prévisualiser
2. Vérifiez les logs dans le dashboard Supabase
3. Testez dans un environnement de développement d'abord
4. Sauvegardez votre base de données avant les migrations