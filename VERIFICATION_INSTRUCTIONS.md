# Instructions de Vérification des Migrations

## 📋 Aperçu

Ce document explique comment vérifier que toutes les migrations ont été correctement appliquées et que les relations marchands-coopératives fonctionnent comme prévu.

## 🚀 Étapes de Vérification

### 1. Lier votre projet Supabase

Si vous n'avez pas encore lié votre projet à Supabase :

```bash
# Récupérer votre projet ref depuis le dashboard Supabase
# Settings > General > Project Reference

# Lier le projet
supabase link --project-ref votre-projet-ref
```

### 2. Appliquer les migrations

```bash
# Pousser toutes les migrations vers Supabase
supabase db push
```

### 3. Exécuter le script de vérification

1. Allez dans le dashboard Supabase
2. Navigateur vers "SQL Editor"
3. Copiez-collez le contenu du fichier `supabase/verification_script.sql`
4. Exécutez le script

### 4. Vérifier les résultats

Le script de vérification va vous donner :

- **Comptes d'utilisateurs** : Vérifiez que vous avez au moins 20 utilisateurs de test
- **Profils marchands** : Doit correspondre au nombre de marchands créés
- **Coopératives** : Doit montrer les coopératives créées
- **Relations marchands-coopératives** : Doit montrer les relations entre marchands et coopératives
- **Commandes d'approvisionnement** : Doit montrer les commandes de test créées
- **Éléments de commande** : Doit montrer les détails des commandes
- **Paiements** : Doit montrer les paiements de test
- **Livraisons** : Doit montrer les livraisons de test
- **Notifications** : Doit montrer les notifications créées

## 📊 Critères de Succès

### Utilisateurs (20+)
- ✅ 5 marchands
- ✅ 5 coopératives (gestionnaires)
- ✅ 5 producteurs
- ✅ 1 administrateur
- ✅ Autres rôles

### Relations Marchands-Coopératives (5+)
- ✅ Chaque marchand doit avoir au moins une relation avec une coopérative
- ✅ Les types de relations doivent être variés (member, supplier, buyer)
- ✅ Les statuts doivent être actifs

### Commandes d'Approvisionnement (5+)
- ✅ Doit inclure différents statuts (pending, confirmed, preparing, shipped, delivered)
- ✅ Doit inclure des commandes récurrentes
- ✅ Doit inclure différents méthodes de paiement

### Paiements (3+)
- ✅ Doit inclure différents statuts (paid, pending, partially_paid)
- ✅ Doit inclure différentes méthodes (bank_transfer, mobile_money)

### Livraisons (2+)
- ✅ Doit inclure différents statuts (delivered, in_transit)
- ✅ Doit avoir des éléments de livraison associés

## 🔧 Résolution des Problèmes

### Si les utilisateurs ne sont pas créés

Vérifiez que la migration `007_test_users_and_relations.sql` a été exécutée :

```sql
SELECT COUNT(*) FROM public.users WHERE email LIKE '%@example.com';
```

### Si les relations ne sont pas créées

Vérifiez que la migration `007_test_users_and_relations.sql` a bien créé les relations :

```sql
SELECT COUNT(*) FROM public.merchant_cooperative_relations;
```

### Si les commandes ne sont pas créées

Vérifiez que la migration `008_supply_orders_test_data.sql` a été exécutée :

```sql
SELECT COUNT(*) FROM public.supply_orders;
```

### Si les fonctions de vérification ne sont pas disponibles

Vérifiez que la migration `009_verification_queries.sql` a été exécutée :

```sql
SELECT COUNT(*) FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('generate_test_report', 'get_system_summary', 'verify_data_access');
```

## 📱 Test de l'Application

Une fois les migrations vérifiées, vous pouvez tester l'application :

### 1. Démarrer le serveur de développement

```bash
npm run dev
```

### 2. Tester avec les comptes de démo

Utilisez les identifiants suivants pour tester :

#### Marchands
- Email: `marchand1@example.com`
- Mot de passe: `password123`

#### Coopératives
- Email: `gestion1@example.com`
- Mot de passe: `password123`

#### Producteurs
- Email: `producer1@example.com`
- Mot de passe: `password123`

#### Administrateurs
- Email: `admin@example.com`
- Mot de passe: `password123`

### 3. Vérifier les fonctionnalités

- ✅ Connexion avec chaque type de compte
- ✅ Accès aux tableaux de bord spécifiques aux rôles
- ✅ Visualisation des commandes d'approvisionnement
- ✅ Gestion des relations marchands-coopératives
- ✅ Suivi des livraisons

## 🎯 Prochaines Étapes

Une fois la vérification terminée :

1. **Déployer en production** : Configurer les variables d'environnement de production
2. **Tests d'intégration** : Exécuter les tests automatisés
3. **Tests utilisateurs** : Faire tester par des utilisateurs réels
4. **Monitoring** : Mettre en place le monitoring de la base de données

## 📝 Notes

- Toutes les migrations sont idempotentes (peuvent être exécutées plusieurs fois)
- Les données de test sont préfixées par `@example.com` pour faciliter l'identification
- Les UUID sont utilisés pour garantir la cohérence des données
- Les politiques RLS sont configurées pour la sécurité

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans le dashboard Supabase
2. Exécutez le script de vérification pour identifier les problèmes
3. Consultez la documentation des migrations dans `supabase/migrations/README_ORDER.md`