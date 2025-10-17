/*
  # Données de Formation - Contenu Initial
  
  Création de 3 modules de formation avec vidéos pour démonstration:
  - Module 1: Gestion des Ventes (3 vidéos)
  - Module 2: Gestion de l'Inventaire (3 vidéos)
  - Module 3: Paiements Mobile Money (3 vidéos)
  
  Note: Les URLs de vidéos sont des exemples. En production, remplacer par de vraies vidéos.
*/

-- ============================================
-- MODULE 1: GESTION DES VENTES
-- ============================================

INSERT INTO public.training_modules (
  id,
  title,
  description,
  category,
  difficulty,
  duration_minutes,
  thumbnail_url,
  order_index,
  is_active
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Gestion des Ventes',
  'Apprenez à créer, gérer et suivre vos ventes quotidiennes. Ce module vous guide à travers toutes les fonctionnalités du système de ventes, des bases jusqu''à l''export des rapports.',
  'ventes',
  'beginner',
  10,
  '/training/thumbnails/ventes.jpg',
  1,
  true
) ON CONFLICT (id) DO NOTHING;

-- Vidéos du Module 1
INSERT INTO public.training_videos (module_id, title, description, video_url, subtitle_url, duration_seconds, order_index, thumbnail_url) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Comment créer votre première vente',
  'Découvrez comment enregistrer une vente en quelques clics : saisir les informations client, les produits vendus, le montant et la méthode de paiement.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  '/training/subtitles/vente-creation-fr.vtt',
  180,
  1,
  '/training/thumbnails/vente-1.jpg'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Utiliser les différents modes de paiement',
  'Mobile Money, virement bancaire ou espèces : apprenez à choisir et enregistrer la bonne méthode de paiement pour chaque transaction.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  '/training/subtitles/vente-paiement-fr.vtt',
  240,
  2,
  '/training/thumbnails/vente-2.jpg'
),
(
  '11111111-1111-1111-1111-111111111111',
  'Consulter et exporter l''historique',
  'Utilisez les filtres de recherche, consultez vos statistiques de ventes et exportez vos données en CSV pour votre comptabilité.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  '/training/subtitles/vente-historique-fr.vtt',
  180,
  3,
  '/training/thumbnails/vente-3.jpg'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- MODULE 2: GESTION DE L'INVENTAIRE
-- ============================================

INSERT INTO public.training_modules (
  id,
  title,
  description,
  category,
  difficulty,
  duration_minutes,
  thumbnail_url,
  order_index,
  is_active
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Gestion de l''Inventaire',
  'Maîtrisez la gestion de votre stock : ajout d''articles, mise à jour des quantités, alertes automatiques et historique des mouvements. Un inventaire bien géré, c''est un commerce prospère!',
  'stocks',
  'beginner',
  11,
  '/training/thumbnails/inventaire.jpg',
  2,
  true
) ON CONFLICT (id) DO NOTHING;

-- Vidéos du Module 2
INSERT INTO public.training_videos (module_id, title, description, video_url, subtitle_url, duration_seconds, order_index, thumbnail_url) VALUES
(
  '22222222-2222-2222-2222-222222222222',
  'Ajouter des articles à votre stock',
  'Créez votre premier article d''inventaire : nom du produit, catégorie, quantité actuelle, stock maximum, emplacement et date d''expiration.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  '/training/subtitles/inventaire-ajout-fr.vtt',
  180,
  1,
  '/training/thumbnails/inventaire-1.jpg'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Comprendre les alertes de stock',
  'Le système vous alerte automatiquement quand vos stocks sont faibles ou critiques. Apprenez à configurer vos seuils personnalisés.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  '/training/subtitles/inventaire-alertes-fr.vtt',
  240,
  2,
  '/training/thumbnails/inventaire-2.jpg'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Suivre l''historique des mouvements',
  'Chaque entrée, sortie ou ajustement est enregistré. Découvrez comment consulter l''historique complet de vos mouvements de stock.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  '/training/subtitles/inventaire-historique-fr.vtt',
  180,
  3,
  '/training/thumbnails/inventaire-3.jpg'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- MODULE 3: PAIEMENTS MOBILE MONEY
-- ============================================

INSERT INTO public.training_modules (
  id,
  title,
  description,
  category,
  difficulty,
  duration_minutes,
  thumbnail_url,
  order_index,
  is_active
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Paiements Mobile Money',
  'Recevez vos paiements via Orange Money, MTN, Wave ou Moov Money. Générez des QR codes, consultez vos transactions et gérez votre historique en toute simplicité.',
  'paiements',
  'intermediate',
  10,
  '/training/thumbnails/paiements.jpg',
  3,
  true
) ON CONFLICT (id) DO NOTHING;

-- Vidéos du Module 3
INSERT INTO public.training_videos (module_id, title, description, video_url, subtitle_url, duration_seconds, order_index, thumbnail_url) VALUES
(
  '33333333-3333-3333-3333-333333333333',
  'Recevoir un paiement Orange Money',
  'Guide complet pour recevoir un paiement via Orange Money : saisir le numéro du client, le montant, et confirmer la transaction.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  '/training/subtitles/paiement-orange-fr.vtt',
  240,
  1,
  '/training/thumbnails/paiement-1.jpg'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Utiliser les QR codes de paiement',
  'Générez un QR code pour vos clients : ils peuvent scanner et payer directement sans saisir de numéro. Rapide et sans erreur!',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  '/training/subtitles/paiement-qr-fr.vtt',
  180,
  2,
  '/training/thumbnails/paiement-2.jpg'
),
(
  '33333333-3333-3333-3333-333333333333',
  'Consulter l''historique des transactions',
  'Retrouvez toutes vos transactions Mobile Money : codes de transaction, statuts, opérateurs utilisés. Exportez en CSV pour votre comptabilité.',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  '/training/subtitles/paiement-historique-fr.vtt',
  180,
  3,
  '/training/thumbnails/paiement-3.jpg'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES
-- ============================================

/*
  Les vidéos utilisent des URLs de démonstration de Google.
  En production, remplacer par :
  1. Vidéos hébergées sur Supabase Storage
  2. Vidéos hébergées sur un CDN (Cloudflare, AWS)
  3. Vidéos YouTube (embed)
  
  Format recommandé :
  - MP4 (H.264)
  - Résolution : 1280x720 ou 1920x1080
  - Bitrate : 2-5 Mbps
  - Audio : AAC, 128 kbps
  
  Sous-titres :
  - Format WebVTT (.vtt)
  - Encodage UTF-8
  - Synchronisation avec les timestamps vidéo
*/