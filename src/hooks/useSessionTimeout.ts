import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthServiceAPI } from '@/services/authService';

interface UseSessionTimeoutOptions {
  onSessionExpiry?: () => void;
  warningBeforeExpiry?: number; // in minutes
  checkInterval?: number; // in seconds
}

export const useSessionTimeout = (options: UseSessionTimeoutOptions = {}) => {
  const { user, logout } = useAuth();
  const {
    onSessionExpiry,
    warningBeforeExpiry = 5,
    checkInterval = 30
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSessionExpiry = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (onSessionExpiry) {
      onSessionExpiry();
    } else {
      logout();
    }
  }, [logout, onSessionExpiry]);

  const checkSession = useCallback(async () => {
    if (!user) return;

    try {
      const isValid = await AuthServiceAPI.validateSession();

      if (!isValid) {
        handleSessionExpiry();
        return;
      }

      // Check if session is expiring soon
      if (AuthServiceAPI.isSessionExpiringSoon()) {
        // Show warning (implement your own warning logic here)
        console.warn('Session expiring soon');

        // Try to refresh token
        const refreshResult = await AuthServiceAPI.refreshToken();
        if (!refreshResult) {
          handleSessionExpiry();
        }
      }

    } catch (error) {
      console.error('Session check failed:', error);
      handleSessionExpiry();
    }
  }, [user, handleSessionExpiry]);

  const startSessionMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start periodic session checks
    intervalRef.current = setInterval(checkSession, checkInterval * 1000);

    // Initial check
    checkSession();
  }, [checkSession, checkInterval]);

  const stopSessionMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const resetSessionTimeout = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user) {
      startSessionMonitoring();
    } else {
      stopSessionMonitoring();
    }

    return () => {
      stopSessionMonitoring();
    };
  }, [user, startSessionMonitoring, stopSessionMonitoring]);

  // Listen for user activity
  useEffect(() => {
    if (!user) return;

    const handleUserActivity = () => {
      resetSessionTimeout();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, resetSessionTimeout]);

  return {
    checkSession,
    resetSessionTimeout,
    stopSessionMonitoring
  };
};