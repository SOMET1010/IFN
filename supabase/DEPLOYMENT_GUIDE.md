# Guide de Déploiement Supabase

## 📋 Vue d'Ensemble

Ce guide vous accompagne dans la configuration complète de Supabase pour la plateforme d'inclusion numérique.

---

## 🚀 Étape 1 : Créer un Projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name** : `inclusionnumerique`
   - **Database Password** : Générez un mot de passe fort (sauvegardez-le !)
   - **Region** : Choisissez la région la plus proche (ex: `eu-west-1` pour l'Europe)
   - **Pricing Plan** : Commencez avec le plan gratuit pour les tests

5. Attendez que le projet soit créé (~2 minutes)

---

## 🔑 Étape 2 : Récupérer les Clés API

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Copiez les informations suivantes :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (gardez-la secrète !)

3. Créez un fichier `.env` à la racine du projet :

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Configuration
VITE_API_URL=https://xxxxx.supabase.co

# Application Configuration
VITE_APP_NAME=Inclusion Numérique
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

---

## 🗄️ Étape 3 : Exécuter le Schéma de Base de Données

1. Dans Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez le contenu du fichier `supabase/schema.sql`
4. Collez-le dans l'éditeur
5. Cliquez sur **Run** (en bas à droite)
6. Attendez la confirmation : ✅ Success

**Note** : Cette étape crée toutes les tables, index, fonctions et triggers nécessaires.

---

## 🔒 Étape 4 : Activer les Politiques RLS

1. Toujours dans le **SQL Editor**, créez une nouvelle requête
2. Copiez le contenu du fichier `supabase/rls_policies.sql`
3. Collez-le dans l'éditeur
4. Cliquez sur **Run**
5. Attendez la confirmation : ✅ Success

**Note** : Cette étape active la sécurité au niveau des lignes (Row Level Security) pour protéger les données.

---

## 📧 Étape 5 : Configurer l'Authentification

### 5.1 Paramètres Généraux

1. Allez dans **Authentication** → **Settings**
2. Configurez les paramètres suivants :

**Site URL** : `https://votre-domaine.com` (ou `http://localhost:8080` pour le développement)

**Redirect URLs** : Ajoutez :
- `https://votre-domaine.com/**`
- `http://localhost:8080/**`

**Email Templates** : Personnalisez les emails en français

### 5.2 Activer les Fournisseurs

1. Allez dans **Authentication** → **Providers**
2. Activez :
   - ✅ **Email** (activé par défaut)
   - ✅ **Phone** (pour SMS avec Twilio)

### 5.3 Configurer les SMS (Optionnel)

Pour l'authentification par SMS (2FA) :

1. Créez un compte [Twilio](https://www.twilio.com)
2. Récupérez vos identifiants Twilio
3. Dans Supabase, allez dans **Authentication** → **Providers** → **Phone**
4. Entrez vos identifiants Twilio
5. Sauvegardez

---

## 💾 Étape 6 : Configurer le Stockage (Storage)

1. Allez dans **Storage**
2. Créez les buckets suivants :

### Bucket : `avatars`
- **Public** : ✅ Oui
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/*`

### Bucket : `documents`
- **Public** : ❌ Non
- **File size limit** : 10 MB
- **Allowed MIME types** : `application/pdf`, `image/*`

### Bucket : `photos`
- **Public** : ✅ Oui
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/*`

### Bucket : `invoices`
- **Public** : ❌ Non
- **File size limit** : 5 MB
- **Allowed MIME types** : `application/pdf`

3. Pour chaque bucket, configurez les politiques RLS dans **Policies** :

```sql
-- Politique pour avatars (public)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Politique pour photos (public)
CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photos' AND
    auth.role() = 'authenticated'
  );

-- Politique pour documents (privé)
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 🔔 Étape 7 : Configurer les Webhooks (Optionnel)

Pour recevoir des notifications en temps réel :

1. Allez dans **Database** → **Webhooks**
2. Créez un webhook pour chaque événement important :

### Webhook : Nouvelle Commande
- **Table** : `orders`
- **Events** : `INSERT`
- **HTTP Request** : `POST https://votre-api.com/webhooks/new-order`

### Webhook : Nouveau Litige
- **Table** : `disputes`
- **Events** : `INSERT`
- **HTTP Request** : `POST https://votre-api.com/webhooks/new-dispute`

---

## 📊 Étape 8 : Insérer les Données de Test

Pour tester l'application avec des données réalistes :

1. Dans le **SQL Editor**, exécutez le fichier `supabase/seed_data.sql` (à créer)
2. Ce fichier contient des données mockées pour :
   - 5 coopératives
   - 50 membres
   - 20 offres groupées
   - 15 négociations
   - 10 commandes

---

## 🧪 Étape 9 : Tester la Connexion

1. Démarrez l'application en local :

```bash
npm install
npm run dev
```

2. Ouvrez `http://localhost:8080`
3. Créez un compte test
4. Vérifiez que vous pouvez :
   - ✅ Vous inscrire
   - ✅ Vous connecter
   - ✅ Voir les données
   - ✅ Créer une coopérative
   - ✅ Ajouter un membre

---

## 🚀 Étape 10 : Déployer en Production

### 10.1 Mettre à Jour les Variables d'Environnement

Sur votre plateforme de déploiement (Vercel, Netlify, etc.), configurez les variables :

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENVIRONMENT=production
```

### 10.2 Activer les Backups Automatiques

1. Dans Supabase, allez dans **Settings** → **Database**
2. Activez **Point-in-Time Recovery** (PITR)
3. Configurez la rétention : 7 jours minimum

### 10.3 Configurer les Limites de Rate Limiting

1. Allez dans **Settings** → **API**
2. Configurez les limites :
   - **Requests per second** : 100
   - **Concurrent connections** : 50

---

## 📈 Étape 11 : Monitoring et Maintenance

### 11.1 Activer les Logs

1. Allez dans **Logs**
2. Activez les logs pour :
   - ✅ API Requests
   - ✅ Database Queries
   - ✅ Auth Events
   - ✅ Storage Events

### 11.2 Configurer les Alertes

1. Allez dans **Settings** → **Alerts**
2. Configurez des alertes pour :
   - CPU > 80%
   - Disk > 80%
   - Erreurs > 100/min

### 11.3 Sauvegardes Régulières

Planifiez des sauvegardes manuelles hebdomadaires :

1. Allez dans **Settings** → **Database**
2. Cliquez sur **Create Backup**
3. Téléchargez le fichier `.sql`
4. Stockez-le en lieu sûr

---

## 🔧 Dépannage

### Problème : "Invalid API key"

**Solution** : Vérifiez que vous utilisez la bonne clé (`anon public key`) et non la `service_role key` dans le frontend.

### Problème : "Row Level Security policy violation"

**Solution** : Vérifiez que les politiques RLS sont bien activées et que l'utilisateur a les droits nécessaires.

### Problème : "Connection timeout"

**Solution** : Vérifiez que votre région Supabase est accessible depuis votre localisation. Essayez de changer de région.

### Problème : "Storage upload failed"

**Solution** : Vérifiez que le bucket existe, que les politiques RLS sont configurées et que la taille du fichier est dans les limites.

---

## 📚 Ressources Utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Community Discord](https://discord.supabase.com)

---

## ✅ Checklist de Déploiement

Avant de mettre en production, vérifiez que :

- [ ] Le schéma de base de données est déployé
- [ ] Les politiques RLS sont activées
- [ ] L'authentification est configurée
- [ ] Les buckets de stockage sont créés
- [ ] Les variables d'environnement sont définies
- [ ] Les backups automatiques sont activés
- [ ] Les logs sont activés
- [ ] Les alertes sont configurées
- [ ] Les tests de connexion passent
- [ ] La documentation est à jour

---

## 🎉 Félicitations !

Votre base de données Supabase est maintenant configurée et prête pour la production ! 🚀

Pour toute question, consultez la documentation ou contactez le support Supabase.

