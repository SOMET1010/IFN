import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

// Hook pour gérer l'état de chargement et les erreurs
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    asyncFunction()
      .then((result) => {
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => asyncFunction() };
}

// Hook pour l'authentification
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

// Hook pour les coopératives
export function useCooperatives() {
  const { data, loading, error, refetch } = useAsync(
    async () => {
      const { data, error } = await supabase
        .from('cooperatives')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    []
  );

  return { cooperatives: data, loading, error, refetch };
}

// Hook pour les membres d'une coopérative
export function useMembers(cooperativeId: string | null) {
  const { data, loading, error, refetch } = useAsync(
    async () => {
      if (!cooperativeId) return [];

      const { data, error } = await supabase
        .from('cooperative_members')
        .select('*')
        .eq('cooperative_id', cooperativeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    [cooperativeId]
  );

  return { members: data, loading, error, refetch };
}

// Hook pour les offres
export function useOffers(cooperativeId?: string) {
  const { data, loading, error, refetch } = useAsync(
    async () => {
      let query = supabase
        .from('grouped_offers')
        .select('*')
        .in('status', ['active', 'negotiating']);

      if (cooperativeId) {
        query = query.eq('cooperative_id', cooperativeId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    [cooperativeId]
  );

  return { offers: data, loading, error, refetch };
}

// Hook pour les négociations
export function useNegotiations(cooperativeId?: string, buyerId?: string) {
  const { data, loading, error, refetch } = useAsync(
    async () => {
      let query = supabase.from('negotiations').select('*');

      if (cooperativeId) {
        query = query.eq('cooperative_id', cooperativeId);
      } else if (buyerId) {
        query = query.eq('buyer_id', buyerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    [cooperativeId, buyerId]
  );

  return { negotiations: data, loading, error, refetch };
}

// Hook pour les temps réel (subscriptions)
export function useRealtimeSubscription<T>(
  table: string,
  filter?: { column: string; value: any },
  callback?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    // Récupérer les données initiales
    const fetchInitialData = async () => {
      let query = supabase.from(table).select('*');

      if (filter) {
        query = query.eq(filter.column, filter.value);
      }

      const { data: initialData } = await query;
      if (initialData) {
        setData(initialData as T[]);
      }
    };

    fetchInitialData();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload) => {
          if (callback) {
            callback(payload);
          }

          // Mettre à jour les données locales
          if (payload.eventType === 'INSERT') {
            setData((prev) => [...prev, payload.new as T]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item: any) =>
                item.id === payload.new.id ? (payload.new as T) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item: any) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value]);

  return { data };
}

// Hook pour uploader des fichiers
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const upload = async (
    bucket: string,
    path: string,
    file: File
  ): Promise<string | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      setProgress(100);
      setUploading(false);
      return publicUrl;
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      return null;
    }
  };

  return { upload, uploading, progress, error };
}

// Hook pour les mutations (create, update, delete)
export function useMutation<T, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (variables: TVariables): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return null;
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return { mutate, loading, error, data, reset };
}

