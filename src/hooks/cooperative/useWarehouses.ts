import { useState, useEffect } from 'react';
import { warehouseService, Warehouse, WarehouseAlert } from '@/services/cooperative/warehouseService';

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [alerts, setAlerts] = useState<WarehouseAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    try {
      const warehousesData = warehouseService.getAll();
      const alertsData = warehouseService.getAlerts();

      setWarehouses(warehousesData);
      setAlerts(alertsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Entrepôts
  const createWarehouse = (warehouseData: Parameters<typeof warehouseService.create>[0]) => {
    try {
      const newWarehouse = warehouseService.create(warehouseData);
      setWarehouses(prev => [...prev, newWarehouse]);
      return newWarehouse;
    } catch (err) {
      setError('Erreur lors de la création de l\'entrepôt');
      console.error('Error creating warehouse:', err);
      throw err;
    }
  };

  const updateWarehouse = (id: string, updates: Parameters<typeof warehouseService.update>[1]) => {
    try {
      const updatedWarehouse = warehouseService.update(id, updates);
      if (updatedWarehouse) {
        setWarehouses(prev => prev.map(w => w.id === id ? updatedWarehouse : w));
        return updatedWarehouse;
      }
      throw new Error('Entrepôt non trouvé');
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'entrepôt');
      console.error('Error updating warehouse:', err);
      throw err;
    }
  };

  const deleteWarehouse = (id: string) => {
    try {
      const success = warehouseService.delete(id);
      if (success) {
        setWarehouses(prev => prev.filter(w => w.id !== id));
        return true;
      }
      throw new Error('Entrepôt non trouvé');
    } catch (err) {
      setError('Erreur lors de la suppression de l\'entrepôt');
      console.error('Error deleting warehouse:', err);
      throw err;
    }
  };

  // Zones
  const addZone = (warehouseId: string, zoneData: Parameters<typeof warehouseService.addZone>[1]) => {
    try {
      const newZone = warehouseService.addZone(warehouseId, zoneData);
      if (newZone) {
        setWarehouses(prev => prev.map(warehouse => {
          if (warehouse.id === warehouseId) {
            return {
              ...warehouse,
              zones: [...warehouse.zones, newZone],
              updatedAt: new Date().toISOString()
            };
          }
          return warehouse;
        }));
        return newZone;
      }
      throw new Error('Entrepôt non trouvé');
    } catch (err) {
      setError('Erreur lors de l\'ajout de la zone');
      console.error('Error adding zone:', err);
      throw err;
    }
  };

  const updateZone = (warehouseId: string, zoneId: string, updates: Parameters<typeof warehouseService.updateZone>[2]) => {
    try {
      const updatedZone = warehouseService.updateZone(warehouseId, zoneId, updates);
      if (updatedZone) {
        setWarehouses(prev => prev.map(warehouse => {
          if (warehouse.id === warehouseId) {
            return {
              ...warehouse,
              zones: warehouse.zones.map(zone =>
                zone.id === zoneId ? updatedZone : zone
              ),
              updatedAt: new Date().toISOString()
            };
          }
          return warehouse;
        }));
        return updatedZone;
      }
      throw new Error('Zone non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la zone');
      console.error('Error updating zone:', err);
      throw err;
    }
  };

  const removeZone = (warehouseId: string, zoneId: string) => {
    try {
      const success = warehouseService.removeZone(warehouseId, zoneId);
      if (success) {
        setWarehouses(prev => prev.map(warehouse => {
          if (warehouse.id === warehouseId) {
            return {
              ...warehouse,
              zones: warehouse.zones.filter(zone => zone.id !== zoneId),
              updatedAt: new Date().toISOString()
            };
          }
          return warehouse;
        }));
        return true;
      }
      throw new Error('Zone non trouvée');
    } catch (err) {
      setError('Erreur lors de la suppression de la zone');
      console.error('Error removing zone:', err);
      throw err;
    }
  };

  // Alertes
  const createAlert = (alertData: Parameters<typeof warehouseService.createAlert>[0]) => {
    try {
      const newAlert = warehouseService.createAlert(alertData);
      setAlerts(prev => [...prev, newAlert]);
      return newAlert;
    } catch (err) {
      setError('Erreur lors de la création de l\'alerte');
      console.error('Error creating alert:', err);
      throw err;
    }
  };

  const resolveAlert = (id: string, resolvedBy: string, notes?: string) => {
    try {
      const success = warehouseService.resolveAlert(id, resolvedBy, notes);
      if (success) {
        setAlerts(prev => prev.map(alert =>
          alert.id === id
            ? { ...alert, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy, notes }
            : alert
        ));
        return true;
      }
      throw new Error('Alerte non trouvée');
    } catch (err) {
      setError('Erreur lors de la résolution de l\'alerte');
      console.error('Error resolving alert:', err);
      throw err;
    }
  };

  // Recherche et filtrage
  const searchWarehouses = (query: string) => {
    try {
      return warehouseService.search(query);
    } catch (err) {
      setError('Erreur lors de la recherche des entrepôts');
      console.error('Error searching warehouses:', err);
      return [];
    }
  };

  const filterWarehousesByStatus = (status: string) => {
    try {
      return warehouseService.filterByStatus(status);
    } catch (err) {
      setError('Erreur lors du filtrage des entrepôts');
      console.error('Error filtering warehouses:', err);
      return [];
    }
  };

  const filterWarehousesByType = (type: string) => {
    try {
      return warehouseService.filterByType(type);
    } catch (err) {
      setError('Erreur lors du filtrage des entrepôts');
      console.error('Error filtering warehouses:', err);
      return [];
    }
  };

  // Statistiques
  const getStats = () => {
    try {
      return warehouseService.getStats();
    } catch (err) {
      setError('Erreur lors du calcul des statistiques');
      console.error('Error getting stats:', err);
      return {
        totalWarehouses: 0,
        activeWarehouses: 0,
        totalCapacity: '0 t',
        occupancyRate: '0%',
        newThisMonth: 0,
      };
    }
  };

  const getActiveAlerts = () => {
    try {
      return warehouseService.getActiveAlerts();
    } catch (err) {
      setError('Erreur lors de la récupération des alertes actives');
      console.error('Error getting active alerts:', err);
      return [];
    }
  };

  // Export
  const exportWarehouses = () => {
    try {
      return warehouseService.exportToCSV();
    } catch (err) {
      setError('Erreur lors de l\'export des entrepôts');
      console.error('Error exporting warehouses:', err);
      return '';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    // Données
    warehouses,
    alerts,
    loading,
    error,

    // CRUD Entrepôts
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,

    // Gestion des zones
    addZone,
    updateZone,
    removeZone,

    // Gestion des alertes
    createAlert,
    resolveAlert,

    // Recherche et filtrage
    searchWarehouses,
    filterWarehousesByStatus,
    filterWarehousesByType,

    // Utilitaires
    getStats,
    getActiveAlerts,
    exportWarehouses,
    refresh: loadData,
  };
}