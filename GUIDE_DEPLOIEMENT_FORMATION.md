# 🚀 Guide de Déploiement - Module de Formation

**Version :** 1.0.0
**Date :** 17 Octobre 2025
**Module :** Priorité 2 - Formation Numérique

---

## 📋 Prérequis

### Environnement Technique
- ✅ Node.js 18+ installé
- ✅ npm ou Bun package manager
- ✅ Accès au projet Git
- ✅ Compte Supabase actif
- ✅ Variables d'environnement configurées

### Accès Requis
- ✅ Accès au tableau de bord Supabase
- ✅ Permissions pour appliquer des migrations
- ✅ Accès au stockage de fichiers (pour vidéos)
- ✅ Droits d'administration de la base de données

---

## 🗄️ Étape 1: Déploiement de la Base de Données

### 1.1 Application des Migrations

**Via Supabase Dashboard:**

1. Connectez-vous à [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle requête

**Migration 016 - Schéma Principal:**
```bash
# Copier le contenu de ce fichier
cat supabase/migrations/20251017084629_016_training_system.sql
```

5. Collez le contenu dans l'éditeur SQL
6. Cliquez sur **Run** pour exécuter
7. Vérifiez qu'il n'y a pas d'erreurs

**Migration 017 - Données de Seed:**
```bash
# Copier le contenu de ce fichier
cat supabase/migrations/20251017084710_017_training_seed_data.sql
```

8. Répétez les étapes 5-7 pour la migration 017

### 1.2 Vérification des Tables

Exécutez cette requête pour vérifier:
```sql
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'training%'
ORDER BY table_name;
```

**Résultat attendu:**
```
training_modules           → 11 colonnes
training_videos            → 9 colonnes
user_training_progress     → 9 colonnes
training_certificates      → 6 colonnes
training_badges            → 5 colonnes
```

### 1.3 Vérification des Données de Seed

```sql
SELECT
  'Modules' as type, COUNT(*) as count FROM training_modules
UNION ALL
SELECT
  'Videos' as type, COUNT(*) as count FROM training_videos;
```

**Résultat attendu:**
```
Modules → 3
Videos  → 9
```

### 1.4 Vérification des Triggers

```sql
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%badge%'
   OR trigger_name LIKE '%certificate%'
ORDER BY trigger_name;
```

**Résultat attendu:**
- `award_module_badges_trigger` sur `user_training_progress`
- `issue_module_certificate_trigger` sur `user_training_progress`
- Timing: AFTER INSERT OR UPDATE

### 1.5 Test des Politiques RLS

```sql
-- Vérifier que RLS est activé
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename LIKE 'training%'
  AND schemaname = 'public';
```

**Toutes les tables doivent avoir `rowsecurity = true`**

---

## 📦 Étape 2: Déploiement du Code Frontend

### 2.1 Pull du Code

```bash
# Récupérer les dernières modifications
git pull origin main

# Vérifier les nouveaux fichiers
git log --name-status -5
```

**Fichiers ajoutés:**
- `src/services/training/trainingService.ts`
- `src/pages/training/TrainingPage.tsx`
- `src/pages/training/ModulePage.tsx`
- `src/pages/training/VideoPlayerPage.tsx`

**Fichiers modifiés:**
- `src/App.tsx` (3 nouvelles routes)

### 2.2 Installation des Dépendances

```bash
# Avec npm
npm install

# Ou avec Bun
bun install
```

**Note:** Aucune nouvelle dépendance n'est requise. Le module utilise uniquement les packages existants.

### 2.3 Vérification TypeScript

```bash
# Vérifier qu'il n'y a pas d'erreurs de type
npm run build

# Résultat attendu: Build successful
```

### 2.4 Tests Locaux

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
# http://localhost:5173/training
```

**Tests à effectuer:**
1. ✅ Page `/training` s'affiche
2. ✅ Liste des 3 modules visible
3. ✅ Filtres fonctionnels
4. ✅ Clic sur module ouvre détails
5. ✅ Clic sur vidéo lance lecteur
6. ✅ Contrôles vidéo fonctionnels

---

## 🎥 Étape 3: Configuration des Vidéos

### 3.1 Hébergement des Vidéos

**Option A: Supabase Storage (Recommandé)**

1. Créer un bucket `training-videos`:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-videos', 'training-videos', true);
```

2. Configurer les politiques de stockage:
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'training-videos');

CREATE POLICY "Admin upload access"
ON storage.objects FOR INSERT
TO authenticated
USING (bucket_id = 'training-videos');
```

3. Uploader les vidéos via Dashboard ou CLI:
```bash
# Via Supabase CLI
supabase storage upload training-videos/module1-video1.mp4 ./videos/module1-video1.mp4
```

4. Mettre à jour les URLs dans la base:
```sql
UPDATE training_videos
SET video_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/training-videos/module1-video1.mp4'
WHERE id = 'VIDEO_ID';
```

**Option B: CDN Externe (Cloudflare, AWS CloudFront)**

1. Uploader les vidéos sur votre CDN
2. Récupérer les URLs publiques
3. Mettre à jour la base de données

**Option C: YouTube (Embed)**

1. Uploader sur YouTube (privé ou non listé)
2. Utiliser l'URL embed:
```sql
UPDATE training_videos
SET video_url = 'https://www.youtube.com/embed/VIDEO_ID'
WHERE id = 'VIDEO_ID';
```

### 3.2 Format des Vidéos

**Spécifications Recommandées:**
- Format: MP4 (H.264)
- Résolution: 1280x720 (minimum) ou 1920x1080
- Bitrate: 2-5 Mbps
- Frame Rate: 30 fps
- Audio: AAC, 128 kbps stéréo
- Durée: 3-10 minutes par vidéo

**Optimisation:**
```bash
# Avec ffmpeg (exemple)
ffmpeg -i input.mp4 \
  -c:v libx264 -preset slow -crf 22 \
  -c:a aac -b:a 128k \
  -vf scale=1280:720 \
  -movflags +faststart \
  output.mp4
```

### 3.3 Sous-titres (WebVTT)

**Créer un fichier .vtt:**
```vtt
WEBVTT

00:00:00.000 --> 00:00:05.000
Bienvenue dans ce module de formation.

00:00:05.000 --> 00:00:10.000
Aujourd'hui, nous allons apprendre à gérer vos ventes.

00:00:10.000 --> 00:00:15.000
Commençons par créer votre première vente.
```

**Uploader et lier:**
```sql
UPDATE training_videos
SET subtitle_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/training-videos/module1-video1-fr.vtt'
WHERE id = 'VIDEO_ID';
```

### 3.4 Thumbnails (Vignettes)

**Créer les thumbnails:**
```bash
# Extraire une frame de la vidéo
ffmpeg -i video.mp4 -ss 00:00:05 -vframes 1 -q:v 2 thumbnail.jpg

# Redimensionner
convert thumbnail.jpg -resize 1280x720 thumbnail-resized.jpg
```

**Uploader et lier:**
```sql
UPDATE training_videos
SET thumbnail_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/training-videos/thumbnails/module1-video1.jpg'
WHERE id = 'VIDEO_ID';

UPDATE training_modules
SET thumbnail_url = 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/training-videos/thumbnails/module1.jpg'
WHERE id = 'MODULE_ID';
```

---

## 🌐 Étape 4: Déploiement en Production

### 4.1 Build de Production

```bash
# Build optimisé
npm run build

# Vérifier le dossier dist/
ls -lh dist/
```

**Résultat attendu:**
- `dist/index.html`
- `dist/assets/` (CSS, JS)
- Taille totale: ~3-4 MB

### 4.2 Déploiement

**Option A: Vercel (Recommandé)**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Ou via GitHub (automatique)
git push origin main
```

**Option B: Netlify**
```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Déployer
netlify deploy --prod --dir=dist
```

**Option C: Serveur Custom**
```bash
# Copier les fichiers dist/ vers le serveur
scp -r dist/* user@server:/var/www/html/

# Configurer Nginx
# Voir section 4.3
```

### 4.3 Configuration Nginx (si applicable)

```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour les assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 4.4 Vérification Post-Déploiement

**Checklist:**
- [ ] Site accessible via HTTPS
- [ ] Page `/training` charge correctement
- [ ] Modules s'affichent avec images
- [ ] Vidéos se lancent sans erreur
- [ ] Progression sauvegardée (utilisateur connecté)
- [ ] Pas d'erreurs dans la console navigateur
- [ ] Temps de chargement < 3 secondes

---

## 🧪 Étape 5: Tests de Validation

### 5.1 Tests Fonctionnels

**Test 1: Accès Public**
```bash
# Sans être connecté
curl https://votre-domaine.com/training
# Statut: 200 OK
```

**Test 2: Liste des Modules**
- Ouvrir `/training`
- Vérifier 3 modules visibles
- Filtrer par catégorie "Ventes"
- Vérifier 1 module affiché

**Test 3: Détails Module**
- Cliquer sur "Gestion des Ventes"
- Vérifier 3 vidéos listées
- Vérifier vidéo 1 déverrouillée
- Vérifier vidéos 2-3 verrouillées (si non complétées)

**Test 4: Lecture Vidéo**
- Lancer vidéo 1
- Vérifier lecture démarre
- Tester contrôles (play/pause/volume)
- Fermer et rouvrir (vérifier reprise si connecté)

**Test 5: Progression (Utilisateur Connecté)**
1. Se connecter
2. Lancer une vidéo
3. Regarder 30 secondes
4. Fermer le navigateur
5. Rouvrir et retourner à la vidéo
6. Vérifier reprise à la bonne position

**Test 6: Complétion**
1. Regarder une vidéo jusqu'à 95%
2. Vérifier marquage "complétée"
3. Retourner au module
4. Vérifier vidéo suivante déverrouillée

### 5.2 Tests de Performance

**Lighthouse Audit:**
```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Audit
lighthouse https://votre-domaine.com/training --view
```

**Cibles:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

### 5.3 Tests de Sécurité

**Vérifier RLS:**
```sql
-- En tant qu'utilisateur non admin
SET ROLE authenticated;
SET request.jwt.claims.sub = 'USER_ID';

-- Essayer d'accéder aux données d'un autre utilisateur
SELECT * FROM user_training_progress WHERE user_id != 'USER_ID';
-- Résultat attendu: 0 lignes
```

**Test XSS:**
- Essayer d'injecter du HTML dans titre de module
- Vérifier que c'est échappé (React s'en charge)

---

## 📊 Étape 6: Monitoring et Analytics

### 6.1 Configuration du Monitoring

**Supabase Dashboard:**
1. Allez dans **Database** > **Query Performance**
2. Surveillez les requêtes lentes
3. Ajoutez des index si nécessaire

**Application Monitoring:**
```typescript
// Ajouter Google Analytics ou Plausible
// Dans index.html ou main.tsx

// Exemple avec Plausible (privacy-friendly)
<script defer data-domain="votre-domaine.com" src="https://plausible.io/js/script.js"></script>
```

### 6.2 Métriques à Suivre

**Base de Données:**
- Nombre de modules créés
- Nombre de vidéos par module
- Taux de complétion des vidéos
- Temps moyen de visionnage
- Certificats émis
- Badges attribués

**Requête Analytics:**
```sql
-- Statistiques globales
SELECT
  (SELECT COUNT(*) FROM training_modules WHERE is_active = true) as total_modules,
  (SELECT COUNT(*) FROM training_videos) as total_videos,
  (SELECT COUNT(DISTINCT user_id) FROM user_training_progress) as active_learners,
  (SELECT COUNT(*) FROM training_certificates) as certificates_issued,
  (SELECT COUNT(*) FROM training_badges) as badges_awarded;
```

**Dashboard Custom:**
- Créer des vues dans Supabase pour analytics
- Exporter vers Google Sheets ou Metabase

### 6.3 Alertes

**Configurer des alertes pour:**
- Erreurs de lecture vidéo (>5% des lectures)
- Temps de chargement > 5 secondes
- Taux de complétion < 20%
- Erreurs 500 sur API

---

## 🔄 Étape 7: Maintenance

### 7.1 Ajout de Nouveaux Modules

**1. Créer le module:**
```sql
INSERT INTO training_modules (
  title,
  description,
  category,
  difficulty,
  duration_minutes,
  thumbnail_url,
  order_index,
  is_active,
  prerequisites
) VALUES (
  'Nouveau Module',
  'Description détaillée...',
  'ventes',
  'beginner',
  15,
  'https://.../thumbnail.jpg',
  4,
  true,
  ARRAY['Module 1', 'Module 2']
);
```

**2. Ajouter les vidéos:**
```sql
INSERT INTO training_videos (
  module_id,
  title,
  description,
  video_url,
  subtitle_url,
  duration_seconds,
  order_index,
  thumbnail_url
) VALUES (
  'MODULE_ID',
  'Vidéo 1: Introduction',
  'Description...',
  'https://.../video1.mp4',
  'https://.../video1-fr.vtt',
  240,
  1,
  'https://.../thumb1.jpg'
);
```

### 7.2 Mise à Jour des Vidéos

```sql
-- Remplacer une vidéo
UPDATE training_videos
SET
  video_url = 'nouvelle-url.mp4',
  subtitle_url = 'nouvelle-url-fr.vtt',
  duration_seconds = 300,
  updated_at = NOW()
WHERE id = 'VIDEO_ID';
```

### 7.3 Désactivation Temporaire

```sql
-- Désactiver un module
UPDATE training_modules
SET is_active = false
WHERE id = 'MODULE_ID';

-- Réactiver
UPDATE training_modules
SET is_active = true
WHERE id = 'MODULE_ID';
```

### 7.4 Backup

**Backup automatique des données:**
```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Ou via pg_dump
pg_dump -h YOUR_HOST -U postgres -d YOUR_DB \
  -t training_* -t user_training_progress \
  > training_backup.sql
```

---

## ❓ FAQ Déploiement

### Q: Les vidéos ne se chargent pas?
**R:** Vérifiez:
- URLs correctes dans la base
- CORS configuré sur le bucket/CDN
- Format vidéo supporté (MP4 H.264)
- Taille fichier < 500 MB

### Q: La progression ne se sauvegarde pas?
**R:** Vérifiez:
- Utilisateur bien connecté
- Token Supabase valide
- Politiques RLS correctes
- Pas d'erreurs dans la console

### Q: Les badges ne s'attribuent pas?
**R:** Vérifiez:
- Triggers bien créés en DB
- Pas d'erreurs dans les logs Supabase
- Fonction `award_module_badges()` existe
- Pourcentages corrects (25%, 50%, 100%)

### Q: Performance lente?
**R:** Solutions:
- Optimiser les vidéos (compression)
- Utiliser un CDN
- Ajouter des index en DB
- Activer le cache navigateur

---

## 📞 Support

### Ressources
- **Documentation:** `/docs` dans le projet
- **Issues GitHub:** [Lien vers repo]
- **Support Email:** support@plateforme.ci
- **Slack/Discord:** [Lien vers channel]

### Contact Équipe
- **Développeur Lead:** [Nom]
- **DevOps:** [Nom]
- **Product Owner:** [Nom]

---

## ✅ Checklist Finale

Avant de considérer le déploiement comme terminé:

- [ ] Migrations DB appliquées sans erreur
- [ ] Données de seed chargées
- [ ] RLS validée
- [ ] Triggers fonctionnels
- [ ] Code frontend déployé
- [ ] Build production OK
- [ ] Vidéos hébergées et accessibles
- [ ] Sous-titres disponibles
- [ ] Thumbnails configurés
- [ ] Routes accessibles
- [ ] Tests fonctionnels passés
- [ ] Performance > 80 (Lighthouse)
- [ ] Monitoring configuré
- [ ] Documentation à jour
- [ ] Équipe formée

**Félicitations! Le module de formation est déployé! 🎉**

---

_Guide créé le 17 Octobre 2025_
_Version 1.0.0_
