# Plateforme d'Inclusion Numérique - Côte d'Ivoire

Une plateforme numérique complète pour l'inclusion économique en Côte d'Ivoire, conçue pour moderniser le commerce informel à travers une application multi-tenant.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm (recommandé, éviter de mixer avec Bun)
- Navigateur moderne pour le développement

### Installation
```bash
# Cloner le dépôt
git clone <repository-url>
cd inclusionnumerique-local

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:8080`

## 📱 Aperçu du Projet

### Objectif
Créer une plateforme qui connecte les acteurs du secteur informel en Côte d'Ivoire :
- **Producteurs** : Agriculteurs et artisans locaux
- **Commerçants** : Vendeurs au détail et en gros
- **Coopératives** : Groupements de producteurs
- **Administrateurs** : Gestionnaires de la plateforme

### Fonctionnalités Clés
- Marketplace public pour les transactions
- Tableaux de bord personnalisés par rôle
- Gestion d'inventaire et commandes
- Analytics et reporting
- Interface mobile optimisée
- Système de notifications temps réel
- Support d'interface vocale

## 🏗️ Architecture

### Stack Technique

#### Frontend
- **Frontend** : React 18.3.1 + TypeScript + Vite
- **Routing** : React Router DOM v6.30.1
- **State Management** : React Context + TanStack Query v5.83.0
- **UI** : Tailwind CSS + shadcn/ui + Radix UI primitives
- **Forms** : React Hook Form + Zod validation
- **Charts** : Recharts v2.15.4
- **Testing** : Vitest + React Testing Library + jsdom

#### Backend & Base de Données
- **Base de Données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth avec JWT
- **API** : Supabase REST API + Edge Functions
- **Stockage** : Supabase Storage pour les fichiers
- **Real-time** : Supabase Realtime pour les websockets
- **Sécurité** : Row Level Security (RLS) + Politiques d'accès
- **Hosting** : Supabase Platform (déploiement ready)

#### Services Externes (à intégrer)
- **Mobile Money** : Orange Money, MTN Mobile Money, Moov, Wave
- **Paiements** : Stripe, PayPal (pour transactions internationales)
- **Notifications** : Email (Resend), SMS (Twilio), Push Notifications
- **Analytics** : Google Analytics, Mixpanel
- **Monitoring** : Sentry, Datadog

### Structure du Projet
```
src/
├── components/
│   ├── ui/           # Composants shadcn/ui (70+ composants)
│   └── auth/         # Composants d'authentification
├── pages/
│   ├── admin/        # Dashboard admin et gestion
│   ├── merchant/     # Dashboard commerçant et ventes
│   ├── producer/     # Gestion producteurs
│   ├── cooperative/  # Gestion coopératives
│   ├── marketplace/  # Interface marketplace
│   ├── disputes/     # Résolution des litiges
│   ├── reviews/      # Système d'avis
│   ├── auth/         # Pages d'authentification
│   └── user/         # Préférences utilisateur
├── contexts/         # Contextes React (Auth, Cart, Order, Review, etc.)
├── services/
│   ├── supabase/     # Services Supabase (auth, client, database)
│   ├── merchant/     # Services métier commerçants
│   ├── producer/     # Services métier producteurs
│   ├── cooperative/  # Services métier coopératives
│   ├── admin/        # Services administratifs
│   └── security/     # Services de sécurité
├── hooks/            # Hooks React personnalisés
├── lib/              # Utilitaires et helpers
└── types/            # Définitions de types TypeScript
```

## 🛠️ Scripts Disponibles

### Développement
```bash
npm run dev          # Serveur de développement Vite (localhost:8080)
npm run build        # Build production dans dist/
npm run build:dev    # Build développement (utile pour QA)
npm run preview      # Servir l'application buildée localement
npm run lint         # Exécuter les vérifications ESLint
```

### Tests
```bash
npm test             # Exécuter les tests en mode watch
npm run test:run     # Exécuter les tests une seule fois
npm run test:ui      # Exécuter les tests avec interface UI
npm run test:coverage # Exécuter les tests avec rapport de couverture
```

## 🔐 Authentification et Rôles

### Authentification Supabase
- **JWT Tokens** avec expiration et rafraîchissement automatique
- **Sessions persistantes** avec stockage sécurisé
- **Vérification d'email** obligatoire après inscription
- **Gestion des profils** multi-rôles avec états d'achèvement
- **Mobile Money** intégration pour les connexions alternatives
- **Sécurité avancée** avec protection CSRF et validation robuste

### Rôles Utilisateurs
- **Producteur** : Gestion des produits, récoltes, commandes
- **Commerçant** : Ventes, inventaire, analytics
- **Coopérative** : Gestion des membres, commandes groupées
- **Administrateur** : Surveillance système, gestion utilisateurs

### Routes Protégées
Les routes utilisent le composant `ProtectedRoute` avec contrôle d'accès basé sur les rôles :
- Routes admin uniquement : `/admin/*`
- Routes spécifiques : `/producer/*`, `/merchant/*`, `/cooperative/*`
- Routes utilisateur : `/user/*` (tous les utilisateurs authentifiés)

### État d'Authentification
- **Authentifié** : Accès au dashboard principal
- **Email non vérifié** : Redirection vers `/signup/verify`
- **Profil incomplet** : Redirection vers `/signup/details`
- **Non authentifié** : Accès aux pages publiques uniquement

## 🎨 Conventions de Code

### TypeScript & React
- Utiliser TypeScript pour tous les fichiers (`.ts`, `.tsx`)
- Composants fonctionnels avec naming PascalCase
- Hooks personnalisés suivant le pattern `useX`
- Préférer les exports nommés aux exports par défaut

### Styling & UI
- Utiliser les classes utilitaires Tailwind
- Importer depuis `@/components/ui/` pour les composants shadcn
- Utiliser l'utilitaire `cn()` depuis `src/lib/utils.ts` pour la fusion de classes
- Suivre les patterns de design établis

### Flux de Données
- Les services gèrent les appels API et transformations de données
- Les context providers gèrent l'état global
- Les hooks personnalisés encapsulent la logique des composants
- Les composants sont focalisés sur la présentation

## 🔧 Configuration

### Variables d'Environnement
Les variables d'environnement doivent utiliser le préfixe `VITE_` :
```env
# Configuration Supabase (obligatoire)
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Configuration API
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=Plateforme d'Inclusion Numérique
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

### Configuration Supabase
1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Copier l'URL et la clé anonyme dans `.env.local`
4. Exécuter les migrations SQL pour créer les tables
5. Configurer les politiques RLS (Row Level Security)

### Fichiers de Configuration Importants
- `vite.config.ts` - Configuration Vite avec React SWC et path aliases
- `vitest.config.ts` - Configuration des tests avec jsdom
- `eslint.config.js` - Configuration ESLint avec TypeScript
- `tailwind.config.ts` - Configuration Tailwind CSS
- `components.json` - Configuration shadcn/ui

## 📱 Considérations Mobiles

- Design responsive requis pour tous les composants
- Composants mobile-optimisés dans `src/components/ui/mobile-*`
- Interfaces tactiles avec sizing approprié
- Support d'interface vocale pour accessibilité

## 🔒 Sécurité

### Authentification et Autorisation
- **JWT Tokens** avec signature Supabase et expiration
- **Row Level Security (RLS)** sur toutes les tables de la base de données
- **Contrôle d'accès** basé sur les rôles au niveau des routes et données
- **Sessions sécurisées** avec rafraîchissement automatique des tokens
- **Protection CSRF** avec tokens synchronisés

### Validation et Protection
- **Validation des formulaires** côté client (Zod) et serveur
- **Sanitization des entrées** contre les injections
- **Rate limiting** contre les abus et attaques brute force
- **Protection XSS** avec échappement automatique
- **CORS** configuré pour les domaines autorisés

### Gestion des Données
- **Chiffrement** des données sensibles en transit (HTTPS)
- **Stockage sécurisé** des tokens et sessions
- **Logs d'audit** pour les actions sensibles
- **Politiques de sauvegarde** et récupération
- **Accès minimum privilège** appliqué partout

## 📊 Documentation Supplémentaire

- [MVP du projet](./MVP.md) - Produit minimum viable
- [Présentation du projet](./PROJET.md) - Vue d'ensemble complète
- [Credentials de test](./CREDENTIALS.md) - Identifiants pour tests locaux
- [Rapport d'état du projet](./RAPPORT.md) - Analyse complète et métriques
- [Documentation d'implémentation](./AUTH_IMPLEMENTATION.md) - Guide authentification Supabase

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence ANSUT - Voir le fichier [LICENSE](LICENSE) pour les détails

## 🙏 Remerciements

- À tous les acteurs du secteur informel en Côte d'Ivoire
- À l'équipe ANSUT pour leur vision et soutien
- À la communauté des développeurs contributeurs