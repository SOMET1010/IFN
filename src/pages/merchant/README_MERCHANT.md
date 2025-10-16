# Module Marchand - Plateforme d'Inclusion Numérique

## 📋 Vue d'Ensemble

Le module marchand est conçu pour les **vivriers marchands** (détaillants et semi-grossistes) du secteur informel ivoirien. Il offre une suite complète d'outils digitaux pour moderniser leurs activités commerciales.

## 🎯 Objectifs Principaux

- **Digitaliser les transactions** avec facturation électronique
- **Optimiser la gestion des stocks** avec alertes intelligentes
- **Faciliter l'accès aux services sociaux** (CNPS, CNAM)
- **Améliorer la productivité** grâce à des outils adaptés

## 🏗️ Architecture Technique

### Structure des Composants

```
src/components/merchant/
├── MerchantHeader.tsx              # En-tête spécifique aux marchands
├── BarcodeScanner.tsx              # Scanner de codes-barres pour inventaire
├── ClientPurchaseHistory.tsx       # Historique des achats clients
├── DigitalReceiptManager.tsx       # Gestionnaire de reçus numériques
├── InventoryForm.tsx               # Formulaire de gestion des stocks
├── MultiChannelPayment.tsx         # Paiements multi-canaux (mobile money)
├── OrderStatusModal.tsx            # Modal de suivi des commandes
├── ProductRecommendations.tsx      # Système de recommandations
├── PromotionManager.tsx            # Gestionnaire de promotions
├── QuickClientRegister.tsx         # Enregistrement rapide des clients
├── StatsCard.tsx                   # Cartes de statistiques
└── VoiceNavigator.tsx              # Navigation vocale
```

### Pages Disponibles

```
src/pages/merchant/
├── MerchantDashboard.tsx           # Tableau de bord principal
├── MerchantSales.tsx               # Gestion des ventes
├── MerchantInventory.tsx           # Gestion des stocks
├── MerchantOrders.tsx              # Commandes fournisseurs
├── MerchantPayments.tsx            # Paiements et facturation
├── MerchantReceiving.tsx           # Réception et contrôle qualité
├── MerchantSocial.tsx              # Inclusion financière et sociale
├── MerchantSourcing.tsx            # Approvisionnement
├── MerchantCredits.tsx             # Crédits clients
└── MerchantSalesWorkflow.tsx       # Workflow de vente complet
```

## 🔧 Fonctionnalités Clés

### Gestion Commerciale
- **Enregistrement des transactions** en temps réel
- **Facturation numérique** avec reçus électroniques
- **Gestion des stocks** avec alertes de rupture
- **Historique des ventes** avec analyses

### Paiements et Finance
- **Paiements mobiles** (Orange Money, MTN, Moov, Wave)
- **Crédits clients** avec suivi des échéances
- **Facturation automatisée** et rapports financiers

### Interface Utilisateur
- **Navigation vocale** pour utilisateurs peu alphabétisés
- **Interface responsive** optimisée mobile
- **Scanner de codes-barres** intégré
- **Tableaux de bord** personnalisables

### Intégrations Sociales
- **Cotisations CNPS/CNAM** simplifiées
- **Accès aux services sociaux** intégré
- **Protection sociale** automatisée

## 🚀 Points Forts Techniques

### Performance
- **Chargement optimisé** avec React 18 et Vite
- **Mode hors ligne** avec sauvegarde locale
- **Animations fluides** avec Framer Motion

### Sécurité
- **Authentification robuste** avec gestion de session
- **Validation des données** avec TypeScript
- **Chiffrement** des données sensibles

### Accessibilité
- **Interface vocale** multilingue
- **Design adaptatif** pour tous appareils
- **Navigation au clavier** complète

## 📊 Métriques et Analytics

Le module inclut des tableaux de bord avec :
- **Chiffre d'affaires** journalier/mensuel
- **Rotation des stocks** et taux de rupture
- **Performance commerciale** par produit
- **Taux d'adoption** des services sociaux

## 🔄 Workflows Principaux

### Processus de Vente
1. Scanner produit → 2. Calcul automatique → 3. Paiement mobile → 4. Reçu numérique

### Gestion des Stocks
1. Alerte rupture → 2. Commande automatique → 3. Réception → 4. Mise à jour stock

### Inclusion Sociale
1. Calcul cotisations → 2. Paiement intégré → 3. Suivi prestations

## 🛠️ Développement

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
npm install
npm run dev
```

### Tests
```bash
npm test
```

## 📈 Évolutions Futures

- **Intégration IA** pour prévisions de vente
- **Marketplace intégré** pour approvisionnement
- **Analytics avancés** avec machine learning
- **API gouvernementales** (CNPS, CNAM)

---

*Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}*