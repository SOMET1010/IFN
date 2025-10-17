# 🗺️ Roadmap - Prochaines Étapes

## Vue d'Ensemble

**Priorité 1:** ✅ COMPLÉTÉE (Intégration Supabase)
**Priorité 2:** 🔄 EN COURS (Module de Formation)
**Priorité 3:** ⏳ À VENIR (Mobile Money Complet)
**Priorité 4:** ⏳ À VENIR (Mode Hors-Ligne PWA)
**Priorité 5:** ⏳ À VENIR (Protection Sociale)

---

## 📚 PRIORITÉ 2: Module de Formation Numérique

**Durée estimée:** 5-7 jours
**Complexité:** Moyenne
**Dépendances:** Priorité 1 ✅

### Objectifs

Créer un module e-learning complet pour former les utilisateurs à l'utilisation de la plateforme.

### Tâches Principales

#### 1. Infrastructure Base de Données (1 jour)

**Tables à créer:**
```sql
-- training_modules
CREATE TABLE training_modules (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- ventes, stocks, paiements, social, marketplace
  difficulty TEXT NOT NULL, -- beginner, intermediate, advanced
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- training_videos
CREATE TABLE training_videos (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES training_modules(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  subtitle_url TEXT,
  duration_seconds INTEGER,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_training_progress
CREATE TABLE user_training_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  video_id UUID REFERENCES training_videos(id),
  completed BOOLEAN DEFAULT false,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- training_certificates
CREATE TABLE training_certificates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  module_id UUID REFERENCES training_modules(id),
  certificate_number TEXT UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS à configurer:**
- Les utilisateurs voient tous les modules
- Les utilisateurs gèrent leur propre progression
- Les certificats sont privés par utilisateur

#### 2. Services Backend (2 jours)

**trainingService.ts à créer:**
```typescript
class TrainingService {
  // Modules
  - getModules(category?: string)
  - getModuleById(id: string)
  - getModuleVideos(moduleId: string)

  // Vidéos
  - getVideoById(id: string)
  - getVideoSubtitles(id: string)

  // Progression
  - getUserProgress(userId: string)
  - updateVideoProgress(userId, videoId, progress)
  - markVideoCompleted(userId, videoId)
  - getModuleCompletionRate(userId, moduleId)

  // Certificats
  - generateCertificate(userId, moduleId)
  - getUserCertificates(userId)
  - downloadCertificate(certificateId)
}
```

#### 3. Composants Frontend (2 jours)

**Pages à créer:**
- `/src/pages/training/TrainingPage.tsx` - Liste des modules
- `/src/pages/training/ModulePage.tsx` - Détails d'un module
- `/src/pages/training/VideoPlayerPage.tsx` - Lecteur vidéo

**Composants à créer:**
- `/src/components/training/ModuleCard.tsx` - Carte de module
- `/src/components/training/VideoPlayer.tsx` - Lecteur vidéo HTML5
- `/src/components/training/ProgressBar.tsx` - Barre de progression
- `/src/components/training/CertificateBadge.tsx` - Badge de certificat
- `/src/components/training/SubtitlesControls.tsx` - Contrôles sous-titres

**Fonctionnalités vidéo:**
- Lecture/Pause/Stop
- Barre de progression cliquable
- Contrôle du volume
- Plein écran
- Vitesse de lecture (0.5x, 1x, 1.5x, 2x)
- Sous-titres français (WebVTT)
- Reprise automatique

#### 4. Contenu de Formation (1 jour)

**3 modules minimum à créer:**

**Module 1: Gestion des Ventes**
- Vidéo 1: "Créer sa première vente" (3 min)
- Vidéo 2: "Utiliser les différents modes de paiement" (4 min)
- Vidéo 3: "Consulter et exporter l'historique" (3 min)

**Module 2: Gestion de l'Inventaire**
- Vidéo 1: "Ajouter des articles au stock" (3 min)
- Vidéo 2: "Gérer les alertes de stock" (4 min)
- Vidéo 3: "Comprendre l'historique des mouvements" (3 min)

**Module 3: Paiements Mobile Money**
- Vidéo 1: "Recevoir un paiement Orange Money" (4 min)
- Vidéo 2: "Utiliser les QR codes de paiement" (3 min)
- Vidéo 3: "Consulter l'historique des transactions" (3 min)

**Format vidéo:**
- MP4 (H.264)
- Résolution: 1280x720 minimum
- Sous-titres: WebVTT français
- Hébergement: Supabase Storage ou CDN

#### 5. Système de Badges (1 jour)

**Niveaux de badges:**
- 🥉 Bronze: 25% du module complété
- 🥈 Argent: 50% du module complété
- 🥇 Or: 100% du module complété
- 🏆 Expert: Tous les modules complétés

**Certificat de complétion:**
- PDF généré automatiquement
- Numéro unique
- Date d'obtention
- Nom de l'utilisateur
- Module complété
- QR code de vérification

---

## 💳 PRIORITÉ 3: Intégration Mobile Money Complète

**Durée estimée:** 5-7 jours
**Complexité:** Élevée
**Dépendances:** Priorité 1 ✅

### Objectifs

Remplacer la simulation par l'intégration réelle des APIs Mobile Money des opérateurs ivoiriens.

### Tâches Principales

#### 1. Partenariats Opérateurs (3 jours)

**Démarches administratives:**
- Contacter Orange CI pour API Orange Money
- Contacter MTN CI pour API MTN Mobile Money
- Contacter Wave pour API Wave
- Contacter Moov CI pour API Moov Money

**Documents requis:**
- Registre de commerce
- Statuts de l'entreprise
- Pièce d'identité du représentant légal
- Justificatif de domicile entreprise

**Obtenir:**
- API Keys (production + sandbox)
- Documentation API
- Webhooks URLs
- Limites et tarifs

#### 2. Configuration Sécurisée (1 jour)

**Variables d'environnement à ajouter:**
```bash
# Orange Money
VITE_ORANGE_MONEY_API_KEY=xxx
VITE_ORANGE_MONEY_API_SECRET=xxx
VITE_ORANGE_MONEY_MERCHANT_ID=xxx

# MTN Mobile Money
VITE_MTN_MOMO_API_KEY=xxx
VITE_MTN_MOMO_API_USER=xxx
VITE_MTN_MOMO_SUBSCRIPTION_KEY=xxx

# Wave
VITE_WAVE_API_KEY=xxx
VITE_WAVE_SECRET_KEY=xxx

# Moov Money
VITE_MOOV_MONEY_API_KEY=xxx
VITE_MOOV_MONEY_MERCHANT_CODE=xxx
```

**IMPORTANT:** Utiliser Supabase Edge Functions pour sécuriser les clés API!

#### 3. Services d'Intégration (2 jours)

**Créer des adaptateurs par opérateur:**

`/src/services/mobilemoney/adapters/`
- `orangeMoneyAdapter.ts`
- `mtnMomoAdapter.ts`
- `waveAdapter.ts`
- `moovMoneyAdapter.ts`

**Interface commune:**
```typescript
interface MobileMoneyAdapter {
  initiatePayment(request: PaymentRequest): Promise<PaymentResponse>;
  checkTransactionStatus(transactionId: string): Promise<TransactionStatus>;
  refundTransaction(transactionId: string): Promise<RefundResponse>;
  validatePhoneNumber(number: string, operator: string): Promise<boolean>;
}
```

#### 4. Edge Functions Supabase (1 jour)

**Créer edge functions pour sécuriser les appels:**

`/supabase/functions/orange-money-payment/index.ts`
`/supabase/functions/mtn-momo-payment/index.ts`
`/supabase/functions/wave-payment/index.ts`
`/supabase/functions/moov-money-payment/index.ts`

**Avantages:**
- Clés API cachées côté serveur
- CORS géré automatiquement
- Logs centralisés
- Isolation des échecs

#### 5. Webhooks et Callbacks (1 jour)

**Endpoints à créer:**
- `/api/webhooks/orange-money/callback`
- `/api/webhooks/mtn-momo/callback`
- `/api/webhooks/wave/callback`
- `/api/webhooks/moov-money/callback`

**Gestion des notifications:**
- Vérification signature
- Mise à jour statut transaction
- Notifications utilisateur temps réel
- Logs d'audit

---

## 📱 PRIORITÉ 4: Mode Hors-Ligne (PWA)

**Durée estimée:** 5-7 jours
**Complexité:** Élevée
**Dépendances:** Priorité 1 ✅, Priorité 2 ✅

### Objectifs

Permettre l'utilisation complète de l'application sans connexion internet avec synchronisation automatique.

### Tâches Principales

#### 1. Configuration PWA (1 jour)

**manifest.json à compléter:**
```json
{
  "name": "Inclusion Numérique CI",
  "short_name": "IFN",
  "description": "Plateforme digitale pour le secteur informel",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#FF6B00",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Créer les icônes:**
- 192x192px
- 512x512px
- Format PNG avec transparence

#### 2. Service Worker Avancé (2 jours)

**Stratégies de cache:**
- **Network First**: API calls (avec fallback cache)
- **Cache First**: Assets statiques (CSS, JS, images)
- **Stale While Revalidate**: Pages HTML

**sw.js amélioré:**
```javascript
// Version du cache
const CACHE_VERSION = 'v1.0.0';

// Ressources à pré-cacher
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/main.css',
  '/scripts/app.js'
];

// Stratégies de cache par route
const CACHE_STRATEGIES = {
  '/api/': 'network-first',
  '/assets/': 'cache-first',
  '/pages/': 'stale-while-revalidate'
};
```

#### 3. IndexedDB pour Données (2 jours)

**Utiliser Dexie.js:**

```typescript
import Dexie from 'dexie';

class AppDatabase extends Dexie {
  sales: Dexie.Table<Sale, string>;
  inventory: Dexie.Table<InventoryItem, string>;
  transactions: Dexie.Table<Transaction, string>;
  syncQueue: Dexie.Table<SyncItem, string>;

  constructor() {
    super('InclusionNumeriqueDB');
    this.version(1).stores({
      sales: 'id, merchant_id, sale_date, synced',
      inventory: 'id, merchant_id, product_name, synced',
      transactions: 'id, user_id, created_at, synced',
      syncQueue: '++id, operation, table, synced, attempts'
    });
  }
}
```

**Synchronisation bidirectionnelle:**
- Push: Local → Supabase
- Pull: Supabase → Local
- Résolution conflits

#### 4. Indicateurs UI (1 jour)

**Composants à créer:**
- `<OnlineIndicator />` - Badge de connexion
- `<SyncProgress />` - Progress de sync
- `<OfflineBanner />` - Bannière mode offline
- `<QueuedActionsCount />` - Nombre d'actions en queue

**États à gérer:**
- 🟢 Online & Synced
- 🟡 Online & Syncing
- 🟠 Offline & Queue Active
- 🔴 Offline & Errors

---

## 🛡️ PRIORITÉ 5: Protection Sociale

**Durée estimée:** 4-5 jours
**Complexité:** Moyenne
**Dépendances:** Priorité 1 ✅, Priorité 3 ✅

### Objectifs

Automatiser le calcul et le paiement des cotisations sociales (CNPS, CNAM) avec simulation réaliste.

### Tâches Principales

#### 1. Calcul Automatique (1 jour)

**Service à améliorer:**
`socialContributionService.ts`

**Formules:**
```typescript
// CNPS (Caisse Nationale de Prévoyance Sociale)
const cnpsRate = 0.05; // 5% du revenu mensuel
const cnpsMin = 1500; // FCFA minimum

// CNAM (Caisse Nationale d'Assurance Maladie)
const cnamRate = 0.032; // 3.2% du revenu mensuel
const cnamMin = 1000; // FCFA minimum

function calculateCNPS(monthlyRevenue: number): number {
  const calculated = monthlyRevenue * cnpsRate;
  return Math.max(calculated, cnpsMin);
}

function calculateCNAM(monthlyRevenue: number): number {
  const calculated = monthlyRevenue * cnamRate;
  return Math.max(calculated, cnamMin);
}
```

#### 2. Interface MerchantSocial (1 jour)

**Améliorer:**
`/src/pages/merchant/MerchantSocial.tsx`

**Sections à ajouter:**
- Statut de couverture actuel
- Historique des cotisations payées
- Prochaines échéances
- Calendrier de paiement
- Cartes de couverture digitales

#### 3. Intégration Paiement (1 jour)

**Connecter avec Mobile Money:**
- Payer les cotisations via Mobile Money
- Type de transaction: 'contribution'
- Génération reçu automatique
- Envoi notification confirmation

#### 4. Simulation API CNPS/CNAM (1 jour)

**Edge Function à créer:**
`/supabase/functions/cnps-cnam-verify/index.ts`

**Simuler:**
- Vérification numéro affiliation
- Statut de couverture
- Historique des cotisations
- Génération cartes de membre

#### 5. Reçus et Certificats (1 jour)

**Générer PDFs:**
- Reçu de paiement cotisation
- Certificat d'affiliation
- Carte de couverture CNPS
- Carte de couverture CNAM

**Utiliser @react-pdf/renderer:**
```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const ContributionReceipt = ({ contribution }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text>Reçu de Cotisation Sociale</Text>
        <Text>Numéro: {contribution.receiptNumber}</Text>
        <Text>Date: {contribution.date}</Text>
        <Text>Montant: {contribution.amount} FCFA</Text>
      </View>
    </Page>
  </Document>
);
```

---

## 📅 Planning Général

### Semaine 1-2: Priorité 2 (Formation)
- Jours 1-2: Base de données et services
- Jours 3-4: Composants et interface
- Jours 5-7: Contenu et tests

### Semaine 3-4: Priorité 3 (Mobile Money)
- Jours 1-3: Partenariats et configuration
- Jours 4-5: Services et adaptateurs
- Jours 6-7: Edge functions et webhooks

### Semaine 5: Priorité 4 (PWA)
- Jours 1-2: Service Worker et cache
- Jours 3-4: IndexedDB et sync
- Jour 5: UI et indicateurs

### Semaine 6: Priorité 5 (Protection Sociale)
- Jours 1-2: Calcul et interface
- Jour 3: Intégration paiement
- Jours 4-5: Simulation API et reçus

---

## 🎯 Critères de Succès

### Priorité 2
- ✅ 3 modules de formation disponibles
- ✅ Lecteur vidéo fonctionnel
- ✅ Système de progression opérationnel
- ✅ Certificats téléchargeables

### Priorité 3
- ✅ 4 opérateurs intégrés
- ✅ Paiements réels fonctionnels
- ✅ Webhooks configurés
- ✅ Taux de succès > 98%

### Priorité 4
- ✅ Application installable
- ✅ Fonctionne offline
- ✅ Synchronisation automatique
- ✅ Indicateurs clairs

### Priorité 5
- ✅ Calcul automatique correct
- ✅ Paiement via Mobile Money
- ✅ Reçus générés
- ✅ Statut visible

---

## 📞 Ressources Utiles

### Documentation
- Supabase: https://supabase.com/docs
- PWA: https://web.dev/progressive-web-apps/
- Dexie.js: https://dexie.org/
- React PDF: https://react-pdf.org/

### APIs Mobile Money
- Orange Money CI: https://developer.orange.com
- MTN MoMo: https://momodeveloper.mtn.com
- Wave: https://developer.wave.com
- Moov Money: https://www.moov-africa.ci/

### Support
- GitHub Issues du projet
- Documentation projet
- Slack/Discord de l'équipe

---

## 🎉 Motivation

**Vous avez déjà complété la Priorité 1! 🎊**

Le plus dur est fait. Les fondations sont solides:
- ✅ Base de données robuste
- ✅ Services fonctionnels
- ✅ Sécurité implémentée
- ✅ Build optimisé

Les prochaines priorités vont construire sur cette base pour créer une expérience utilisateur exceptionnelle!

**Prochaine étape:** Commencer la Priorité 2 - Module de Formation

**Bonne chance! 🚀**
