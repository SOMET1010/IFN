import { supabase, SupabaseUser, DatabaseUser, authHelpers } from './supabaseClient';
import { User } from '@/types';

// Types d'erreurs d'authentification
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string = 'AUTH_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Email ou mot de passe incorrect', 'INVALID_CREDENTIALS');
    this.name = 'InvalidCredentialsError';
  }
}

export class AccountNotVerifiedError extends AuthError {
  constructor() {
    super('Veuillez vérifier votre email avant de vous connecter', 'ACCOUNT_NOT_VERIFIED');
    this.name = 'AccountNotVerifiedError';
  }
}

export class AccountNotFoundError extends AuthError {
  constructor() {
    super('Ce compte n\'existe pas ou n\'a pas de profil complet', 'ACCOUNT_NOT_FOUND');
    this.name = 'AccountNotFoundError';
  }
}

export class NetworkError extends AuthError {
  constructor() {
    super('Erreur réseau. Veuillez vérifier votre connexion.', 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class ValidationError extends AuthError {
  constructor(public validationErrors: string[]) {
    super('Erreurs de validation', 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class RateLimitError extends AuthError {
  constructor(public retryAfter: number) {
    super('Trop de tentatives. Veuillez réessayer plus tard.', 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Interface pour le résultat d'authentification
export interface AuthResult {
  success: boolean;
  user?: User;
  session?: any;
  error?: AuthError;
  requiresProfile?: boolean;
  requiresVerification?: boolean;
}

// Interface pour les données d'inscription
export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: 'merchant' | 'producer' | 'cooperative';
  phone?: string;
  location?: string;
  businessName?: string;
  businessType?: string;
}

// Service d'authentification Supabase
export class SupabaseAuthService {
  // Connexion
  static async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<AuthResult> {
    try {
      // Validation des entrées
      const validationErrors = this.validateCredentials(email, password);
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors);
      }

      // Connexion avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw this.handleSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw new AuthError('Échec de la connexion', 'LOGIN_FAILED');
      }

      // Vérifier si l'utilisateur existe dans notre base de données
      const dbUser = await authHelpers.getDatabaseUser(data.user);
      if (!dbUser) {
        // Créer l'utilisateur dans notre base de données
        const createdUser = await authHelpers.createDatabaseUser(data.user, {
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: data.user.user_metadata?.role || 'merchant',
        });

        if (!createdUser) {
          throw new AccountNotFoundError();
        }

        return {
          success: true,
          user: this.mapToAppUser(createdUser, data.user),
          session: data.session,
          requiresProfile: true,
        };
      }

      // Vérifier si le profil est complet
      const hasCompleteProfile = await authHelpers.hasCompleteProfile(data.user.id);
      if (!hasCompleteProfile) {
        return {
          success: true,
          user: this.mapToAppUser(dbUser, data.user),
          session: data.session,
          requiresProfile: true,
        };
      }

      // Vérifier si l'email est vérifié
      if (!authHelpers.isEmailVerified(data.user)) {
        return {
          success: true,
          user: this.mapToAppUser(dbUser, data.user),
          session: data.session,
          requiresVerification: true,
        };
      }

      return {
        success: true,
        user: this.mapToAppUser(dbUser, data.user),
        session: data.session,
      };

    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR', error),
      };
    }
  }

  // Inscription
  static async signup(signupData: SignupData): Promise<AuthResult> {
    try {
      // Validation des données
      const validationErrors = this.validateSignupData(signupData);
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors);
      }

      // Inscription avec Supabase
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            role: signupData.role,
            phone: signupData.phone,
            location: signupData.location,
          },
          emailRedirectTo: `${window.location.origin}/signup/verify`,
        },
      });

      if (error) {
        throw this.handleSupabaseError(error);
      }

      if (!data.user) {
        throw new AuthError('Échec de l\'inscription', 'SIGNUP_FAILED');
      }

      // L'utilisateur est créé mais nécessite une vérification d'email
      return {
        success: true,
        user: this.mapToAppUser(
          {
            id: data.user.id,
            email: data.user.email!,
            name: signupData.name,
            role: signupData.role,
            status: 'pending',
            phone: signupData.phone,
            location: signupData.location,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
          },
          data.user
        ),
        requiresVerification: true,
        requiresProfile: true,
      };

    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR', error),
      };
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Ne pas bloquer la déconnexion en cas d'erreur
    }
  }

  // Rafraîchir le token
  static async refreshToken(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw this.handleSupabaseError(error);
      }

      if (!data.user || !data.session) {
        throw new AuthError('Échec du rafraîchissement', 'REFRESH_FAILED');
      }

      const dbUser = await authHelpers.getDatabaseUser(data.user);
      if (!dbUser) {
        throw new AccountNotFoundError();
      }

      return {
        success: true,
        user: this.mapToAppUser(dbUser, data.user),
        session: data.session,
      };

    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new AuthError('Échec du rafraîchissement', 'REFRESH_FAILED'),
      };
    }
  }

  // Obtenir l'utilisateur actuel
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const dbUser = await authHelpers.getDatabaseUser(user);
      if (!dbUser) {
        return null;
      }

      return this.mapToAppUser(dbUser, user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Vérifier la session actuelle
  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return false;
      }

      // Vérifier si le token est encore valide
      const { data } = await supabase.auth.getUser(session.access_token);
      return !!data.user;
    } catch (error) {
      console.error('Erreur lors de la validation de la session:', error);
      return false;
    }
  }

  // Réinitialiser le mot de passe
  static async resetPassword(email: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw this.handleSupabaseError(error);
      }

      return { success: true };

    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new AuthError('Échec de l\'envoi de l\'email de réinitialisation', 'RESET_PASSWORD_FAILED'),
      };
    }
  }

  // Mettre à jour le mot de passe
  static async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw this.handleSupabaseError(error);
      }

      return { success: true };

    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new AuthError('Échec de la mise à jour du mot de passe', 'UPDATE_PASSWORD_FAILED'),
      };
    }
  }

  // Mettre à jour le profil
  static async updateProfile(userData: Partial<DatabaseUser>): Promise<AuthResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new AuthError('Utilisateur non connecté', 'USER_NOT_FOUND');
      }

      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new AuthError(error.message, 'UPDATE_PROFILE_FAILED');
      }

      // Mettre à jour les métadonnées de l'utilisateur Supabase
      await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone: userData.phone,
        },
      });

      return {
        success: true,
        user: this.mapToAppUser(data as DatabaseUser, user),
      };

    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error };
      }
      return {
        success: false,
        error: new AuthError('Échec de la mise à jour du profil', 'UPDATE_PROFILE_FAILED'),
      };
    }
  }

  // Méthodes utilitaires privées
  private static validateCredentials(email: string, password: string): string[] {
    const errors: string[] = [];

    if (!email || !email.trim()) {
      errors.push('L\'email est requis');
    } else if (!this.isValidEmail(email)) {
      errors.push('L\'email n\'est pas valide');
    }

    if (!password || password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    return errors;
  }

  private static validateSignupData(data: SignupData): string[] {
    const errors: string[] = [];

    // Valider les champs de base
    errors.push(...this.validateCredentials(data.email, data.password));

    if (!data.name || !data.name.trim()) {
      errors.push('Le nom est requis');
    }

    if (!data.role || !['merchant', 'producer', 'cooperative'].includes(data.role)) {
      errors.push('Le rôle est invalide');
    }

    // Valider le téléphone si fourni
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Le numéro de téléphone n\'est pas valide');
    }

    return errors;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  }

  private static handleSupabaseError(error: any): AuthError {
    switch (error.code) {
      case 'invalid_credentials':
      case 'invalid_login_credentials':
        return new InvalidCredentialsError();

      case 'email_not_confirmed':
        return new AccountNotVerifiedError();

      case 'email_provider_disabled':
        return new AuthError(
          'L\'authentification par email est désactivée. Veuillez utiliser Mobile Money ou WhatsApp.',
          'EMAIL_PROVIDER_DISABLED'
        );

      case 'phone_provider_disabled':
        return new AuthError(
          'L\'authentification par téléphone n\'est pas configurée. Veuillez utiliser Mobile Money.',
          'PHONE_PROVIDER_DISABLED'
        );

      case 'anonymous_provider_disabled':
        return new AuthError(
          'L\'authentification anonyme n\'est pas activée. Veuillez contacter l\'administrateur.',
          'ANONYMOUS_PROVIDER_DISABLED'
        );

      case 'too_many_requests':
      case 'over_request_rate_limit':
        return new RateLimitError(60); // 60 secondes par défaut

      case 'user_not_found':
        return new AccountNotFoundError();

      case 'network_error':
        return new NetworkError();

      default:
        return new AuthError(error.message || 'Une erreur est survenue', error.code);
    }
  }

  private static mapToAppUser(dbUser: DatabaseUser, supabaseUser: SupabaseUser): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      status: dbUser.status,
      phone: dbUser.phone,
      location: dbUser.location,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
      // Ajouter les métadonnées Supabase si nécessaire
      metadata: {
        emailVerified: !!supabaseUser.email_confirmed_at,
        phoneVerified: !!supabaseUser.phone_confirmed_at,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        provider: supabaseUser.app_metadata?.provider,
      },
    };
  }
}

export default SupabaseAuthService;