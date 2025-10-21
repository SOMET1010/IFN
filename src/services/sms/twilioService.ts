/**
 * Service d'envoi de SMS via Twilio
 * Utilise une Edge Function Supabase pour sécuriser les credentials Twilio
 */

import { supabase } from '../supabase/supabaseClient';

export interface SendSMSResult {
  success: boolean;
  messageSid?: string;
  status?: string;
  phoneNumber?: string;
  error?: string;
}

export interface SMSTemplate {
  otp: (code: string) => string;
  welcome: (name: string) => string;
  orderConfirmation: (orderNumber: string) => string;
  paymentConfirmation: (amount: number) => string;
}

/**
 * Service d'envoi de SMS
 */
export class TwilioSMSService {
  private static instance: TwilioSMSService;
  private readonly supabaseUrl: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!this.supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL non configuré');
    }
  }

  static getInstance(): TwilioSMSService {
    if (!TwilioSMSService.instance) {
      TwilioSMSService.instance = new TwilioSMSService();
    }
    return TwilioSMSService.instance;
  }

  /**
   * Templates de messages SMS
   */
  templates: SMSTemplate = {
    otp: (code: string) =>
      `Votre code de vérification AgriMarket est: ${code}. Valide pendant 5 minutes. Ne partagez pas ce code.`,

    welcome: (name: string) =>
      `Bienvenue sur AgriMarket ${name}! Votre compte a été créé avec succès.`,

    orderConfirmation: (orderNumber: string) =>
      `Votre commande #${orderNumber} a été confirmée. Merci de votre confiance!`,

    paymentConfirmation: (amount: number) =>
      `Paiement de ${amount} FCFA reçu avec succès. Merci!`,
  };

  /**
   * Envoyer un SMS via l'Edge Function Supabase
   */
  async sendSMS(
    phoneNumber: string,
    message: string,
    operator?: 'orange' | 'mtn' | 'moov'
  ): Promise<SendSMSResult> {
    try {
      const url = `${this.supabaseUrl}/functions/v1/send-sms`;

      const { data: { session } } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Ajouter le token d'authentification si disponible
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Ajouter la clé anon Supabase
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (anonKey) {
        headers['apikey'] = anonKey;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phoneNumber,
          message,
          operator,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur envoi SMS:', errorData);
        return {
          success: false,
          error: errorData.error || `Erreur HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Envoyer un code OTP par SMS
   */
  async sendOTP(
    phoneNumber: string,
    code: string,
    operator?: 'orange' | 'mtn' | 'moov'
  ): Promise<SendSMSResult> {
    const message = this.templates.otp(code);
    return this.sendSMS(phoneNumber, message, operator);
  }

  /**
   * Envoyer un message de bienvenue
   */
  async sendWelcome(
    phoneNumber: string,
    name: string,
    operator?: 'orange' | 'mtn' | 'moov'
  ): Promise<SendSMSResult> {
    const message = this.templates.welcome(name);
    return this.sendSMS(phoneNumber, message, operator);
  }

  /**
   * Envoyer une confirmation de commande
   */
  async sendOrderConfirmation(
    phoneNumber: string,
    orderNumber: string,
    operator?: 'orange' | 'mtn' | 'moov'
  ): Promise<SendSMSResult> {
    const message = this.templates.orderConfirmation(orderNumber);
    return this.sendSMS(phoneNumber, message, operator);
  }

  /**
   * Envoyer une confirmation de paiement
   */
  async sendPaymentConfirmation(
    phoneNumber: string,
    amount: number,
    operator?: 'orange' | 'mtn' | 'moov'
  ): Promise<SendSMSResult> {
    const message = this.templates.paymentConfirmation(amount);
    return this.sendSMS(phoneNumber, message, operator);
  }

  /**
   * Valider le format d'un numéro de téléphone ivoirien
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Formats acceptés:
    // +225XXXXXXXX, 225XXXXXXXX, 0XXXXXXXX
    const regex = /^(\+?225|0)?[0-9]{8,10}$/;
    return regex.test(phoneNumber.replace(/\s+/g, ''));
  }

  /**
   * Formater un numéro de téléphone au format international
   */
  formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/\s+/g, '');

    if (!formatted.startsWith('+')) {
      if (formatted.startsWith('0')) {
        formatted = '+225' + formatted.substring(1);
      } else if (!formatted.startsWith('225')) {
        formatted = '+225' + formatted;
      } else {
        formatted = '+' + formatted;
      }
    }

    return formatted;
  }
}

// Export singleton
export const twilioSMSService = TwilioSMSService.getInstance();
