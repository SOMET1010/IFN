import * as React from 'react';
import { User } from '@/types';
import { SupabaseAuthService, AuthError, AuthResult, SignupData } from '@/services/supabase/authService';
import { supabase } from '@/services/supabase/supabaseClient';
import { socialAuthService } from '@/services/auth/socialAuthService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  loginWithMobileMoney: (sessionId: string, otp: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<AuthResult>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: AuthError | null;
  clearError: () => void;
  refreshSession: () => Promise<boolean>;
  isAuthenticated: boolean;
  requiresProfile: boolean;
  requiresVerification: boolean;
  updateUser: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  requiresProfile: boolean;
  requiresVerification: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    requiresProfile: false,
    requiresVerification: false,
  });

  // Initialize auth state and listen to Supabase auth changes
  React.useEffect(() => {
    const initializeAuth = async () => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const currentUser = await SupabaseAuthService.getCurrentUser();
          if (currentUser) {
            setState(prev => ({
              ...prev,
              user: currentUser,
              isLoading: false,
            }));
          } else {
            setState(prev => ({
              ...prev,
              user: null,
              isLoading: false,
              requiresProfile: true,
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          error: new AuthError('Échec de l\'initialisation de l\'authentification', 'INIT_ERROR'),
        }));
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const currentUser = await SupabaseAuthService.getCurrentUser();
          if (currentUser) {
            setState(prev => ({
              ...prev,
              user: currentUser,
              isLoading: false,
              error: null,
            }));
          } else {
            setState(prev => ({
              ...prev,
              user: null,
              isLoading: false,
              requiresProfile: true,
              error: null,
            }));
          }
        } catch (error) {
          console.error('Error getting current user after sign in:', error);
          setState(prev => ({
            ...prev,
            user: null,
            isLoading: false,
            error: new AuthError('Erreur lors de la récupération du profil', 'PROFILE_ERROR'),
          }));
        }
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({
          ...prev,
          user: null,
          isLoading: false,
          requiresProfile: false,
          requiresVerification: false,
          error: null,
        }));
      } else if (event === 'TOKEN_REFRESHED') {
        // Rafraîchir l'utilisateur avec les nouvelles données
        try {
          const currentUser = await SupabaseAuthService.getCurrentUser();
          if (currentUser) {
            setState(prev => ({
              ...prev,
              user: currentUser,
            }));
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await SupabaseAuthService.login(email, password, rememberMe);

      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
          requiresProfile: result.requiresProfile || false,
          requiresVerification: result.requiresVerification || false,
          isLoading: false,
        }));
        return true;
      } else if (result.error) {
        setState(prev => ({
          ...prev,
          error: result.error,
          isLoading: false,
        }));
        return false;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;

    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        error: new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR'),
        isLoading: false,
      }));
      return false;
    }
  };

  const loginWithMobileMoney = async (sessionId: string, otp: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await socialAuthService.verifyMobileMoneyOTP(sessionId, otp);

      if (result.success && result.userId) {
        const currentUser = await SupabaseAuthService.getCurrentUser();
        if (currentUser) {
          setState(prev => ({
            ...prev,
            user: currentUser,
            isLoading: false,
          }));
          return true;
        }
      }

      setState(prev => ({
        ...prev,
        error: new AuthError(result.error || 'Erreur de connexion Mobile Money', 'MOBILE_MONEY_ERROR'),
        isLoading: false,
      }));
      return false;

    } catch (error) {
      console.error('Mobile Money login error:', error);
      setState(prev => ({
        ...prev,
        error: new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR'),
        isLoading: false,
      }));
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await SupabaseAuthService.signup(data);

      if (result.success) {
        setState(prev => ({
          ...prev,
          user: result.user || null,
          requiresProfile: result.requiresProfile || false,
          requiresVerification: result.requiresVerification || false,
          isLoading: false,
        }));
      } else if (result.error) {
        setState(prev => ({
          ...prev,
          error: result.error,
          isLoading: false,
        }));
      }

      return result;

    } catch (error) {
      console.error('Signup error:', error);
      const authResult: AuthResult = {
        success: false,
        error: new AuthError('Une erreur inattendue est survenue', 'UNKNOWN_ERROR'),
      };
      setState(prev => ({
        ...prev,
        error: authResult.error,
        isLoading: false,
      }));
      return authResult;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await SupabaseAuthService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: null,
        requiresProfile: false,
        requiresVerification: false,
      }));
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      const result = await SupabaseAuthService.refreshToken();
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
          requiresProfile: false,
          requiresVerification: false,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const result = await SupabaseAuthService.updateProfile(userData);
      if (result.success && result.user) {
        setState(prev => ({
          ...prev,
          user: result.user,
        }));
      } else if (result.error) {
        setState(prev => ({
          ...prev,
          error: result.error,
        }));
      }
    } catch (error) {
      console.error('Update user error:', error);
      setState(prev => ({
        ...prev,
        error: new AuthError('Erreur lors de la mise à jour du profil', 'UPDATE_ERROR'),
      }));
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await SupabaseAuthService.resetPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      const authResult: AuthResult = {
        success: false,
        error: new AuthError('Erreur lors de la réinitialisation du mot de passe', 'RESET_ERROR'),
      };
      setState(prev => ({
        ...prev,
        error: authResult.error,
        isLoading: false,
      }));
      return authResult;
    }
  };

  const updatePassword = async (newPassword: string): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await SupabaseAuthService.updatePassword(newPassword);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      console.error('Update password error:', error);
      const authResult: AuthResult = {
        success: false,
        error: new AuthError('Erreur lors de la mise à jour du mot de passe', 'UPDATE_PASSWORD_ERROR'),
      };
      setState(prev => ({
        ...prev,
        error: authResult.error,
        isLoading: false,
      }));
      return authResult;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value = React.useMemo(() => ({
    user: state.user,
    login,
    loginWithMobileMoney,
    signup,
    logout,
    isLoading: state.isLoading,
    error: state.error,
    clearError,
    refreshSession,
    isAuthenticated: !!state.user,
    requiresProfile: state.requiresProfile,
    requiresVerification: state.requiresVerification,
    updateUser,
    resetPassword,
    updatePassword,
  }), [
    state.user,
    state.isLoading,
    state.error,
    state.requiresProfile,
    state.requiresVerification,
    login,
    loginWithMobileMoney,
    signup,
    logout,
    clearError,
    refreshSession,
    updateUser,
    resetPassword,
    updatePassword,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};