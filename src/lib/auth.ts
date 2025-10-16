import { User } from '@/types';

// Simple JWT-like token implementation for mock purposes
export interface AuthToken {
  user: User;
  exp: number;
  iat: number;
  rememberMe?: boolean;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Generate a mock JWT token
  static generateToken(user: User, rememberMe = false): string {
    const now = Date.now();
    const exp = rememberMe ? now + this.REFRESH_TOKEN_DURATION : now + this.TOKEN_DURATION;

    const token: AuthToken = {
      user,
      exp,
      iat: now,
      rememberMe
    };

    // Simple base64 encoding (in production, use proper JWT library)
    return btoa(JSON.stringify(token));
  }

  // Decode and validate token
  static decodeToken(token: string): AuthToken | null {
    try {
      const decoded = JSON.parse(atob(token));

      // Check expiration
      if (decoded.exp < Date.now()) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Save token to storage
  static saveToken(token: string, rememberMe = false): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Get token from storage
  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
  }

  // Remove token from storage
  static removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // Check if token is valid
  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    return decoded !== null;
  }

  // Get user from token
  static getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    return decoded?.user || null;
  }

  // Check if token is about to expire (within 5 minutes)
  static isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded) return false;

    const timeUntilExpiry = decoded.exp - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
  }

  // Refresh token (mock implementation)
  static refreshToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    const newToken = this.generateToken(decoded.user, decoded.rememberMe);
    this.saveToken(newToken, decoded.rememberMe);

    return newToken;
  }
}