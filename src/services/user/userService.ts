import { User } from '@/types';

export interface UserPreferences {
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showOnlineStatus: boolean;
    shareActivity: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    sessionTimeout: number;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceType?: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    deviceType: string;
  };
  location?: string;
  ipAddress?: string;
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
}

export class UserService {
  private static readonly USER_PREFERENCES_KEY = 'user_preferences';
  private static readonly USER_ACTIVITY_KEY = 'user_activity';
  private static readonly USER_SESSIONS_KEY = 'user_sessions';

  // User preferences management
  static getUserPreferences(userId: string): UserPreferences | null {
    try {
      const stored = localStorage.getItem(`${this.USER_PREFERENCES_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static saveUserPreferences(userId: string, preferences: UserPreferences): void {
    localStorage.setItem(`${this.USER_PREFERENCES_KEY}_${userId}`, JSON.stringify(preferences));
  }

  static updateUserPreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
    const current = this.getUserPreferences(userId) || this.getDefaultPreferences();
    const updated = { ...current, ...updates };
    this.saveUserPreferences(userId, updated);
    return updated;
  }

  private static getDefaultPreferences(): UserPreferences {
    return {
      language: 'fr',
      theme: 'auto',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisibility: 'private',
        showOnlineStatus: true,
        shareActivity: false
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 30 // minutes
      }
    };
  }

  // Activity logging
  static logUserActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): void {
    const activities = this.getUserActivities(activity.userId);
    const newActivity: UserActivity = {
      ...activity,
      id: this.generateId(),
      timestamp: Date.now()
    };

    activities.unshift(newActivity);

    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(1000);
    }

    localStorage.setItem(`${this.USER_ACTIVITY_KEY}_${activity.userId}`, JSON.stringify(activities));
  }

  static getUserActivities(userId: string, limit = 50): UserActivity[] {
    try {
      const stored = localStorage.getItem(`${this.USER_ACTIVITY_KEY}_${userId}`);
      const activities = stored ? JSON.parse(stored) : [];
      return activities.slice(0, limit);
    } catch {
      return [];
    }
  }

  // Session management
  static createUserSession(userId: string, deviceInfo: SessionInfo['deviceInfo'], location?: string, ipAddress?: string): SessionInfo {
    const sessions = this.getUserSessions(userId);
    const newSession: SessionInfo = {
      id: this.generateId(),
      userId,
      deviceInfo,
      location,
      ipAddress,
      isActive: true,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    sessions.push(newSession);

    // Remove expired sessions
    const now = Date.now();
    const activeSessions = sessions.filter(session => session.expiresAt > now);

    localStorage.setItem(`${this.USER_SESSIONS_KEY}_${userId}`, JSON.stringify(activeSessions));
    return newSession;
  }

  static getUserSessions(userId: string): SessionInfo[] {
    try {
      const stored = localStorage.getItem(`${this.USER_SESSIONS_KEY}_${userId}`);
      const sessions = stored ? JSON.parse(stored) : [];

      // Filter out expired sessions
      const now = Date.now();
      return sessions.filter(session => session.expiresAt > now);
    } catch {
      return [];
    }
  }

  static updateSessionActivity(sessionId: string): void {
    // This would typically be called periodically while user is active
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith(this.USER_SESSIONS_KEY));

    for (const userKey of allUsers) {
      try {
        const sessions = JSON.parse(localStorage.getItem(userKey) || '[]');
        const sessionIndex = sessions.findIndex((s: SessionInfo) => s.id === sessionId);

        if (sessionIndex !== -1) {
          sessions[sessionIndex].lastActivity = Date.now();
          localStorage.setItem(userKey, JSON.stringify(sessions));
          break;
        }
      } catch {
        continue;
      }
    }
  }

  static terminateSession(userId: string, sessionId: string): boolean {
    const sessions = this.getUserSessions(userId);
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex !== -1) {
      sessions[sessionIndex].isActive = false;
      localStorage.setItem(`${this.USER_SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));
      return true;
    }

    return false;
  }

  static terminateAllOtherSessions(userId: string, currentSessionId: string): number {
    const sessions = this.getUserSessions(userId);
    let terminatedCount = 0;

    sessions.forEach(session => {
      if (session.id !== currentSessionId && session.isActive) {
        session.isActive = false;
        terminatedCount++;
      }
    });

    if (terminatedCount > 0) {
      localStorage.setItem(`${this.USER_SESSIONS_KEY}_${userId}`, JSON.stringify(sessions));
    }

    return terminatedCount;
  }

  // User profile management
  static updateUserProfile(userId: string, updates: Partial<User>): User | null {
    // In a real app, this would call an API
    // For now, we'll update the user in the token
    return null;
  }

  static getUserSecuritySettings(userId: string): UserPreferences['security'] | null {
    const preferences = this.getUserPreferences(userId);
    return preferences?.security || null;
  }

  static updateUserSecuritySettings(userId: string, settings: UserPreferences['security']): void {
    const preferences = this.getUserPreferences(userId) || this.getDefaultPreferences();
    preferences.security = settings;
    this.saveUserPreferences(userId, preferences);
  }

  // Helper methods
  private static generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static isSessionValid(userId: string, sessionId: string): boolean {
    const sessions = this.getUserSessions(userId);
    const session = sessions.find(s => s.id === sessionId);

    if (!session) return false;
    if (!session.isActive) return false;
    if (session.expiresAt < Date.now()) return false;

    return true;
  }

  static getActiveSessionCount(userId: string): number {
    const sessions = this.getUserSessions(userId);
    return sessions.filter(s => s.isActive && s.expiresAt > Date.now()).length;
  }

  // Security monitoring
  static detectSuspiciousActivity(userId: string): {
    isSuspicious: boolean;
    reasons: string[];
  } {
    const activities = this.getUserActivities(userId, 20);
    const sessions = this.getUserSessions(userId);
    const reasons: string[] = [];

    // Check for multiple failed login attempts
    const failedLogins = activities.filter(a => a.action.includes('failed_login'));
    if (failedLogins.length >= 5) {
      reasons.push('Multiple failed login attempts');
    }

    // Check for sessions from different locations
    const uniqueLocations = new Set(sessions.map(s => s.location).filter(Boolean));
    if (uniqueLocations.size > 3) {
      reasons.push('Sessions from multiple locations');
    }

    // Check for unusual time patterns
    const recentActivities = activities.filter(a => Date.now() - a.timestamp < 24 * 60 * 60 * 1000);
    if (recentActivities.length > 100) {
      reasons.push('Unusually high activity');
    }

    return {
      isSuspicious: reasons.length > 0,
      reasons
    };
  }
}