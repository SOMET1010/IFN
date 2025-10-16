# Identifiants de Connexion de Test

## 📱 Comptes de Test Disponibles

Tous les comptes utilisent le même mot de passe : **`password123`**

### 👨‍💼 Marchands

| Email | Nom | Rôle | Localisation |
|-------|-----|------|-------------|
| `marchand1@example.com` | Jean Kouamé | Marchand | Abidjan, Plateau |
| `marchand2@example.com` | Aminata Touré | Marchand | Abidjan, Treichville |
| `marchand3@example.com` | Koffi Yao | Marchand | Yamoussoukro |
| `marchand4@example.com` | Fatima Diallo | Marchand | Bouaké |
| `marchand5@example.com` | Mamadou Koné | Marchand | San-Pédro |

### 🏢 Coopératives

| Email | Nom | Rôle | Localisation |
|-------|-----|------|-------------|
| `gestion1@example.com` | Sophie Bamba | Coopérative | Yamoussoukro |
| `gestion2@example.com` | Michel Dosso | Coopérative | Abidjan |
| `gestion3@example.com` | Estelle Kouadio | Coopérative | Grand-Bassam |

### 🌾 Producteurs

| Email | Nom | Rôle | Localisation |
|-------|-----|------|-------------|
| `producteur1@example.com` | Paul Amani | Producteur | Daloa |
| `producteur2@example.com` | Marie N'guessan | Producteur | Gagnoa |
| `producteur3@example.com` | Isaac Ouattara | Producteur | Korhogo |

### 👤 Administrateur

| Email | Nom | Rôle | Permissions |
|-------|-----|------|-------------|
| `admin@example.com` | Administrateur | Admin | Accès complet à toutes les fonctionnalités |

## 🚀 Étapes de Connexion

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Accéder à l'application**
   - Ouvrez votre navigateur à l'adresse : `http://localhost:8080`

3. **Se connecter**
   - Cliquez sur "Se connecter" ou "Login"
   - Entrez l'email et le mot de passe ci-dessus

## 🎯 Fonctionnalités par Rôle

### Marchands
- **Dashboard** : Vue d'ensemble des ventes et commandes
- **Commandes d'approvisionnement** : Passer des commandes aux coopératives
- **Gestion des relations** : Voir et gérer les relations avec les coopératives
- **Paiements** : Suivre les paiements et les factures
- **Livraisons** : Suivre l'état des livraisons

### Coopératives
- **Dashboard** : Vue d'ensemble des commandes et livraisons
- **Gestion des membres** : Gérer les membres de la coopérative
- **Commandes reçues** : Traiter les commandes des marchands
- **Stock et entrepôt** : Gérer les stocks et les entrepôts
- **Finances** : Suivre les revenus et les subventions

### Producteurs
- **Dashboard** : Vue d'ensemble de la production
- **Gestion de la production** : Suivre les cultures et les récoltes
- **Commandes** : Gérer les commandes reçues
- **Prix** : Définir les prix des produits
- **Interface vocale** : Support vocal pour l'accessibilité

### Administrateur
- **Dashboard système** : Surveillance de la plateforme
- **Gestion des utilisateurs** : Gérer tous les comptes utilisateurs
- **Analytique** : Statistiques et rapports
- **Marketplace** : Gérer la marketplace
- **Sécurité** : Gérer les permissions et l'audit

## 📋 Scénarios de Test

### Scénario 1 : Commande d'Approvisionnement
1. Connectez-vous comme `marchand1@example.com`
2. Allez dans "Commandes d'Approvisionnement"
3. Créez une nouvelle commande
4. Sélectionnez une coopérative (ex: Yamoussoukro)
5. Ajoutez des produits et validez la commande

### Scénario 2 : Traitement des Commandes
1. Connectez-vous comme `gestion1@example.com`
2. Allez dans "Commandes Reçues"
3. Traitez la commande du marchand
4. Mettez à jour le statut de la commande

### Scénario 3 : Suivi des Livraisons
1. Connectez-vous comme `marchand1@example.com`
2. Allez dans "Mes Commandes"
3. Suivez l'état de la livraison
4. Confirmez la réception des produits

### Scénario 4 : Gestion des Stocks
1. Connectez-vous comme `gestion1@example.com`
2. Allez dans "Stock et Entrepôt"
3. Mettez à jour les quantités en stock
4. Configurez les alertes de stock bas

## 🔧 Configuration Supabase

Avant d'utiliser ces identifiants, assurez-vous que :

1. **Les migrations sont appliquées**
   ```bash
   supabase db push
   ```

2. **Les comptes d'authentification sont créés**
   - Exécutez le script `supabase/create_auth_users.sql` dans l'éditeur SQL Supabase

3. **Les relations sont établies**
   - Exécutez le script `supabase/verification_script.sql` pour vérifier

## 🚨 Notes de Sécurité

- Ces identifiants sont **uniquement pour les tests**
- Ne **jamais** utiliser ces identifiants en production
- Changez les mots de passe avant le déploiement en production
- Supprimez les comptes de test après le développement

## 📞 Support

Si vous avez des problèmes de connexion :

1. Vérifiez que l'application est démarrée : `npm run dev`
2. Vérifiez que les migrations sont appliquées
3. Vérifiez que les comptes d'authentification sont créés
4. Consultez les logs dans le dashboard Supabase

## 🔄 Réinitialisation des Mots de Passe

Pour réinitialiser tous les mots de passe à `password123` :

```sql
-- Exécuter dans l'éditeur SQL Supabase
SELECT reset_test_passwords();
```