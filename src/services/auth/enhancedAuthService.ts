import { User } from '@/types';
import { SecureAuthService } from '@/services/security/secureAuthService';
import { UserService } from '@/services/user/userService';
import { validateLoginForm, validateRegisterForm } from '@/lib/validations';

// Enhanced error types
export class AuthError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR', public details?: unknown) {
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

export class AccountLockedError extends AuthError {
  constructor() {
    super('Votre compte est temporairement bloqué. Veuillez réessayer plus tard.', 'ACCOUNT_LOCKED');
    this.name = 'AccountLockedError';
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
    super('Erreurs de validation', 'VALIDATION_ERROR', { validationErrors });
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

export class AccountNotVerifiedError extends AuthError {
  constructor() {
    super('Veuillez vérifier votre email avant de vous connecter', 'ACCOUNT_NOT_VERIFIED');
    this.name = 'AccountNotVerifiedError';
  }
}

export class AccountDisabledError extends AuthError {
  constructor() {
    super('Votre compte a été désactivé', 'ACCOUNT_DISABLED');
    this.name = 'AccountDisabledError';
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super('Votre session a expiré', 'SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

// Enhanced rate limiting
class EnhancedRateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number; lockUntil?: number }> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour

  isLocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;

    // Check if lock period has expired
    if (record.lockUntil && Date.now() < record.lockUntil) {
      return true;
    }

    // Check if attempt window has expired
    if (Date.now() - record.lastAttempt > this.ATTEMPT_WINDOW) {
      this.attempts.delete(identifier);
      return false;
    }

    return record.count >= this.MAX_ATTEMPTS;
  }

  recordAttempt(identifier: string): { success: boolean; remainingAttempts: number; lockedUntil?: number } {
    if (this.isLocked(identifier)) {
      const record = this.attempts.get(identifier);
      return {
        success: false,
        remainingAttempts: 0,
        lockedUntil: record?.lockUntil
      };
    }

    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();

    // Lock if max attempts reached
    if (record.count >= this.MAX_ATTEMPTS) {
      record.lockUntil = Date.now() + this.LOCK_DURATION;
      this.attempts.set(identifier, record);
      return {
        success: false,
        remainingAttempts: 0,
        lockedUntil: record.lockUntil
      };
    }

    this.attempts.set(identifier, record);
    return {
      success: true,
      remainingAttempts: this.MAX_ATTEMPTS - record.count
    };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.MAX_ATTEMPTS;

    if (Date.now() - record.lastAttempt > this.ATTEMPT_WINDOW) {
      return this.MAX_ATTEMPTS;
    }

    return Math.max(0, this.MAX_ATTEMPTS - record.count);
  }
}

// Enhanced user database interface
interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'producer' | 'merchant' | 'cooperative' | 'admin';
  location: string;
  status: 'active' | 'pending' | 'inactive';
  password: string;
  createdAt: number;
  lastLogin?: number;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: Record<string, unknown>;
  security: {
    loginAttempts: number;
    lastFailedLogin?: number;
    passwordChangedAt: number;
    sessions: string[];
  };
}

export class EnhancedAuthServiceAPI {
  private static rateLimiter = new EnhancedRateLimiter();
  private static users: Map<string, UserAccount> = new Map();

  // Initialize with mock users
  private static initializeMockUsers(): void {
    if (this.users.size > 0) return;

    const mockUsers: UserAccount[] = [
      {
        id: '1',
        name: 'Kouadio Amani',
        email: 'kouadio@agritrack.ci',
        phone: '+225 01 02 03 04',
        role: 'producer',
        location: 'Abidjan',
        status: 'active',
        password: this.hashPassword('password'),
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        lastLogin: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        isVerified: true,
        twoFactorEnabled: false,
        preferences: {},
        security: {
          loginAttempts: 0,
          passwordChangedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
          sessions: []
        }
      },
      {
        id: '2',
        name: 'Fatou Traoré',
        email: 'fatou@marketci.ci',
        phone: '+225 05 06 07 08',
        role: 'merchant',
        location: 'Bouaké',
        status: 'active',
        password: this.hashPassword('password'),
        createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
        lastLogin: Date.now() - 6 * 60 * 60 * 1000,
        isVerified: true,
        twoFactorEnabled: false,
        preferences: {},
        security: {
          loginAttempts: 0,
          passwordChangedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
          sessions: []
        }
      },
      {
        id: '3',
        name: 'Yao N\'Guessan',
        email: 'yao@cooperative.ci',
        phone: '+225 09 10 11 12',
        role: 'cooperative',
        location: 'Korhogo',
        status: 'active',
        password: this.hashPassword('password'),
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
        lastLogin: Date.now() - 1 * 24 * 60 * 60 * 1000,
        isVerified: true,
        twoFactorEnabled: false,
        preferences: {},
        security: {
          loginAttempts: 0,
          passwordChangedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
          sessions: []
        }
      },
      {
        id: '4',
        name: 'Admin Système',
        email: 'admin@inclusion.ci',
        phone: '+225 13 14 15 16',
        role: 'admin',
        location: 'Abidjan',
        status: 'active',
        password: this.hashPassword('password'),
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
        lastLogin: Date.now() - 30 * 60 * 1000,
        isVerified: true,
        twoFactorEnabled: false,
        preferences: {},
        security: {
          loginAttempts: 0,
          passwordChangedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
          sessions: []
        }
      }
    ];

    mockUsers.forEach(user => {
      this.users.set(user.email, user);
      this.users.set(user.phone, user);
    });
  }

  private static hashPassword(password: string): string {
    // In production, use proper password hashing like bcrypt
    return btoa(password + 'salt'); // This is NOT secure, just for demo
  }

  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  static async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ user: User; token: string; sessionId: string }> {
    this.initializeMockUsers();

    try {
      // Validate input
      const validationErrors = validateLoginForm({ email, password });
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors);
      }

      // Check rate limiting
      const rateLimitKey = email.toLowerCase();
      const rateLimitResult = this.rateLimiter.recordAttempt(rateLimitKey);

      if (!rateLimitResult.success) {
        throw new AccountLockedError();
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));

      // Simulate network error (5% chance for demo)
      if (Math.random() < 0.05) {
        throw new NetworkError();
      }

      // Find user
      const userAccount = this.users.get(email) || this.users.get(email.replace(/\s/g, ''));
      if (!userAccount) {
        throw new InvalidCredentialsError();
      }

      // Check account status
      if (userAccount.status === 'inactive') {
        throw new AccountDisabledError();
      }

      if (!userAccount.isVerified) {
        throw new AccountNotVerifiedError();
      }

      // Verify password
      if (!this.verifyPassword(password, userAccount.password)) {
        // Update failed login attempts
        userAccount.security.loginAttempts++;
        userAccount.security.lastFailedLogin = Date.now();

        if (userAccount.security.loginAttempts >= 5) {
          userAccount.status = 'inactive';
        }

        this.users.set(userAccount.email, userAccount);

        throw new InvalidCredentialsError();
      }

      // Reset rate limit on successful login
      this.rateLimiter.reset(rateLimitKey);

      // Update user account
      userAccount.lastLogin = Date.now();
      userAccount.security.loginAttempts = 0;
      userAccount.security.lastFailedLogin = undefined;
      this.users.set(userAccount.email, userAccount);

      // Create user session
      const sessionInfo = UserService.createUserSession(
        userAccount.id,
        {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          deviceType: this.getDeviceType()
        }
      );

      // Generate a simple token for demo purposes
      // In production, this should use proper JWT generation
      const tokenData = {
        user: {
          id: userAccount.id,
          name: userAccount.name,
          email: userAccount.email,
          role: userAccount.role,
          location: userAccount.location,
          phone: userAccount.phone,
          status: userAccount.status
        },
        exp: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000),
        iat: Date.now(),
        jti: this.generateUserId(),
        csrf: this.generateVerificationToken().substring(0, 16),
        rememberMe
      };
      
      const token = btoa(JSON.stringify(tokenData));

      // Save token
      SecureAuthService.saveSecureToken(token, rememberMe);

      // Log activity
      UserService.logUserActivity({
        userId: userAccount.id,
        action: 'successful_login',
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent,
        location: 'Unknown'
      });

      return {
        user: {
          id: userAccount.id,
          name: userAccount.name,
          email: userAccount.email,
          role: userAccount.role,
          location: userAccount.location,
          phone: userAccount.phone,
          status: userAccount.status
        },
        token,
        sessionId: sessionInfo.id
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR');
    }
  }

  static async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'producer' | 'merchant' | 'cooperative';
    location: string;
    // Champs supplémentaires pour les coopératives
    cooperativeName?: string;
    registrationNumber?: string;
    representativeName?: string;
    // Champs supplémentaires pour les individus
    firstName?: string;
    lastName?: string;
  }): Promise<{ user: User; verificationToken: string; additionalData?: Record<string, unknown> }> {
    this.initializeMockUsers();

    try {
      // Validate input
      const validationErrors = validateRegisterForm({
        ...userData,
        confirmPassword: userData.password,
        agreeToTerms: true
      });

      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors);
      }

      // Check if user already exists
      if (this.users.has(userData.email) || this.users.has(userData.phone)) {
        throw new AuthError('Un compte avec cet email ou numéro de téléphone existe déjà', 'USER_EXISTS');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Create new user account
      const newUserAccount: UserAccount = {
        id: this.generateUserId(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        location: userData.location,
        status: 'pending',
        password: this.hashPassword(userData.password),
        createdAt: Date.now(),
        isVerified: false,
        twoFactorEnabled: false,
        preferences: {},
        security: {
          loginAttempts: 0,
          passwordChangedAt: Date.now(),
          sessions: []
        }
      };

      // Store user
      this.users.set(userData.email, newUserAccount);
      this.users.set(userData.phone, newUserAccount);

      // Generate verification token
      const verificationToken = this.generateVerificationToken();

      // In a real app, send verification email
      console.log(`Verification token for ${userData.email}: ${verificationToken}`);

      // Log activity
      UserService.logUserActivity({
        userId: newUserAccount.id,
        action: 'account_created',
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent,
        location: 'Unknown'
      });

      return {
        user: {
          id: newUserAccount.id,
          name: newUserAccount.name,
          email: newUserAccount.email,
          role: newUserAccount.role,
          location: newUserAccount.location,
          phone: newUserAccount.phone,
          status: newUserAccount.status
        },
        verificationToken
      };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR');
    }
  }

  static async logout(sessionId?: string): Promise<void> {
    try {
      const user = SecureAuthService.getUserFromSecureToken();
      if (user && sessionId) {
        // Terminate session
        UserService.terminateSession(user.id, sessionId);

        // Log activity
        UserService.logUserActivity({
          userId: user.id,
          action: 'logout',
          deviceType: this.getDeviceType(),
          userAgent: navigator.userAgent,
          location: 'Unknown'
        });
      }

      // Remove all auth data
      SecureAuthService.removeAllAuthData();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      throw new AuthError('Erreur lors de la déconnexion', 'LOGOUT_ERROR');
    }
  }

  static async refreshToken(): Promise<{ user: User; token: string } | null> {
    try {
      const newToken = SecureAuthService.refreshSecureToken();
      if (!newToken) {
        return null;
      }

      const user = SecureAuthService.getUserFromSecureToken();
      if (!user) {
        return null;
      }

      return { user, token: newToken };

    } catch (error) {
      throw new AuthError('Erreur lors du rafraîchissement du token', 'REFRESH_ERROR');
    }
  }

  static async validateSession(): Promise<boolean> {
    try {
      const isValid = SecureAuthService.isSecureTokenValid();

      if (!isValid) {
        SecureAuthService.removeAllAuthData();
        return false;
      }

      // Simulate session validation
      await new Promise(resolve => setTimeout(resolve, 200));

      return true;

    } catch (error) {
      SecureAuthService.removeAllAuthData();
      return false;
    }
  }

  static getCurrentUser(): User | null {
    return SecureAuthService.getUserFromSecureToken();
  }

  static isSessionExpiringSoon(): boolean {
    return SecureAuthService.isSecureTokenExpiringSoon();
  }

  static getRemainingAttempts(email: string): number {
    return this.rateLimiter.getRemainingAttempts(email.toLowerCase());
  }

  static async verifyEmail(token: string): Promise<boolean> {
    this.initializeMockUsers();

    // In a real app, verify the token against stored tokens
    // For demo, we'll just mark a random user as verified
    for (const [key, user] of this.users) {
      if (user.status === 'pending' && key.includes('@')) {
        user.status = 'active';
        user.isVerified = true;
        this.users.set(key, user);

        // Log activity
        UserService.logUserActivity({
          userId: user.id,
          action: 'email_verified',
          deviceType: this.getDeviceType(),
          userAgent: navigator.userAgent,
          location: 'Unknown'
        });

        return true;
      }
    }

    return false;
  }

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    this.initializeMockUsers();

    const userAccount = this.users.get(email);
    if (!userAccount) {
      // Don't reveal if user exists
      return { success: true, message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation' };
    }

    // Generate reset token
    const resetToken = this.generateVerificationToken();

    // In a real app, send reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // Log activity
    UserService.logUserActivity({
      userId: userAccount.id,
      action: 'password_reset_requested',
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      location: 'Unknown'
    });

    return { success: true, message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation' };
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    this.initializeMockUsers();

    // In a real app, verify the token and find the user
    // For demo, we'll just reset a random user's password
    for (const [key, user] of this.users) {
      if (key.includes('@') && user.status === 'active') {
        user.password = this.hashPassword(newPassword);
        user.security.passwordChangedAt = Date.now();
        this.users.set(key, user);

        // Log activity
        UserService.logUserActivity({
          userId: user.id,
          action: 'password_reset_completed',
          deviceType: this.getDeviceType(),
          userAgent: navigator.userAgent,
          location: 'Unknown'
        });

        return true;
      }
    }

    return false;
  }

  // Helper methods
  private static generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateVerificationToken(): string {
    return 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }

  private static getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  // Session management
  static getUserSessions(userId: string) {
    return UserService.getUserSessions(userId);
  }

  static terminateSession(userId: string, sessionId: string): boolean {
    return UserService.terminateSession(userId, sessionId);
  }

  static terminateAllOtherSessions(userId: string, currentSessionId: string): number {
    return UserService.terminateAllOtherSessions(userId, currentSessionId);
  }

  // Security monitoring
  static getUserSecurityStatus(userId: string): {
    isActive: boolean;
    suspiciousActivity: boolean;
    activeSessions: number;
    lastLogin?: number;
  } {
    const sessions = UserService.getUserSessions(userId);
    const securityStatus = UserService.detectSuspiciousActivity(userId);
    const userAccount = Array.from(this.users.values()).find(u => u.id === userId);

    return {
      isActive: userAccount?.status === 'active',
      suspiciousActivity: securityStatus.isSuspicious,
      activeSessions: sessions.filter(s => s.isActive).length,
      lastLogin: userAccount?.lastLogin
    };
  }
}
