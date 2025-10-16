import { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.agritrack.ci/v1';

export class BaseService<T> {
  protected endpoint: string;
  protected localStorageKey: string;

  constructor(endpoint: string, localStorageKey: string) {
    this.endpoint = endpoint;
    this.localStorageKey = localStorageKey;
  }

  // Gestion du localStorage
  protected getLocalStorageData(): T[] {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Erreur lecture localStorage ${this.localStorageKey}:`, error);
      return [];
    }
  }

  protected setLocalStorageData(data: T[]): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Erreur écriture localStorage ${this.localStorageKey}:`, error);
    }
  }

  // Gestion des appels API
  protected async apiRequest<R>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<R>> {
    try {
      const token = localStorage.getItem('auth_token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      // Ne pas logger les erreurs de connexion en tant qu'erreurs critiques
      if (error instanceof Error && error.name === 'AbortError') {
        console.log(`API ${url}: Timeout de la requête`);
      } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
        console.log(`API ${url}: Serveur inaccessible, utilisation des données locales`);
      } else {
        console.error(`Erreur API ${url}:`, error);
      }
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  // Méthodes CRUD de base
  async getAll(): Promise<ApiResponse<T[]>> {
    // D'abord essayer de charger depuis localStorage pour avoir des données immédiates
    const localData = this.getLocalStorageData();

    // Essayer l'API en arrière-plan pour mettre à jour les données
    this.apiRequest<T[]>(this.endpoint).then(apiResponse => {
      if (apiResponse.success && apiResponse.data) {
        this.setLocalStorageData(apiResponse.data);
      }
    }).catch(error => {
      console.log(`API ${this.endpoint} non disponible, utilisation des données locales:`, error);
    });

    // Retourner les données locales immédiatement
    return { success: true, data: localData };
  }

  async getById(id: string): Promise<ApiResponse<T | undefined>> {
    // D'abord essayer localStorage pour une réponse immédiate
    const localData = this.getLocalStorageData();
    const localItem = localData.find((item: Record<string, unknown>) => item.id === id);

    if (localItem) {
      // Retourner les données locales immédiatement
      const result = { success: true, data: localItem } as ApiResponse<T | undefined>;

      // Essayer de synchroniser avec l'API en arrière-plan
      this.apiRequest<T>(`${this.endpoint}/${id}`).then(apiResponse => {
        if (apiResponse.success && apiResponse.data) {
          // Mettre à jour localStorage avec les données fraîches de l'API
          const updatedLocalData = localData.map(item =>
            (item as Record<string, unknown>).id === id ? apiResponse.data : item
          );
          this.setLocalStorageData(updatedLocalData);
        }
      }).catch(error => {
        console.log(`API ${this.endpoint}/${id} non disponible, utilisation des données locales:`, error);
      });

      return result;
    }

    // Si pas trouvé dans localStorage, essayer l'API
    const apiResponse = await this.apiRequest<T>(`${this.endpoint}/${id}`);
    if (apiResponse.success && apiResponse.data) {
      // Ajouter au localStorage pour les prochaines requêtes
      const localData = this.getLocalStorageData();
      localData.push(apiResponse.data);
      this.setLocalStorageData(localData);
      return apiResponse;
    }

    return { success: false, error: 'Élément non trouvé' };
  }

  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<T>> {
    const newItem = {
      ...item,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as T;

    // D'abord sauvegarder dans localStorage pour une réponse immédiate
    const localData = this.getLocalStorageData();
    localData.push(newItem);
    this.setLocalStorageData(localData);

    // Retourner immédiatement le résultat
    const immediateResult = { success: true, data: newItem } as ApiResponse<T>;

    // Essayer de synchroniser avec l'API en arrière-plan
    this.apiRequest<T>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(item),
    }).then(apiResponse => {
      if (apiResponse.success && apiResponse.data) {
        // Mettre à jour localStorage avec la réponse de l'API (qui contient peut-être un ID généré par le serveur)
        const localData = this.getLocalStorageData();
        const index = localData.findIndex((item: Record<string, unknown>) => item.id === newItem.id);
        if (index !== -1) {
          localData[index] = apiResponse.data;
          this.setLocalStorageData(localData);
        }
      }
    }).catch(error => {
      console.log(`API ${this.endpoint} non disponible pour la création, donnée sauvegardée localement:`, error);
    });

    return immediateResult;
  }

  async update(id: string, updates: Partial<T>): Promise<ApiResponse<T | undefined>> {
    const updatedItem = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // D'abord mettre à jour dans localStorage pour une réponse immédiate
    const localData = this.getLocalStorageData();
    const index = localData.findIndex((item: Record<string, unknown>) => item.id === id);

    if (index === -1) {
      return { success: false, error: 'Élément non trouvé' };
    }

    // Mettre à jour localement
    localData[index] = { ...localData[index], ...updatedItem };
    this.setLocalStorageData(localData);

    // Retourner immédiatement le résultat
    const immediateResult = { success: true, data: localData[index] } as ApiResponse<T | undefined>;

    // Essayer de synchroniser avec l'API en arrière-plan
    this.apiRequest<T>(`${this.endpoint}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedItem),
    }).then(apiResponse => {
      if (apiResponse.success && apiResponse.data) {
        // Mettre à jour localStorage avec la réponse de l'API
        const localData = this.getLocalStorageData();
        const index = localData.findIndex((item: Record<string, unknown>) => item.id === id);
        if (index !== -1) {
          localData[index] = apiResponse.data;
          this.setLocalStorageData(localData);
        }
      }
    }).catch(error => {
      console.log(`API ${this.endpoint}/${id} non disponible pour la mise à jour, donnée mise à jour localement:`, error);
    });

    return immediateResult;
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    // D'abord supprimer dans localStorage pour une réponse immédiate
    const localData = this.getLocalStorageData();
    const filteredData = localData.filter((item: Record<string, unknown>) => item.id !== id);

    if (filteredData.length === localData.length) {
      return { success: false, error: 'Élément non trouvé' };
    }

    // Mettre à jour localStorage immédiatement
    this.setLocalStorageData(filteredData);

    // Retourner immédiatement le résultat
    const immediateResult = { success: true, data: true } as ApiResponse<boolean>;

    // Essayer de synchroniser avec l'API en arrière-plan
    this.apiRequest(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    }).then(apiResponse => {
      if (!apiResponse.success) {
        // Si l'API échoue, restaurer la donnée localement
        const originalItem = localData.find((item: Record<string, unknown>) => item.id === id);
        if (originalItem) {
          const restoredData = this.getLocalStorageData();
          restoredData.push(originalItem);
          this.setLocalStorageData(restoredData);
          console.log(`Échec de la suppression sur l'API, donnée restaurée localement`);
        }
      }
    }).catch(error => {
      console.log(`API ${this.endpoint}/${id} non disponible pour la suppression, donnée supprimée localement:`, error);
    });

    return immediateResult;
  }

  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}