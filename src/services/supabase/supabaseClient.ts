import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas configurées');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    storage: {
      getItem: (key) => {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      },
      setItem: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      removeItem: (key) => localStorage.removeItem(key),
    },
  },
});

// Types pour l'authentification Supabase
export interface SupabaseUser {
  id: string;
  email: string;
  phone?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  user_metadata: {
    name?: string;
    role?: string;
    full_name?: string;
    avatar_url?: string;
  };
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseUser;
}

export interface DatabaseUser {
  id: string;
  email: string | null;
  name: string;
  role: 'merchant' | 'producer' | 'cooperative' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  phone?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Fonctions utilitaires pour l'authentification
export const authHelpers = {
  // Convertir l'utilisateur Supabase en utilisateur de l'application
  async getDatabaseUser(supabaseUser: SupabaseUser): Promise<DatabaseUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
      }

      if (!data) {
        console.log('Aucun utilisateur trouvé dans la base de données pour:', supabaseUser.id);
        return null;
      }

      return data as DatabaseUser;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return null;
    }
  },

  // Créer un utilisateur dans la base de données
  async createDatabaseUser(supabaseUser: SupabaseUser, userData: Partial<DatabaseUser>): Promise<DatabaseUser | null> {
    try {
      // Extraire le téléphone et l'email depuis user_metadata ou userData
      const phone = userData.phone || supabaseUser.phone || supabaseUser.user_metadata?.phone;
      const email = supabaseUser.email || userData.email;

      // Générer un nom par défaut si non fourni
      const defaultName = phone
        ? `Utilisateur ${phone.slice(-4)}`
        : email?.split('@')[0] || 'Utilisateur';

      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: supabaseUser.id,
          email: email || null,
          name: userData.name || supabaseUser.user_metadata?.name || defaultName,
          role: userData.role || 'merchant',
          status: 'active',
          phone: phone,
          location: userData.location || '',
        }])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return null;
      }

      if (!data) {
        console.error('Aucune donnée retournée après la création de l\'utilisateur');
        return null;
      }

      return data as DatabaseUser;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur a un profil complet
  async hasCompleteProfile(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, name, phone, location')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      // Vérifier les champs requis selon le rôle
      if (!data.name || !data.role) {
        return false;
      }

      // Pour les marchands, vérifier s'ils ont un profil marchand
      if (data.role === 'merchant') {
        const { count } = await supabase
          .from('merchant_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        return (count || 0) > 0;
      }

      // Pour les producteurs, vérifier s'ils ont un profil producteur
      if (data.role === 'producer') {
        const { count } = await supabase
          .from('producer_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        return (count || 0) > 0;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error);
      return false;
    }
  },

  // Obtenir les permissions de l'utilisateur
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return [];
      }

      const permissions: string[] = [];

      // Permissions de base
      permissions.push('read');

      if (user.status === 'active') {
        permissions.push('write');

        // Permissions par rôle
        switch (user.role) {
          case 'admin':
            permissions.push('admin', 'manage_users', 'manage_system');
            break;
          case 'merchant':
            permissions.push('create_orders', 'manage_inventory', 'view_analytics');
            break;
          case 'producer':
            permissions.push('manage_products', 'manage_harvests', 'view_sales');
            break;
          case 'cooperative':
            permissions.push('manage_members', 'manage_orders', 'view_finances');
            break;
        }
      }

      return permissions;
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      return [];
    }
  },

  // Vérifier si l'email est vérifié
  isEmailVerified(supabaseUser: SupabaseUser): boolean {
    return !!supabaseUser.email_confirmed_at;
  },

  // Envoyer un email de vérification
  async sendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: supabase.auth.getUser().then(({ data }) => data.user?.email || ''),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erreur inattendue' };
    }
  },
};

export default supabase;