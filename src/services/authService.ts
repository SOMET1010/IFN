import { User } from '@/types';
import { AuthService } from '@/lib/auth';
import { validateLoginForm } from '@/lib/validations';

// Error types
export class AuthError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR') {
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
    super('Erreurs de validation', 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

// Rate limiting simulation
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  isLocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;

    if (Date.now() - record.lastAttempt > this.LOCK_DURATION) {
      this.attempts.delete(identifier);
      return false;
    }

    return record.count >= this.MAX_ATTEMPTS;
  }

  recordAttempt(identifier: string): boolean {
    if (this.isLocked(identifier)) {
      return false;
    }

    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };
    record.count++;
    record.lastAttempt = Date.now();
    this.attempts.set(identifier, record);

    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.MAX_ATTEMPTS;

    if (Date.now() - record.lastAttempt > this.LOCK_DURATION) {
      this.attempts.delete(identifier);
      return this.MAX_ATTEMPTS;
    }

    return Math.max(0, this.MAX_ATTEMPTS - record.count);
  }
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Kouadio Amani',
    email: 'kouadio@agritrack.ci',
    role: 'producer',
    location: 'Abidjan',
    phone: '+225 01 02 03 04',
    status: 'active'
  },
  {
    id: '2',
    name: 'Fatou Traoré',
    email: 'fatou@marketci.ci',
    role: 'merchant',
    location: 'Bouaké',
    phone: '+225 05 06 07 08',
    status: 'active'
  },
  {
    id: '3',
    name: 'Yao N\'Guessan',
    email: 'yao@cooperative.ci',
    role: 'cooperative',
    location: 'Korhogo',
    phone: '+225 09 10 11 12',
    status: 'active'
  },
  {
    id: '4',
    name: 'Admin Système',
    email: 'admin@inclusion.ci',
    role: 'admin',
    location: 'Abidjan',
    phone: '+225 13 14 15 16',
    status: 'active'
  }
];

const rateLimiter = new RateLimiter();

export class AuthServiceAPI {
  static async login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<{ user: User; token: string }> {
    try {
      // Validate input
      const validationErrors = validateLoginForm({ email, password });
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors);
      }

      // Check rate limiting
      const rateLimitKey = email.toLowerCase();
      if (!rateLimiter.recordAttempt(rateLimitKey)) {
        throw new AccountLockedError();
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Simulate network error (10% chance for demo)
      if (Math.random() < 0.1) {
        throw new NetworkError();
      }

      // Find user
      const foundUser = mockUsers.find(u =>
        u.email === email || u.phone === email
      );

      if (!foundUser || password !== 'password') {
        const remainingAttempts = rateLimiter.getRemainingAttempts(rateLimitKey);
        const message = remainingAttempts > 0
          ? `Email ou mot de passe incorrect. ${remainingAttempts} tentatives restantes.`
          : 'Email ou mot de passe incorrect.';
        throw new InvalidCredentialsError();
      }

      // Reset rate limit on successful login
      rateLimiter.attempts.delete(rateLimitKey);

      // Generate token
      const token = AuthService.generateToken(foundUser, rememberMe);
      AuthService.saveToken(token, rememberMe);

      return { user: foundUser, token };

    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR');
    }
  }

  static async logout(): Promise<void> {
    try {
      AuthService.removeToken();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      throw new AuthError('Erreur lors de la déconnexion', 'LOGOUT_ERROR');
    }
  }

  static async refreshToken(): Promise<{ user: User; token: string } | null> {
    try {
      const newToken = AuthService.refreshToken();
      if (!newToken) {
        return null;
      }

      const user = AuthService.getUserFromToken();
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
      // Check if token exists and is valid
      const isValid = AuthService.isTokenValid();

      if (!isValid) {
        AuthService.removeToken();
        return false;
      }

      // Simulate session validation
      await new Promise(resolve => setTimeout(resolve, 200));

      return true;

    } catch (error) {
      AuthService.removeToken();
      return false;
    }
  }

  static getCurrentUser(): User | null {
    return AuthService.getUserFromToken();
  }

  static isSessionExpiringSoon(): boolean {
    return AuthService.isTokenExpiringSoon();
  }

  static getRemainingAttempts(email: string): number {
    return rateLimiter.getRemainingAttempts(email.toLowerCase());
  }
}