import * as React from 'react';
import { UserPreferences } from '@/types';

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  addToFavorites: (category: string) => Promise<void>;
  removeFromFavorites: (category: string) => Promise<void>;
  addPreferredProducer: (producerId: string) => Promise<void>;
  removePreferredProducer: (producerId: string) => Promise<void>;
  updateNotificationSettings: (settings: Partial<UserPreferences['notification_settings']>) => Promise<void>;
  updateDeliveryPreferences: (preferences: Partial<UserPreferences['delivery_preferences']>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const UserPreferencesContext = React.createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = React.useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = React.useState<UserPreferences | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    } else {
      // Initialize with default preferences
      setPreferences({
        user_id: 'default-user',
        favorite_categories: [],
        preferred_producers: [],
        notification_settings: {
          email: true,
          sms: true,
          push: true,
          new_offers: true,
          price_drops: true,
          order_updates: true
        },
        delivery_preferences: {
          preferred_delivery_method: 'pickup',
          default_address: '',
          delivery_instructions: ''
        }
      });
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever preferences change
  React.useEffect(() => {
    if (preferences) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }
  }, [preferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setPreferences(prev => prev ? { ...prev, ...updates } : null);
    setLoading(false);
  };

  const addToFavorites = async (category: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setPreferences(prev => {
      if (!prev) return null;

      const newFavorites = prev.favorite_categories.includes(category)
        ? prev.favorite_categories
        : [...prev.favorite_categories, category];

      return { ...prev, favorite_categories: newFavorites };
    });

    setLoading(false);
  };

  const removeFromFavorites = async (category: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setPreferences(prev => {
      if (!prev) return null;

      const newFavorites = prev.favorite_categories.filter(cat => cat !== category);
      return { ...prev, favorite_categories: newFavorites };
    });

    setLoading(false);
  };

  const addPreferredProducer = async (producerId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setPreferences(prev => {
      if (!prev) return null;

      const newPreferred = prev.preferred_producers.includes(producerId)
        ? prev.preferred_producers
        : [...prev.preferred_producers, producerId];

      return { ...prev, preferred_producers: newPreferred };
    });

    setLoading(false);
  };

  const removePreferredProducer = async (producerId: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setPreferences(prev => {
      if (!prev) return null;

      const newPreferred = prev.preferred_producers.filter(id => id !== producerId);
      return { ...prev, preferred_producers: newPreferred };
    });

    setLoading(false);
  };

  const updateNotificationSettings = async (settings: Partial<UserPreferences['notification_settings']>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setPreferences(prev => {
      if (!prev) return null;

      return {
        ...prev,
        notification_settings: {
          ...prev.notification_settings,
          ...settings
        }
      };
    });

    setLoading(false);
  };

  const updateDeliveryPreferences = async (prefs: Partial<UserPreferences['delivery_preferences']>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setPreferences(prev => {
      if (!prev) return null;

      return {
        ...prev,
        delivery_preferences: {
          ...prev.delivery_preferences,
          ...prefs
        }
      };
    });

    setLoading(false);
  };

  const resetPreferences = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const defaultPreferences: UserPreferences = {
      user_id: 'default-user',
      favorite_categories: [],
      preferred_producers: [],
      notification_settings: {
        email: true,
        sms: true,
        push: true,
        new_offers: true,
        price_drops: true,
        order_updates: true
      },
      delivery_preferences: {
        preferred_delivery_method: 'pickup',
        default_address: '',
        delivery_instructions: ''
      }
    };

    setPreferences(defaultPreferences);
    setLoading(false);
  };

  return (
    <UserPreferencesContext.Provider value={{
      preferences,
      loading,
      updatePreferences,
      addToFavorites,
      removeFromFavorites,
      addPreferredProducer,
      removePreferredProducer,
      updateNotificationSettings,
      updateDeliveryPreferences,
      resetPreferences
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};