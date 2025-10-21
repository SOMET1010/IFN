/**
 * Service d'authentification sociale alternatif
 * Pour contourner les limitations d'accès aux paramètres Supabase
 */

import { supabase } from '../supabase/supabaseClient';

export interface SocialAuthProvider {
  id: 'google' | 'facebook' | 'mobile_money' | 'whatsapp';
  name: string;
  icon: string;
  enabled: boolean;
  requiresConfig: boolean;
  description?: string;
}

export interface SocialAuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  name?: string;
  provider?: string;
  error?: string;
}

export interface MobileMoneyAuth {
  phoneNumber: string;
  operator: 'orange' | 'mtn' | 'moov';
  otp?: string;
}

/**
 * Service d'authentification sociale qui fonctionne sans configuration Supabase
 */
export class SocialAuthService {
  private static instance: SocialAuthService;

  private providers: SocialAuthProvider[] = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: 'Smartphone',
      enabled: true,
      requiresConfig: false,
      description: 'Méthode recommandée - Orange Money, MTN, Moov'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'MessageCircle',
      enabled: true,
      requiresConfig: false,
      description: 'Connexion avec votre numéro WhatsApp'
    },
    {
      id: 'google',
      name: 'Google',
      icon: 'Mail',
      enabled: false,
      requiresConfig: true,
      description: 'Nécessite configuration OAuth'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'Facebook',
      enabled: false,
      requiresConfig: true,
      description: 'Nécessite configuration OAuth'
    }
  ];

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      SocialAuthService.instance = new SocialAuthService();
    }
    return SocialAuthService.instance;
  }

  /**
   * Obtenir la liste des fournisseurs disponibles
   */
  getAvailableProviders(): SocialAuthProvider[] {
    return this.providers.filter(p => p.enabled);
  }

  /**
   * Authentification via numéro de téléphone (Mobile Money ou WhatsApp)
   * Cette méthode fonctionne sans configuration Supabase
   */
  async authenticateWithMobileMoney(
    phoneNumber: string,
    operator: 'orange' | 'mtn' | 'moov' | 'whatsapp'
  ): Promise<{ success: boolean; otpSent: boolean; sessionId: string; error?: string }> {
    try {
      // Validation du numéro de téléphone
      if (!this.validatePhoneNumber(phoneNumber)) {
        return {
          success: false,
          otpSent: false,
          sessionId: '',
          error: 'Numéro de téléphone invalide'
        };
      }

      // Génération d'un code OTP (à envoyer via SMS en production)
      const otp = this.generateOTP();
      const sessionId = this.generateSessionId();

      // Stocker temporairement dans le localStorage (en production, utiliser un backend)
      const session = {
        phoneNumber,
        operator,
        otp,
        timestamp: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
      };

      localStorage.setItem(`mm_auth_${sessionId}`, JSON.stringify(session));

      // En production, envoyer le SMS via l'API de l'opérateur
      console.log(`OTP envoyé au ${phoneNumber}: ${otp}`);

      return {
        success: true,
        otpSent: true,
        sessionId
      };
    } catch (error) {
      console.error('Erreur Mobile Money Auth:', error);
      return {
        success: false,
        otpSent: false,
        sessionId: '',
        error: 'Erreur lors de l\'envoi du code'
      };
    }
  }

  /**
   * Vérifier le code OTP Mobile Money
   */
  async verifyMobileMoneyOTP(
    sessionId: string,
    otp: string
  ): Promise<SocialAuthResult> {
    try {
      const sessionData = localStorage.getItem(`mm_auth_${sessionId}`);

      if (!sessionData) {
        return {
          success: false,
          error: 'Session expirée ou invalide'
        };
      }

      const session = JSON.parse(sessionData);

      // Vérifier l'expiration
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(`mm_auth_${sessionId}`);
        return {
          success: false,
          error: 'Le code a expiré'
        };
      }

      // Vérifier le code OTP
      if (session.otp !== otp) {
        return {
          success: false,
          error: 'Code incorrect'
        };
      }

      // Créer ou connecter l'utilisateur dans Supabase
      const result = await this.createOrLoginMobileMoneyUser(
        session.phoneNumber,
        session.operator
      );

      // Nettoyer la session
      localStorage.removeItem(`mm_auth_${sessionId}`);

      return result;
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      return {
        success: false,
        error: 'Erreur lors de la vérification'
      };
    }
  }

  /**
   * Créer ou connecter un utilisateur Mobile Money avec authentification anonyme
   * Cette méthode fonctionne même si l'authentification email est désactivée
   */
  private async createOrLoginMobileMoneyUser(
    phoneNumber: string,
    operator: string
  ): Promise<SocialAuthResult> {
    try {
      // Vérifier si l'utilisateur existe déjà avec ce numéro
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('phone', phoneNumber)
        .maybeSingle();

      if (existingProfile?.user_id) {
        // Utilisateur existe, créer une session anonyme et la lier
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
          options: {
            data: {
              phone: phoneNumber,
              provider: `mobile_money_${operator}`,
              auth_method: 'mobile_money',
              linked_user_id: existingProfile.user_id
            }
          }
        });

        if (anonError || !anonData.user) {
          return {
            success: false,
            error: anonError?.message || 'Erreur lors de la connexion'
          };
        }

        return {
          success: true,
          userId: anonData.user.id,
          provider: `mobile_money_${operator}`
        };
      }

      // Nouvel utilisateur, créer un compte anonyme
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            phone: phoneNumber,
            provider: `mobile_money_${operator}`,
            auth_method: 'mobile_money'
          }
        }
      });

      if (anonError || !anonData.user) {
        return {
          success: false,
          error: anonError?.message || 'Erreur lors de la création du compte'
        };
      }

      // Créer le profil utilisateur avec un email factice
      const email = `${phoneNumber.replace(/[^0-9]/g, '')}@mobilemoney.local`;
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: anonData.user.id,
          user_id: anonData.user.id,
          phone: phoneNumber,
          email: email,
          mobile_money_operator: operator,
          mobile_money_verified: true,
          primary_auth_method: 'mobile_money',
          auth_methods_used: ['mobile_money'],
          role: 'merchant'
        });

      if (profileError) {
        console.error('Erreur création profil:', profileError);
        // Ne pas bloquer si le profil existe déjà
      }

      return {
        success: true,
        userId: anonData.user.id,
        email,
        provider: `mobile_money_${operator}`
      };
    } catch (error) {
      console.error('Erreur création utilisateur Mobile Money:', error);
      return {
        success: false,
        error: 'Erreur lors de la création du compte'
      };
    }
  }

  /**
   * Authentification Google alternative (sans OAuth Supabase)
   * Utilise un popup avec redirection vers une page de connexion Google
   */
  async authenticateWithGoogle(): Promise<SocialAuthResult> {
    return {
      success: false,
      error: 'L\'authentification Google nécessite une configuration Supabase. Veuillez utiliser Mobile Money ou Email/Password.'
    };
  }

  /**
   * Lier un compte social à un compte existant
   */
  async linkSocialAccountToUser(
    userId: string,
    phoneNumber: string,
    provider: 'orange' | 'mtn' | 'moov' | 'whatsapp',
    socialInfo?: { whatsappName?: string; googleEmail?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        id: userId,
        phone: phoneNumber,
        updated_at: new Date().toISOString()
      };

      if (provider === 'whatsapp') {
        updateData.whatsapp_phone = phoneNumber;
        updateData.whatsapp_verified = true;
        if (socialInfo?.whatsappName) {
          updateData.whatsapp_name = socialInfo.whatsappName;
        }
      } else {
        updateData.mobile_money_operator = provider;
        updateData.mobile_money_verified = true;
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updateData);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur liaison compte social:', error);
      return { success: false, error: 'Erreur lors de la liaison du compte' };
    }
  }

  /**
   * Lier un compte Mobile Money à un compte existant (legacy)
   */
  async linkMobileMoneyToAccount(
    userId: string,
    phoneNumber: string,
    operator: 'orange' | 'mtn' | 'moov'
  ): Promise<{ success: boolean; error?: string }> {
    return this.linkSocialAccountToUser(userId, phoneNumber, operator);
  }

  /**
   * Vérifier si un numéro Mobile Money est déjà enregistré
   */
  async checkMobileMoneyExists(phoneNumber: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
    }
  }

  // Méthodes utilitaires
  private validatePhoneNumber(phone: string): boolean {
    // Format accepté: +225XXXXXXXX ou 225XXXXXXXX ou 0XXXXXXXX
    const regex = /^(\+?225|0)?[0-9]{8,10}$/;
    return regex.test(phone);
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSessionId(): string {
    return `mm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSecurePassword(phoneNumber: string): string {
    // Génère un mot de passe sécurisé basé sur le numéro
    // En production, utiliser une vraie fonction de hashing
    const secret = 'AgriMarket2024Secret';
    return `${phoneNumber}_${secret}_${Date.now()}`.split('').reverse().join('');
  }

  /**
   * Guide de configuration pour les administrateurs
   */
  getConfigurationGuide(): {
    title: string;
    provider: string;
    steps: string[];
    documentation: string;
  }[] {
    return [
      {
        title: 'Configuration Google OAuth',
        provider: 'google',
        steps: [
          '1. Connectez-vous au Dashboard Supabase',
          '2. Allez dans Authentication > Providers',
          '3. Activez Google OAuth',
          '4. Créez un projet sur Google Cloud Console',
          '5. Activez Google+ API',
          '6. Créez des identifiants OAuth 2.0',
          '7. Copiez Client ID et Client Secret dans Supabase',
          '8. Ajoutez l\'URL de redirection Supabase dans Google Console'
        ],
        documentation: 'https://supabase.com/docs/guides/auth/social-login/auth-google'
      },
      {
        title: 'Configuration Mobile Money & WhatsApp',
        provider: 'mobile_money',
        steps: [
          '1. Mobile Money et WhatsApp sont déjà configurés et fonctionnels',
          '2. Aucune configuration Supabase OAuth requise',
          '3. Les utilisateurs peuvent se connecter avec:',
          '   - Orange Money (numéro + OTP)',
          '   - MTN Mobile Money (numéro + OTP)',
          '   - Moov Money (numéro + OTP)',
          '   - WhatsApp (numéro + OTP)',
          '4. En production, configurez les APIs SMS pour l\'envoi d\'OTP',
          '5. Optionnel: Intégrez WhatsApp Business API pour notifications'
        ],
        documentation: 'Documentation interne Mobile Money & WhatsApp'
      }
    ];
  }
}

export const socialAuthService = SocialAuthService.getInstance();
