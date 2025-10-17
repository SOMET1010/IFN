# Plan de Test - Intégration Supabase

## 📋 Checklist de Test

### ✅ Phase 1: Configuration et Connexion

- [ ] Variables d'environnement chargées
- [ ] Connexion Supabase établie
- [ ] Tables créées dans la base de données
- [ ] RLS activé sur toutes les tables
- [ ] Build production réussi

### ✅ Phase 2: Authentification

- [ ] Créer un nouveau compte marchand
- [ ] Se connecter avec le compte créé
- [ ] Vérifier que l'utilisateur est bien dans la table `users`
- [ ] Tester la déconnexion
- [ ] Tester la reconnexion

### ✅ Phase 3: Module Ventes

#### Test 1: Création de Vente
**Étapes:**
1. Aller sur `/merchant/sales`
2. Cliquer sur "Nouvelle Vente"
3. Remplir:
   - Client: "Test Client"
   - Produits: "Bananes, Mangues"
   - Montant: "15000"
   - Méthode: "Mobile Money"
4. Sauvegarder

**Résultat attendu:**
- ✅ Vente créée avec succès
- ✅ Vente apparaît dans l'historique
- ✅ Statistiques mises à jour
- ✅ Message de succès affiché

#### Test 2: Filtres et Recherche
**Étapes:**
1. Rechercher "Test Client"
2. Filtrer par statut "Terminées"
3. Vérifier les résultats

**Résultat attendu:**
- ✅ Résultats filtrés correctement
- ✅ Nombre de résultats affiché

#### Test 3: Export CSV
**Étapes:**
1. Cliquer sur "Exporter CSV"
2. Ouvrir le fichier téléchargé

**Résultat attendu:**
- ✅ Fichier CSV téléchargé
- ✅ Données correctes dans le CSV
- ✅ Format conforme

### ✅ Phase 4: Module Inventaire

#### Test 4: Ajout d'Article
**Étapes:**
1. Aller sur `/merchant/inventory`
2. Cliquer sur "Ajouter Stock"
3. Remplir:
   - Produit: "Tomates"
   - Catégorie: "Légumes"
   - Stock actuel: 50
   - Stock maximum: 200
   - Unité: "kg"
   - Prix: 1800
4. Sauvegarder

**Résultat attendu:**
- ✅ Article créé
- ✅ Statut calculé automatiquement (low/ok/critical)
- ✅ Article visible dans la liste

#### Test 5: Modification de Stock
**Étapes:**
1. Modifier l'article créé
2. Changer le stock actuel à 15
3. Sauvegarder

**Résultat attendu:**
- ✅ Stock mis à jour
- ✅ Statut changé à "critical"
- ✅ Mouvement enregistré dans l'historique
- ✅ Alerte affichée

#### Test 6: Suppression d'Article
**Étapes:**
1. Supprimer un article
2. Confirmer la suppression

**Résultat attendu:**
- ✅ Article supprimé
- ✅ Plus visible dans la liste
- ✅ Supprimé de Supabase

### ✅ Phase 5: Transactions Mobile Money

#### Test 7: Initiation de Paiement
**Étapes:**
1. Aller sur `/merchant/payments`
2. Cliquer sur "Nouveau Paiement"
3. Remplir:
   - Opérateur: Orange Money
   - Téléphone: "0748123456"
   - Montant: 10000
4. Confirmer

**Résultat attendu:**
- ✅ Transaction initiée
- ✅ Statut "pending" → "processing" → "success/failed"
- ✅ Code de transaction généré (format: MMO-YYYYMMDD-XXXXX)
- ✅ Transaction visible dans l'historique

#### Test 8: QR Code
**Étapes:**
1. Générer un QR code pour 5000 FCFA
2. Télécharger le QR code

**Résultat attendu:**
- ✅ QR code généré
- ✅ Informations correctes affichées
- ✅ Image téléchargeable

#### Test 9: Filtres Transactions
**Étapes:**
1. Filtrer par opérateur "Orange"
2. Filtrer par statut "success"
3. Chercher par code de transaction

**Résultat attendu:**
- ✅ Filtres appliqués correctement
- ✅ Résultats correspondants

#### Test 10: Export CSV Transactions
**Étapes:**
1. Exporter l'historique en CSV

**Résultat attendu:**
- ✅ CSV téléchargé
- ✅ Toutes les colonnes présentes
- ✅ Données correctes

### ✅ Phase 6: Dashboard et Statistiques

#### Test 11: Statistiques Temps Réel
**Étapes:**
1. Aller sur le dashboard
2. Vérifier les KPIs affichés

**Résultat attendu:**
- ✅ Total des ventes correct
- ✅ Revenus totaux corrects
- ✅ Nombre de commandes correct
- ✅ Alertes stock correctes

#### Test 12: Graphiques
**Étapes:**
1. Consulter les graphiques de ventes
2. Changer la période

**Résultat attendu:**
- ✅ Graphiques affichés
- ✅ Données correctes
- ✅ Mise à jour lors du changement de période

### ✅ Phase 7: Sécurité RLS

#### Test 13: Isolation des Données
**Étapes:**
1. Créer un deuxième compte marchand
2. Se connecter avec le deuxième compte
3. Vérifier que les données du premier compte ne sont PAS visibles

**Résultat attendu:**
- ✅ Aucune donnée du premier marchand visible
- ✅ Inventaire vide pour le nouveau marchand
- ✅ Historique vide pour le nouveau marchand
- ✅ RLS fonctionne correctement

#### Test 14: Requêtes Non Autorisées
**Étapes:**
1. Ouvrir la console du navigateur
2. Tenter de requêter directement Supabase pour un autre utilisateur

**Résultat attendu:**
- ✅ Requête bloquée par RLS
- ✅ Erreur "permission denied"

### ✅ Phase 8: Performance

#### Test 15: Chargement Initial
**Étapes:**
1. Vider le cache du navigateur
2. Recharger l'application
3. Mesurer le temps de chargement

**Résultat attendu:**
- ✅ Chargement < 3 secondes
- ✅ Pas d'erreurs dans la console
- ✅ Toutes les données chargées

#### Test 16: Réactivité
**Étapes:**
1. Créer 10 ventes rapidement
2. Observer la mise à jour des statistiques

**Résultat attendu:**
- ✅ Statistiques mises à jour en temps réel
- ✅ Pas de lag ou freeze
- ✅ Interface réactive

### ✅ Phase 9: Gestion d'Erreurs

#### Test 17: Connexion Perdue
**Étapes:**
1. Désactiver la connexion internet
2. Tenter de créer une vente

**Résultat attendu:**
- ✅ Message d'erreur clair affiché
- ✅ Données non perdues (localStorage)
- ✅ Possibilité de réessayer

#### Test 18: Formulaires Invalides
**Étapes:**
1. Tenter de créer une vente avec des champs vides
2. Tenter de créer une vente avec un montant négatif

**Résultat attendu:**
- ✅ Validation côté client
- ✅ Messages d'erreur clairs
- ✅ Champs en erreur mis en évidence

### ✅ Phase 10: Données de Test

#### Test 19: Seed Data
**Étapes:**
1. Vérifier que les données de test sont présentes
2. Compter les ventes (devrait être >= 25)
3. Compter les articles d'inventaire (devrait être >= 12)
4. Compter les transactions (devrait être >= 30)

**Résultat attendu:**
- ✅ Données de test présentes
- ✅ Quantités correctes
- ✅ Données variées (différents statuts, opérateurs, etc.)

---

## 🔧 Tests SQL Directs

### Vérifier les Tables
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Attendu:** Au moins 27 tables (22 existantes + 5 nouvelles)

### Vérifier RLS
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('sales', 'inventory', 'transactions', 'stock_movements');
```

**Attendu:** rowsecurity = true pour toutes

### Vérifier les Politiques
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('sales', 'inventory', 'transactions')
ORDER BY tablename, policyname;
```

**Attendu:** Au moins 16 politiques

### Compter les Données
```sql
-- Ventes
SELECT COUNT(*) FROM sales;

-- Inventaire
SELECT COUNT(*) FROM inventory;

-- Transactions
SELECT COUNT(*) FROM transactions;

-- Mouvements
SELECT COUNT(*) FROM stock_movements;
```

### Vérifier les Triggers
```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Attendu:** Au moins 4 triggers

---

## 📊 Métriques de Succès

### Fonctionnalité
- ✅ 100% des fonctionnalités ventes opérationnelles
- ✅ 100% des fonctionnalités inventaire opérationnelles
- ✅ 100% des fonctionnalités paiement opérationnelles

### Performance
- ✅ Temps de chargement initial < 3s
- ✅ Temps de réponse API < 500ms
- ✅ Aucun freeze ou lag visible

### Sécurité
- ✅ RLS testé et fonctionnel
- ✅ Isolation des données confirmée
- ✅ Aucune fuite de données inter-utilisateurs

### Stabilité
- ✅ Build sans erreurs
- ✅ Aucune erreur console en utilisation normale
- ✅ Gestion gracieuse des erreurs

---

## 🐛 Bugs Connus

### À Corriger

Aucun bug critique identifié.

### Améliorations Mineures

- [ ] Optimiser la taille des chunks (warning non-bloquant)
- [ ] Ajouter des tests unitaires
- [ ] Améliorer les messages d'erreur

---

## 📝 Notes de Test

### Environnement de Test
- Navigateur: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- Connexion: Wifi/4G
- Compte: merchant.test@inclusionnumerique.ci

### Commandes Utiles

```bash
# Lancer les tests
npm test

# Build production
npm run build

# Lancer l'application
npm run dev

# Vérifier le linting
npm run lint
```

### Logs Supabase

Pour consulter les logs:
1. Dashboard Supabase
2. Onglet "Logs"
3. Filtrer par type:
   - API: Requêtes HTTP
   - Auth: Authentification
   - Database: Opérations SQL

---

## ✅ Validation Finale

### Checklist de Validation

- [ ] Tous les tests passent
- [ ] Build production réussi
- [ ] Aucune erreur console
- [ ] Performance acceptable
- [ ] Sécurité validée
- [ ] Documentation complète
- [ ] Données de test disponibles

### Signature

**Date de test:** _______________

**Testeur:** _______________

**Résultat:** ✅ VALIDÉ / ❌ REJETÉ

**Commentaires:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## 🎉 Félicitations!

Si tous les tests passent, l'intégration Supabase (Priorité 1) est complète et validée!

**Prochaine étape:** Passer à la Priorité 2 (Module de Formation)
