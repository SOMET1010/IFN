# Guide d'Utilisation - Intégration Supabase

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Compte Supabase configuré
- Variables d'environnement définies dans `.env`

### Lancer l'Application

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Accéder à l'application
# http://localhost:8080
```

---

## 🔑 Authentification

L'application utilise Supabase Auth. Voici comment se connecter:

### Créer un Compte

1. Accéder à la page d'inscription
2. Choisir le rôle "Marchand"
3. Remplir les informations (email, nom, téléphone)
4. Se connecter avec les identifiants

### Utilisateurs de Test

Des données de test sont disponibles pour les marchands existants. Si vous êtes connecté en tant que marchand, vous verrez:
- 25 ventes de test
- 12 articles d'inventaire
- 30 transactions Mobile Money

---

## 💰 Module Ventes

### Créer une Vente

1. Aller sur `/merchant/sales`
2. Cliquer sur "Nouvelle Vente"
3. Remplir:
   - Nom du client
   - Produits vendus
   - Montant
   - Méthode de paiement
4. Cliquer sur "Ajouter la vente"

### Consulter l'Historique

- **Recherche**: Utiliser la barre de recherche pour trouver un client ou produit
- **Filtres**: Filtrer par statut (Terminées, En cours, Annulées)
- **Export**: Télécharger en CSV

### Statistiques Disponibles

- Ventes aujourd'hui
- Nombre de commandes
- Clients actifs
- Croissance mensuelle

---

## 📦 Module Inventaire

### Ajouter un Article

1. Aller sur `/merchant/inventory`
2. Cliquer sur "Ajouter Stock"
3. Remplir:
   - Nom du produit
   - Catégorie
   - Stock actuel / Stock maximum
   - Unité (kg, unité, litre, etc.)
   - Emplacement
   - Date d'expiration (optionnel)
   - Prix
4. Sauvegarder

### Alertes de Stock

Le système calcule automatiquement le statut:
- 🟢 **OK**: Stock > 20% du maximum
- 🟡 **Faible**: Stock entre 10% et 20%
- 🔴 **Critique**: Stock < 10%

Les seuils sont configurables pour chaque article.

### Historique des Mouvements

Chaque modification de stock est enregistrée automatiquement:
- Type de mouvement (entrée, sortie, ajustement)
- Quantité
- Stock avant/après
- Raison du mouvement
- Date et heure

### Modifier le Stock

1. Cliquer sur "Modifier" sur un article
2. Ajuster le stock actuel
3. Sauvegarder
→ Un mouvement sera créé automatiquement

---

## 💳 Paiements Mobile Money

### Opérateurs Supportés

- **Orange Money** (#144#)
- **MTN Mobile Money** (*133#)
- **Wave** (*170#)
- **Moov Money** (#155#)

### Effectuer un Paiement

1. Aller sur `/merchant/payments`
2. Cliquer sur "Nouveau Paiement"
3. Sélectionner l'opérateur
4. Entrer le numéro de téléphone (format: 0XXXXXXXXX)
5. Saisir le montant
6. Confirmer

### Simulation de Paiement

Le système simule le traitement:
1. **Pending** (0-2 secondes): Initiation
2. **Processing** (2-5 secondes): Traitement en cours
3. **Success/Failed**: Résultat (95% de succès)

### QR Code de Paiement

Générer un QR code pour paiement rapide:
1. Saisir le montant
2. Cliquer sur "Générer QR Code"
3. Le QR code s'affiche avec les informations
4. Options:
   - Télécharger l'image
   - Imprimer
   - Partager

### Historique des Transactions

Consultez toutes vos transactions:
- Code unique (MMO-YYYYMMDD-XXXXX)
- Date et heure
- Opérateur utilisé
- Montant
- Statut
- Référence

**Filtres disponibles:**
- Par date
- Par opérateur
- Par statut
- Par montant

**Export CSV:**
Téléchargez l'historique complet au format CSV pour vos comptabilités.

---

## 📊 Dashboard et Statistiques

### Statistiques en Temps Réel

Le dashboard affiche:
- **Total des ventes**: Nombre de transactions complétées
- **Revenus totaux**: Montant total encaissé
- **Commandes en attente**: Nombre de ventes non finalisées
- **Alertes stock**: Articles en stock faible/critique

### Graphiques

- Évolution des ventes par jour/semaine/mois
- Répartition par méthode de paiement
- Top des produits vendus
- Tendances des revenus

### Rapports

Générer des rapports personnalisés:
1. Sélectionner la période (date début - date fin)
2. Cliquer sur "Générer le rapport"
3. Télécharger en PDF ou CSV

---

## 🔐 Sécurité

### Row Level Security (RLS)

Chaque utilisateur ne voit que SES propres données:
- ✅ Ventes isolées par marchand
- ✅ Inventaire privé par marchand
- ✅ Transactions personnelles
- ✅ Pas d'accès inter-utilisateurs

### Authentification

- Toutes les requêtes nécessitent une authentification
- Les tokens sont gérés automatiquement par Supabase
- Session persistante avec auto-refresh

### Données Sensibles

- Jamais de numéros de carte enregistrés
- Numéros de téléphone chiffrés
- Transactions sécurisées via HTTPS

---

## 🛠️ Dépannage

### Erreur: "User not authenticated"

**Solution:**
1. Se reconnecter à l'application
2. Vérifier que vous êtes bien authentifié
3. Vérifier la console du navigateur pour plus de détails

### Les données ne s'affichent pas

**Solutions:**
1. Vérifier la connexion internet
2. Actualiser la page (F5)
3. Vérifier la console pour des erreurs
4. Se déconnecter puis se reconnecter

### Erreur lors de la création de vente/article

**Solutions:**
1. Vérifier que tous les champs requis sont remplis
2. Vérifier les formats (montant = nombre, téléphone = 10 chiffres)
3. Consulter la console du navigateur
4. Réessayer après quelques secondes

### Transaction Mobile Money échouée

**Causes possibles:**
1. Simulation aléatoire (5% d'échecs)
2. Format de numéro incorrect
3. Montant hors limites (min: 100 FCFA, max varie par opérateur)

**Solutions:**
1. Vérifier le format du numéro: 0XXXXXXXXX
2. Vérifier le montant
3. Réessayer

---

## 📱 Formats de Données

### Numéros de Téléphone

Formats acceptés:
- `0XXXXXXXXX` (format local, 10 chiffres)
- `+225XXXXXXXXXX` (format international)
- `225XXXXXXXXXX` (sans le +)

Le système nettoie automatiquement le numéro.

### Montants

- Format: Nombre décimal
- Devise: FCFA (Franc CFA)
- Minimum: 100 FCFA
- Maximum: Varie selon l'opérateur

### Dates

- Format: YYYY-MM-DD (ISO 8601)
- Timezone: UTC
- Les dates sont automatiquement converties en heure locale

---

## 🔄 Synchronisation des Données

### Mode En Ligne

- Données chargées depuis Supabase
- Mises à jour en temps réel
- Sauvegarde immédiate

### Mode Hors-Ligne (À venir dans Priorité 4)

- Cache local avec IndexedDB
- Synchronisation différée
- Indicateur de statut

---

## 📞 Support Technique

### Logs et Débogage

Pour obtenir plus d'informations:
1. Ouvrir la console du navigateur (F12)
2. Onglet "Console" pour les messages
3. Onglet "Network" pour les requêtes
4. Onglet "Application" > Storage pour les données locales

### Supabase Dashboard

Accéder au dashboard Supabase:
1. https://supabase.com
2. Se connecter avec votre compte
3. Sélectionner votre projet
4. Consulter:
   - Table Editor (données)
   - Auth (utilisateurs)
   - Logs (historique)
   - API Docs (documentation)

### Vider le Cache

Si vous rencontrez des problèmes:
1. Ouvrir la console (F12)
2. Onglet "Application"
3. Cliquer sur "Clear storage"
4. Actualiser la page

---

## 🎓 Bonnes Pratiques

### Gestion des Ventes

- ✅ Toujours remplir le nom du client
- ✅ Décrire précisément les produits
- ✅ Vérifier le montant avant validation
- ✅ Choisir la bonne méthode de paiement
- ✅ Ajouter des notes si nécessaire

### Gestion de l'Inventaire

- ✅ Mettre à jour régulièrement les stocks
- ✅ Définir des dates d'expiration pour les produits périssables
- ✅ Configurer des seuils d'alerte adaptés
- ✅ Organiser par emplacements clairs
- ✅ Faire un inventaire physique mensuel

### Transactions

- ✅ Vérifier le numéro de téléphone avant paiement
- ✅ Confirmer le montant avec le client
- ✅ Conserver les codes de transaction
- ✅ Exporter régulièrement l'historique
- ✅ Rapprocher avec les relevés bancaires

---

## 📈 Prochaines Fonctionnalités

### En Développement

- 🔄 Module de Formation E-Learning
- 🔄 Mode Hors-Ligne complet (PWA)
- 🔄 Intégration réelle API Mobile Money
- 🔄 Protection Sociale (CNPS/CNAM)
- 🔄 Commandes Marketplace
- 🔄 Notifications Push

### Améliorations Prévues

- Export PDF des rapports
- Graphiques avancés
- Multi-devises
- API REST pour intégrations tierces
- Application mobile native

---

## 💡 Astuces

### Raccourcis Clavier

- `Ctrl + S`: Sauvegarder un formulaire
- `Échap`: Fermer une modal
- `Ctrl + F`: Rechercher

### Navigation Rapide

Utilisez les onglets pour naviguer rapidement entre:
- Historique des ventes
- Workflow de vente
- Inventaire
- Scanner codes-barres
- Paiements

### Performance

Pour une meilleure performance:
- Fermer les onglets inutilisés
- Vider le cache navigateur régulièrement
- Utiliser une connexion stable
- Limiter les filtres de recherche complexes

---

## 🎯 Conclusion

Vous êtes maintenant prêt à utiliser l'application avec Supabase!

Pour toute question ou problème:
1. Consulter ce guide
2. Vérifier la console du navigateur
3. Consulter le rapport d'intégration (INTEGRATION_SUPABASE_RAPPORT.md)
4. Contacter le support technique

**Bonne utilisation! 🚀**
