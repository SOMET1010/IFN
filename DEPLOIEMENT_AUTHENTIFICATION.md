# Guide de Déploiement - Authentification Simplifiée

## 🎯 Ce qui a été implémenté

### Système d'authentification adapté au contexte ivoirien
- ✅ Connexion par Mobile Money (Orange, MTN, Moov)
- ✅ Connexion par WhatsApp (numéro de téléphone)
- ✅ Email/mot de passe comme option secondaire
- ✅ Interface utilisateur simplifiée et intuitive
- ✅ Base de données prête pour le stockage des identités
- ✅ Mode démo fonctionnel (OTP en console)

## 📦 Fichiers Créés/Modifiés

### Services
- `src/services/auth/socialAuthService.ts` - Service d'authentification sociale
- `src/services/auth/README_MOBILE_MONEY.md` - Documentation technique

### Pages
- `src/pages/Login.tsx` - Page de connexion repensée (Mobile Money prioritaire)
- `src/pages/auth/MobileMoneyLogin.tsx` - Interface connexion téléphone + OTP

### Composants Admin
- `src/components/admin/SocialAuthConfig.tsx` - Dashboard configuration auth

### Contexte
- `src/contexts/AuthContext.tsx` - Ajout méthode `loginWithMobileMoney()`

### Base de Données
- `supabase/migrations/20251021000000_019_social_auth_enhancement.sql` - Migration complète

### Documentation
- `AUTHENTIFICATION_CONTEXTE_IVOIRIEN.md` - Philosophie et contexte
- `DEPLOIEMENT_AUTHENTIFICATION.md` - Ce fichier

## 🚀 Déploiement Étape par Étape

### Étape 1 : Appliquer la Migration Base de Données

**Si vous utilisez Supabase CLI :**
```bash
cd /tmp/cc-agent/58776887/project
supabase db push
```

**Si vous utilisez le Dashboard Supabase :**
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans SQL Editor
4. Copiez le contenu de `supabase/migrations/20251021000000_019_social_auth_enhancement.sql`
5. Exécutez le script

**Vérification :**
```sql
-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('whatsapp_phone', 'whatsapp_verified', 'primary_auth_method');

-- Vérifier que la table OTP existe
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'auth_otp_sessions';
```

### Étape 2 : Variables d'Environnement

**Fichier `.env` (déjà configuré) :**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Rien d'autre n'est nécessaire pour le mode démo !**

### Étape 3 : Build et Déploiement

**Build de production :**
```bash
npm run build
```

**Déployer sur Vercel/Netlify :**
```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

**Ou simplement copier le dossier `dist/` sur votre serveur.**

### Étape 4 : Tester en Local

**1. Démarrer le serveur de dev :**
```bash
npm run dev
```

**2. Aller sur http://localhost:8080/login**

**3. Tester la connexion Mobile Money :**
- Cliquer sur "Connexion avec Mobile Money"
- Choisir un opérateur (Orange, MTN, Moov, ou WhatsApp)
- Entrer un numéro de test : `0712345678`
- Ouvrir la console du navigateur (F12)
- Copier le code OTP affiché dans la console
- Entrer le code dans le formulaire
- ✅ Vous êtes connecté !

## 🔧 Configuration Production

### Étape 1 : Obtenir les Clés API SMS

**Orange Money :**
1. Créer un compte développeur : https://developer.orange.com
2. Créer une application
3. Activer l'API SMS
4. Récupérer API Key et API Secret

**MTN Mobile Money :**
1. Créer un compte : https://momodeveloper.mtn.com
2. Suivre le processus d'enregistrement
3. Obtenir les clés API

**Moov Money :**
1. Contacter Moov Africa CI : https://www.moov-africa.ci
2. Demander accès à l'API SMS
3. Recevoir les credentials

### Étape 2 : Créer une Edge Function Supabase

**Fichier `supabase/functions/send-otp-sms/index.ts` :**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OTPRequest {
  phoneNumber: string;
  otp: string;
  operator: 'orange' | 'mtn' | 'moov' | 'whatsapp';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, otp, operator }: OTPRequest = await req.json();

    // Choisir l'API selon l'opérateur
    let apiUrl = '';
    let apiKey = '';

    switch (operator) {
      case 'orange':
        apiUrl = Deno.env.get('ORANGE_SMS_API_URL') || '';
        apiKey = Deno.env.get('ORANGE_API_KEY') || '';
        break;
      case 'mtn':
        apiUrl = Deno.env.get('MTN_SMS_API_URL') || '';
        apiKey = Deno.env.get('MTN_API_KEY') || '';
        break;
      case 'moov':
        apiUrl = Deno.env.get('MOOV_SMS_API_URL') || '';
        apiKey = Deno.env.get('MOOV_API_KEY') || '';
        break;
      case 'whatsapp':
        // Pour WhatsApp, utiliser l'API SMS classique ou WhatsApp Business API
        apiUrl = Deno.env.get('WHATSAPP_API_URL') || Deno.env.get('ORANGE_SMS_API_URL') || '';
        apiKey = Deno.env.get('WHATSAPP_API_KEY') || Deno.env.get('ORANGE_API_KEY') || '';
        break;
    }

    // Envoyer le SMS
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: `Votre code de vérification AgriMarket est: ${otp}. Valable 5 minutes.`,
        sender: 'AgriMarket'
      })
    });

    if (!response.ok) {
      throw new Error('Erreur envoi SMS');
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
```

**Déployer la fonction :**
```bash
supabase functions deploy send-otp-sms
```

**Configurer les secrets :**
```bash
supabase secrets set ORANGE_SMS_API_URL=https://api.orange.com/...
supabase secrets set ORANGE_API_KEY=your_key_here
supabase secrets set MTN_SMS_API_URL=https://api.mtn.com/...
supabase secrets set MTN_API_KEY=your_key_here
# etc...
```

### Étape 3 : Modifier le Service Frontend

**Fichier `src/services/auth/socialAuthService.ts` :**

Remplacer la section d'envoi d'OTP :
```typescript
// AVANT (Mode démo)
console.log(`OTP envoyé au ${phoneNumber}: ${otp}`);

// APRÈS (Mode production)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const response = await fetch(`${supabaseUrl}/functions/v1/send-otp-sms`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    phoneNumber,
    otp,
    operator
  })
});

if (!response.ok) {
  throw new Error('Erreur lors de l\'envoi du SMS');
}
```

### Étape 4 : Stockage Sécurisé des OTP

Modifier le service pour utiliser la base de données au lieu de localStorage :

```typescript
// Stocker dans Supabase au lieu de localStorage
const { data, error } = await supabase
  .from('auth_otp_sessions')
  .insert({
    phone_number: phoneNumber,
    provider: operator,
    otp_hash: await this.hashOTP(otp), // Hash au lieu de stocker en clair
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    ip_address: await this.getClientIP(),
    user_agent: navigator.userAgent
  })
  .select('id')
  .single();

return data?.id; // Retourner l'ID de session
```

## 📊 Monitoring et Maintenance

### Logs à Surveiller

**1. Taux de réception SMS :**
```sql
SELECT
  provider,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE verified = TRUE) as verified,
  ROUND(COUNT(*) FILTER (WHERE verified = TRUE)::NUMERIC / COUNT(*) * 100, 2) as success_rate
FROM auth_otp_sessions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY provider;
```

**2. Temps moyen de vérification :**
```sql
SELECT
  provider,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_verification_seconds
FROM auth_otp_sessions
WHERE verified = TRUE
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY provider;
```

**3. Tentatives échouées :**
```sql
SELECT
  phone_number,
  provider,
  attempts,
  created_at
FROM auth_otp_sessions
WHERE attempts >= max_attempts
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Tâche Cron de Nettoyage

**Créer un cron job pour nettoyer les sessions expirées :**
```sql
-- À exécuter toutes les heures
SELECT cleanup_expired_otp_sessions();
```

**Ou créer une Edge Function schedulée :**
```typescript
// supabase/functions/cleanup-otp/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.cron("cleanup-otp", "0 * * * *", async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data, error } = await supabase.rpc('cleanup_expired_otp_sessions');

  console.log(`Nettoyage terminé: ${data} sessions supprimées`);
});
```

## 🎓 Formation des Équipes

### Pour le Support Client

**Script de support :**
```
Q: "Je ne reçois pas mon code SMS"
R:
1. Vérifiez que vous avez entré le bon numéro
2. Vérifiez votre réseau mobile
3. Attendez 1-2 minutes
4. Si toujours rien, demandez un nouveau code
5. En dernier recours, essayez avec un autre opérateur

Q: "Mon code ne marche pas"
R:
1. Le code expire après 5 minutes
2. Vérifiez que vous entrez exactement les 6 chiffres
3. Demandez un nouveau code si expiré
4. Maximum 3 tentatives par code

Q: "Je veux utiliser mon email"
R:
Pas de problème ! Sur la page de connexion :
1. Cliquez sur "Se connecter avec Email"
2. Entrez votre email et mot de passe
3. Vous pouvez lier plusieurs méthodes ensuite
```

### Pour les Développeurs

**Points clés à comprendre :**
1. Le numéro de téléphone est l'identifiant unique
2. Les OTP sont temporaires et hashés
3. Chaque méthode (Mobile Money, WhatsApp) peut être utilisée indépendamment
4. Un utilisateur peut avoir plusieurs méthodes liées
5. L'email est optionnel, pas obligatoire

## ✅ Checklist de Déploiement

- [ ] Migration base de données appliquée
- [ ] Colonnes WhatsApp ajoutées à user_profiles
- [ ] Table auth_otp_sessions créée
- [ ] Fonctions SQL testées
- [ ] Build de production réussi
- [ ] Variables d'environnement configurées
- [ ] Test en local effectué
- [ ] (Production) Clés API SMS obtenues
- [ ] (Production) Edge Function SMS déployée
- [ ] (Production) Secrets Supabase configurés
- [ ] (Production) Stockage OTP en DB activé
- [ ] (Production) Cron de nettoyage configuré
- [ ] Monitoring en place
- [ ] Équipe support formée
- [ ] Documentation utilisateur prête

## 🚨 Troubleshooting

### Problème : La migration ne s'applique pas
**Solution :** Vérifier les migrations précédentes, s'assurer que la table user_profiles existe.

### Problème : Les OTP ne s'affichent pas en console
**Solution :** Ouvrir la console avec F12, vérifier que localStorage est activé.

### Problème : Erreur "Session expirée"
**Solution :** Normal après 5 minutes, demander un nouveau code.

### Problème : (Production) SMS ne sont pas reçus
**Solution :**
1. Vérifier les clés API
2. Vérifier les logs Edge Function
3. Tester l'API de l'opérateur directement
4. Vérifier le crédit/quota SMS

## 📞 Support

Pour toute question :
1. Consulter `AUTHENTIFICATION_CONTEXTE_IVOIRIEN.md`
2. Vérifier `src/services/auth/README_MOBILE_MONEY.md`
3. Tester avec les numéros de démo
4. Contacter l'équipe technique

---

**Félicitations ! 🎉**

Vous avez maintenant une solution d'authentification moderne, adaptée au contexte ivoirien, qui maximise l'inclusion et simplifie l'accès à votre plateforme.
