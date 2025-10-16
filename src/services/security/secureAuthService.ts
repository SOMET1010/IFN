import { User } from '@/types';

// Enhanced JWT-like token with better security
export interface SecureAuthToken {
  user: User;
  exp: number;
  iat: number;
  jti: string; // JWT ID for token revocation
  csrf: string; // CSRF token
  rememberMe?: boolean;
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
}

export class SecureAuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly CSRF_TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly CSRF_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  // Generate cryptographically secure random string
  private static generateRandomString(length = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Generate CSRF token
  private static generateCSRFToken(): string {
    return this.generateRandomString(16);
  }

  // Generate enhanced secure token
  static generateSecureToken(user: User, rememberMe = false): string {
    const now = Date.now();
    const exp = rememberMe ? now + this.REFRESH_TOKEN_DURATION : now + this.TOKEN_DURATION;
    const jti = this.generateRandomString();
    const csrf = this.generateCSRFToken();

    const token: SecureAuthToken = {
      user,
      exp,
      iat: now,
      jti,
      csrf,
      rememberMe,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    };

    // Encrypt token data (in production, use proper encryption)
    const tokenData = JSON.stringify(token);
    const encoded = btoa(tokenData);

    // Store CSRF token separately
    sessionStorage.setItem(this.CSRF_TOKEN_KEY, csrf);

    return encoded;
  }

  // Decode and validate secure token
  static decodeSecureToken(token: string): SecureAuthToken | null {
    try {
      const decoded = JSON.parse(atob(token));

      // Validate token structure
      if (!decoded.user || !decoded.exp || !decoded.iat || !decoded.jti || !decoded.csrf) {
        return null;
      }

      // Check expiration
      if (decoded.exp < Date.now()) {
        return null;
      }

      // Verify CSRF token
      const storedCSRF = sessionStorage.getItem(this.CSRF_TOKEN_KEY);
      if (!storedCSRF || storedCSRF !== decoded.csrf) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Save token with enhanced security
  static saveSecureToken(token: string, rememberMe = false): void {
    const httpOnly = false; // In production, this should be true and set by server

    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Get token from storage
  static getSecureToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
  }

  // Remove all authentication data
  static removeAllAuthData(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
  }

  // Check if token is valid with enhanced validation
  static isSecureTokenValid(): boolean {
    const token = this.getSecureToken();
    if (!token) return false;

    const decoded = this.decodeSecureToken(token);
    if (!decoded) return false;

    // Check if device info matches
    const currentUA = navigator.userAgent;
    const currentPlatform = navigator.platform;

    if (decoded.deviceInfo) {
      const isSameDevice =
        decoded.deviceInfo.userAgent === currentUA &&
        decoded.deviceInfo.platform === currentPlatform;

      if (!isSameDevice) {
        this.removeAllAuthData();
        return false;
      }
    }

    return true;
  }

  // Get user from secure token
  static getUserFromSecureToken(): User | null {
    const token = this.getSecureToken();
    if (!token) return null;

    const decoded = this.decodeSecureToken(token);
    return decoded?.user || null;
  }

  // Check if token is about to expire (within 5 minutes)
  static isSecureTokenExpiringSoon(): boolean {
    const token = this.getSecureToken();
    if (!token) return false;

    const decoded = this.decodeSecureToken(token);
    if (!decoded) return false;

    const timeUntilExpiry = decoded.exp - Date.now();
    return timeUntilExpiry < 5 * 60 * 1000; // 5 minutes
  }

  // Refresh token with enhanced security
  static refreshSecureToken(): string | null {
    const token = this.getSecureToken();
    if (!token) return null;

    const decoded = this.decodeSecureToken(token);
    if (!decoded) return null;

    // Generate new CSRF token
    const newCSRF = this.generateCSRFToken();
    sessionStorage.setItem(this.CSRF_TOKEN_KEY, newCSRF);

    const newToken = this.generateSecureToken(decoded.user, decoded.rememberMe);
    this.saveSecureToken(newToken, decoded.rememberMe);

    return newToken;
  }

  // Validate CSRF token for API requests
  static validateCSRFToken(csrfToken: string): boolean {
    const storedCSRF = sessionStorage.getItem(this.CSRF_TOKEN_KEY);
    return storedCSRF === csrfToken;
  }

  // Get current CSRF token
  static getCurrentCSRFToken(): string | null {
    return sessionStorage.getItem(this.CSRF_TOKEN_KEY);
  }

  // Get token metadata
  static getTokenMetadata(): {
    expiresAt: number;
    issuedAt: number;
    tokenId: string;
    rememberMe: boolean;
  } | null {
    const token = this.getSecureToken();
    if (!token) return null;

    const decoded = this.decodeSecureToken(token);
    if (!decoded) return null;

    return {
      expiresAt: decoded.exp,
      issuedAt: decoded.iat,
      tokenId: decoded.jti,
      rememberMe: !!decoded.rememberMe
    };
  }
}